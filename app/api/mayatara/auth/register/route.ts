import { supabaseAdmin } from "@/lib/mayatara/supabase";
import { encrypt } from "@/lib/mayatara/encryption";
import { rateLimit, getIP, rateLimitResponse, sanitise, isValidEmail, isStrongPassword, checkSize } from "@/lib/mayatara/security";
import { checkContentSafety } from "@/lib/mayatara/moderation";

const ALLOWED_TYPES = ["Dating", "Friendship", "Co-founder", "Wedding", "Still Figuring Out"];

export async function POST(req: Request) {
  // ── Size guard ──────────────────────────────────────────────────────────────
  const sizeErr = checkSize(req, 16_384);
  if (sizeErr) return sizeErr;

  // ── India-only registration ─────────────────────────────────────────────────
  // Vercel sets x-vercel-ip-country on all requests automatically.
  const country = req.headers.get("x-vercel-ip-country") || "IN"; // fallback IN for local dev
  if (country !== "IN") {
    return Response.json(
      { error: "The Mayatara is currently open for registration in India only. You can still explore the app." },
      { status: 403 }
    );
  }

  // ── Rate limit: 5 registrations per IP per hour ─────────────────────────────
  const ip = getIP(req);
  const rl = rateLimit("register", ip, 5, 60 * 60_000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  try {
    const body = await req.json();

    // ── Sanitise every string input ─────────────────────────────────────────
    const name         = sanitise(body.name);
    const email        = sanitise(body.email).toLowerCase();
    const password     = typeof body.password === "string" ? body.password.slice(0, 128) : "";
    const lookingFor   = sanitise(body.lookingFor);
    const dob          = sanitise(body.dob);
    const gender       = sanitise(body.gender);
    const height       = sanitise(body.height);
    const city         = sanitise(body.city);
    const religion     = sanitise(body.religion);
    const profession   = sanitise(body.profession);
    const mother_tongue = sanitise(body.mother_tongue);
    const institution  = sanitise(body.institution);
    const quirky_fact  = sanitise(body.quirky_fact);

    // ── Validate required fields ────────────────────────────────────────────
    if (!name || !email || !password || !lookingFor) {
      return Response.json({ error: "Name, email, password and what you're looking for are required." }, { status: 400 });
    }
    if (name.length < 2 || name.length > 100) {
      return Response.json({ error: "Name must be 2–100 characters." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return Response.json({ error: "Invalid email address." }, { status: 400 });
    }
    const pwCheck = isStrongPassword(password);
    if (!pwCheck.ok) {
      return Response.json({ error: pwCheck.reason }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(lookingFor)) {
      return Response.json({ error: "Invalid relationship type." }, { status: 400 });
    }

    // ── Screen for violent / sexually explicit content ──────────────────────
    const modCheck = await checkContentSafety([name, quirky_fact]);
    if (modCheck.flagged) {
      return Response.json({ error: "Your submission couldn't be processed — please keep your profile respectful and free of explicit or violent content." }, { status: 400 });
    }

    // ── Age check server-side ───────────────────────────────────────────────
    if (dob) {
      const age = (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (isNaN(age) || age < 18) {
        return Response.json({ error: "You must be 18 or older to use The Mayatara." }, { status: 400 });
      }
      if (age > 120) {
        return Response.json({ error: "Invalid date of birth." }, { status: 400 });
      }
    }

    if (!supabaseAdmin) {
      return Response.json({ error: "Server error." }, { status: 500 });
    }

    // ── Create auth user ────────────────────────────────────────────────────
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError) {
      if (authError.message.toLowerCase().includes("already")) {
        return Response.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      throw authError;
    }

    const userId = authData.user.id;

    // ── Store user record ────────────────────────────────────────────────────
    const { error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        id: userId, name, looking_for: lookingFor,
        dob: dob || null, gender: gender || null, height: height || null,
        city: city || null, religion: religion || null, profession: profession || null,
        mother_tongue: mother_tongue || null, institution: institution || null,
        quirky_fact: quirky_fact || null,
        phone_encrypted: encrypt(""),
      });

    if (userError) {
      // Fallback: minimal insert if new columns don't exist yet in schema
      const { error: fallbackError } = await supabaseAdmin.from("users").insert({
        id: userId, name, looking_for: lookingFor, phone_encrypted: encrypt(""),
      });
      if (fallbackError) {
        // Users row failed — clean up the auth user so state stays consistent
        await supabaseAdmin.auth.admin.deleteUser(userId).catch(console.error);
        throw new Error("Failed to create user record.");
      }
    }

    return Response.json({ success: true, userId });
  } catch (e) {
    console.error("[register]", e instanceof Error ? e.message : "unknown");
    // Never leak internal error details
    return Response.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
