import { supabaseAdmin } from "@/lib/mayatara/supabase";
import { decrypt } from "@/lib/mayatara/encryption";
import { sendMatchEmail, sendNoMatchEmail, sendCronAlertEmail } from "@/lib/mayatara/email";
import { runMatching, buildMatchReason, type MatchProfile } from "@/lib/mayatara/matcher";

// ─── FRIDAY NIGHT MATCHING JOB ───────────────────────────────────────────────
// Runs every Friday at 8pm IST (2:30pm UTC).
// vercel.json: { "crons": [{ "path": "/api/match/find", "schedule": "30 14 * * 5" }] }
// Protected by CRON_SECRET header.
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const secret   = req.headers.get("x-cron-secret") || "";
  const expected = process.env.CRON_SECRET || "";
  const { timingSafeEqual } = await import("crypto");
  const ok = secret.length === expected.length &&
    timingSafeEqual(Buffer.from(secret), Buffer.from(expected));
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Friday-only guard (IST = UTC+5:30)
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  if (nowIST.getUTCDay() !== 5) {
    return Response.json({ skipped: true, reason: "Not Friday IST." });
  }

  if (!supabaseAdmin) {
    await sendCronAlertEmail("Server config error — supabaseAdmin is null.", 0, 0).catch(() => {});
    return Response.json({ error: "Server config error." }, { status: 500 });
  }

  let totalMatched = 0;
  let totalUnmatched = 0;

  try {

  // Fetch all active unmatched profiles joined with user demographics
  const { data: rows, error } = await supabaseAdmin
    .from("profiles")
    .select(`
      id, user_id, looking_for, profile_json, contact_encrypted, contact_type,
      users!inner(name, gender, dob, height, city, religion, mother_tongue, profession)
    `)
    .eq("is_active", true)
    .eq("matched", false);

  if (error) {
    await sendCronAlertEmail(error.message, 0, 0).catch(console.error);
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!rows || rows.length < 2) {
    await sendCronAlertEmail("", 0, 0).catch(console.error);
    return Response.json({ matched: 0 });
  }

  // Flatten joined user data onto profile
  const profiles: MatchProfile[] = rows.map((r: Record<string, unknown>) => {
    const u = r.users as Record<string, string>;
    return {
      id:                r.id as string,
      user_id:           r.user_id as string,
      looking_for:       r.looking_for as string,
      profile_json:      r.profile_json as Record<string, string>,
      contact_encrypted: r.contact_encrypted as string,
      contact_type:      r.contact_type as string,
      name:              u.name,
      gender:            u.gender,
      dob:               u.dob,
      city:              u.city,
      religion:          u.religion,
      mother_tongue:     u.mother_tongue,
      profession:        u.profession,
      height:            u.height,
    };
  });

  // Group by looking_for, run matching per category
  const groups: Record<string, MatchProfile[]> = {};
  for (const p of profiles) {
    if (!groups[p.looking_for]) groups[p.looking_for] = [];
    groups[p.looking_for].push(p);
  }

  const matchedUserIds = new Set<string>();

  for (const [category, pool] of Object.entries(groups)) {
    if (pool.length < 2) continue;

    const pairs = runMatching(pool);

    for (const { a, b, score } of pairs) {
      // Skip if already matched in another category (shouldn't happen but guard anyway)
      if (matchedUserIds.has(a.user_id) || matchedUserIds.has(b.user_id)) continue;

      // Idempotency check — don't re-match an existing pair
      const { data: existing } = await supabaseAdmin
        .from("matches")
        .select("id")
        .or(`and(profile_a.eq.${a.id},profile_b.eq.${b.id}),and(profile_a.eq.${b.id},profile_b.eq.${a.id})`)
        .maybeSingle();
      if (existing) continue;

      const reason = buildMatchReason(a, b, category);

      const { error: matchErr } = await supabaseAdmin.from("matches").insert({
        profile_a: a.id, profile_b: b.id, score, match_reason: reason,
      });
      if (matchErr) continue;

      await supabaseAdmin.from("profiles").update({ matched: true }).in("id", [a.id, b.id]);

      const contactA = decrypt(a.contact_encrypted);
      const contactB = decrypt(b.contact_encrypted);

      // Write dashboard notifications
      await Promise.all([
        supabaseAdmin.from("notifications").insert({
          user_id: a.user_id, type: "match",
          title: `Your Friday match — ${b.name}`,
          body: reason,
          contact_revealed: contactB,
          contact_type: b.contact_type,
          match_name: b.name,
          matched_user_id: b.user_id,
        }),
        supabaseAdmin.from("notifications").insert({
          user_id: b.user_id, type: "match",
          title: `Your Friday match — ${a.name}`,
          body: reason,
          contact_revealed: contactA,
          contact_type: a.contact_type,
          match_name: a.name,
          matched_user_id: a.user_id,
        }),
      ]);

      // Send emails
      const { data: authA } = await supabaseAdmin.auth.admin.getUserById(a.user_id);
      const { data: authB } = await supabaseAdmin.auth.admin.getUserById(b.user_id);

      await Promise.allSettled([
        authA?.user?.email && sendMatchEmail(authA.user.email, a.name, b.name, contactB, b.contact_type, reason),
        authB?.user?.email && sendMatchEmail(authB.user.email, b.name, a.name, contactA, a.contact_type, reason),
      ]);

      matchedUserIds.add(a.user_id);
      matchedUserIds.add(b.user_id);
      totalMatched++;
    }
  }

  // Notify everyone still unmatched
  const unmatched = profiles.filter(p => !matchedUserIds.has(p.user_id));
  totalUnmatched = unmatched.length;
  for (const p of unmatched) {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(p.user_id);

    await supabaseAdmin.from("notifications").insert({
      user_id: p.user_id, type: "no_match",
      title: "No match this Friday — we're still looking.",
      body: "Nobody in the current pool was the right fit this week. We run again next Friday.",
    });

    if (authUser?.user?.email) {
      await sendNoMatchEmail(authUser.user.email, p.name).catch(console.error);
    }
  }

  // Success alert to admin
  await sendCronAlertEmail("", totalMatched, totalUnmatched).catch(console.error);

  return Response.json({ matched: totalMatched, no_match_notified: totalUnmatched });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[cron] fatal:", msg);
    await sendCronAlertEmail(msg, totalMatched, totalUnmatched).catch(console.error);
    return Response.json({ error: "Cron failed.", detail: msg }, { status: 500 });
  }
}
