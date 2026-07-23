"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ApsaraDancer, LoveCouple, LotusBlossom } from "./components/SculptureAnim";
import { supabase } from "@/lib/mayatara/supabase";

const TYPES = [
  { label: "Dating",              desc: "Meet someone real." },
  { label: "Friendship",          desc: "Find your person." },
  { label: "Co-founder",          desc: "Build together." },
  { label: "Wedding",            desc: "For keeps." },
  { label: "Still Figuring Out",  desc: "Start honest." },
];
const DECO = ["◆", "✦", "❋", "◈", "✧", "❋", "◆", "✦"];

function useNextFriday() {
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    function calc() {
      const now = new Date();
      // Next Friday 8pm IST = UTC+5:30 → 14:30 UTC
      const day = now.getUTCDay(); // 0=Sun…5=Fri
      const daysUntilFri = day <= 5 ? 5 - day : 6;
      const next = new Date(now);
      next.setUTCDate(now.getUTCDate() + (daysUntilFri === 0 && now.getUTCHours() >= 14 && now.getUTCMinutes() >= 30 ? 7 : daysUntilFri));
      next.setUTCHours(14, 30, 0, 0);
      const diff = next.getTime() - now.getTime();
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);
  return countdown;
}

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);
  const countdown = useNextFriday();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from("users").select("name").eq("id", session.user.id).single()
          .then(({ data }) => { if (data) setUserName(data.name); });
      }
    });
  }, []);

  return (
    <div className="mayatara-scope min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <div className="w-full text-center py-1 text-xs tracking-widest font-typewriter"
        style={{ background: "var(--maroon)", color: "#FAF0D7" }}>
        ◆ &nbsp; FOR THE REAL ONES &nbsp; ◆ &nbsp; FIND THE REAL ONE &nbsp; ◆ &nbsp; EVERY FRIDAY &nbsp; ◆
      </div>

      <header className="relative z-10 border-b-2" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/mayatara-logo.png" alt="The Mayatara" width={88} height={88} style={{ objectFit: "contain", width: "auto" }} />
            <div>
              <h1 className="font-typewriter text-2xl tracking-wider" style={{ color: "var(--saffron)", lineHeight: 1 }}>THE MAYATARA</h1>
              <p className="text-xs tracking-widest" style={{ color: "var(--ink-muted)" }}>FIND YOUR PERSON</p>
            </div>
          </div>
          <nav className="flex items-center gap-3 flex-wrap justify-end">
            {userName ? (
              <>
                <span className="text-xs font-typewriter" style={{ color: "var(--ink-muted)" }}>Welcome back, {userName}</span>
                <Link href="/mayatara/dashboard" className="btn-primary text-sm">◆ My Dashboard</Link>
              </>
            ) : (
              <>
                <Link href="/mayatara/register" className="btn-primary text-sm">Create Account</Link>
                <Link href="/mayatara/login" className="btn-secondary text-sm">Log In</Link>
              </>
            )}
            <Link href="/mayatara/compatibility" className="btn-secondary text-sm">Compatibility Check</Link>
          </nav>
        </div>
      </header>

      <div className="w-full py-2 flex items-center justify-center gap-8 text-base"
        style={{ borderBottom: "1px solid var(--border)", color: "var(--border)" }}>
        {DECO.map((s, i) => <span key={i}>{s}</span>)}
      </div>

      <main className="flex-1 relative z-10">

        {/* HERO */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center relative overflow-hidden">

          {/* Apsara left */}
          <div className="absolute left-0 top-8 pointer-events-none select-none hidden md:block" style={{ opacity: 0.13 }}>
            <ApsaraDancer style={{ height: "280px", color: "var(--saffron)" }} />
          </div>
          {/* Lotus right */}
          <div className="absolute right-4 bottom-4 pointer-events-none select-none hidden md:block" style={{ opacity: 0.12 }}>
            <LotusBlossom style={{ height: "100px", color: "var(--border)" }} />
          </div>

          {/* Badge */}
          <div className="inline-block mb-6 px-4 py-1 font-typewriter text-xs tracking-widest stamp-border"
            style={{ color: "var(--maroon)", borderColor: "var(--maroon)", boxShadow: "3px 3px 0 var(--maroon)" }}>
            MADE IN INDIA, FOR THE WORLD
          </div>

          {/* Hero heading */}
          <h2 className="font-typewriter text-5xl md:text-7xl leading-tight mb-4 cursor-blink"
            style={{ color: "var(--ink)" }}>
            REAL.<br />
            <span style={{ color: "var(--saffron)" }}>MESSY.</span><br />
            YOURS.
          </h2>

          {/* Friday line */}
          <p className="font-typewriter text-3xl md:text-5xl mb-6 tracking-wide leading-tight"
            style={{ color: "var(--maroon)", textShadow: "2px 2px 0 rgba(139,26,26,0.15)" }}>
            FIND YOUR PERSON.<br />
            <span style={{ color: "var(--saffron)" }}>EVERY FRIDAY.</span>
          </p>

          {/* Countdown */}
          <div className="inline-flex flex-col items-center mb-8 px-6 py-3"
            style={{ border: "2px solid var(--saffron)", background: "var(--card)", boxShadow: "3px 3px 0 var(--saffron)" }}>
            <span className="text-xs font-typewriter tracking-widest mb-1" style={{ color: "var(--ink-muted)" }}>
              NEXT MATCH DROPS IN
            </span>
            <span className="font-typewriter text-2xl md:text-3xl tracking-wider" style={{ color: "var(--saffron)" }}>
              {countdown || "—"}
            </span>
          </div>

          {/* The box — untouched */}
          <div className="card max-w-2xl mx-auto p-6 mb-8"
            style={{ borderColor: "var(--saffron)", boxShadow: "5px 5px 0 var(--saffron)" }}>
            <p className="font-typewriter text-lg md:text-xl leading-relaxed" style={{ color: "var(--ink)" }}>
              Answer 5 honest questions.<br />
              We find your person.<br />
              You get their contact.
            </p>
            <p className="text-sm mt-3" style={{ color: "var(--ink-muted)" }}>
              Dating · Friendship · Co-founder · Wedding · Or just figuring it out.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/mayatara/register" className="btn-primary text-base px-8 py-3">◆ &nbsp; Create Account — It&apos;s Free</Link>
            <Link href="/mayatara/compatibility" className="btn-secondary text-base px-8 py-3">✦ &nbsp; Check Compatibility</Link>
          </div>

          {/* Friday explanation — no negativity */}
          <div className="max-w-xl mx-auto p-5 text-left"
            style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
            <p className="font-typewriter text-xs tracking-widest mb-2" style={{ color: "var(--saffron)" }}>
              ◆ HOW FRIDAY WORKS
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              Every Friday night, our AI runs through the full pool and finds the single best match
              for each person. One match. Chosen by the AI.
            </p>
          </div>

        </section>

        {/* INSTITUTION MATCHING BANNER */}
        <section className="py-10" style={{ background: "var(--card)", borderTop: "2px solid var(--saffron)", borderBottom: "2px solid var(--saffron)" }}>
          <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-typewriter text-xs tracking-widest mb-2" style={{ color: "var(--saffron)" }}>◆ MATCHED WITHIN YOUR WORLD</div>
              <h3 className="font-typewriter text-xl md:text-2xl tracking-wide" style={{ color: "var(--ink)" }}>
                WE MATCH WITHIN YOUR INSTITUTION.
              </h3>
              <p className="text-sm mt-2 max-w-lg" style={{ color: "var(--ink-muted)" }}>
                IIT to IIT. BITS to BITS. Ashoka to Ashoka. Microsoft to Microsoft. If your college or workplace is in our pool, we prioritise matches who already share your world — same campus, same company, same city.
              </p>
            </div>
            <div className="flex-shrink-0 text-center px-8 py-5 font-typewriter"
              style={{ border: "2px solid var(--saffron)", boxShadow: "4px 4px 0 var(--saffron)", background: "var(--bg)" }}>
              <div className="text-3xl mb-1" style={{ color: "var(--saffron)" }}>◆</div>
              <div className="text-xs tracking-widest" style={{ color: "var(--ink-muted)" }}>SHARED CONTEXT.</div>
              <div className="text-xs tracking-widest" style={{ color: "var(--ink-muted)" }}>REAL CHEMISTRY.</div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS — 4 steps, no jargon */}
        <section className="py-16" style={{ background: "var(--bg-dark)", borderTop: "2px solid var(--border)", borderBottom: "2px solid var(--border)" }}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="gem-divider mb-10 text-sm">◆ HOW IT WORKS ◆</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { n: "01", title: "CREATE ACCOUNT", desc: "Email and password. No Google. No tracking. 30 seconds." },
                { n: "02", title: "ANSWER 5 QUESTIONS", desc: "Real questions. Who you are. What you need. What you won't put up with." },
                { n: "03", title: "EVERY FRIDAY NIGHT", desc: "Matches run once a week — Friday nights. If we find your person, you hear from us. If we don't, we tell you that too. No silence." },
                { n: "04", title: "YOU GET THEIR CONTACT", desc: "Phone, Instagram, WhatsApp — whatever they chose to share. We step back. You take it from here." },
              ].map(s => (
                <div key={s.n} className="card p-5 relative">
                  <div className="absolute -top-3 -left-1 font-typewriter text-4xl font-bold opacity-10"
                    style={{ color: "var(--saffron)" }}>{s.n}</div>
                  <h3 className="font-typewriter text-xs tracking-wide mb-2 mt-3" style={{ color: "var(--saffron)" }}>{s.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--ink-muted)" }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT YOU'RE LOOKING FOR */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="gem-divider mb-10 text-sm">◆ WHAT ARE YOU LOOKING FOR ◆</div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {TYPES.map((t, i) => (
              <Link key={t.label} href={`/mayatara/register`}
                className="p-5 text-center transition-all"
                style={{
                  background: "var(--card)",
                  border: `2px solid ${i === 0 ? "var(--saffron)" : "var(--border)"}`,
                  boxShadow: i === 0 ? "3px 3px 0 var(--saffron)" : "3px 3px 0 var(--border)",
                  textDecoration: "none",
                } as React.CSSProperties}>
                <div className="font-typewriter text-sm mb-1" style={{ color: i === 0 ? "var(--saffron)" : "var(--ink)" }}>
                  {t.label}
                </div>
                <div className="text-xs" style={{ color: "var(--ink-muted)" }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* PRIVACY — the differentiator */}
        <section className="py-14" style={{ background: "var(--bg-dark)", borderTop: "2px solid var(--border)", borderBottom: "2px solid var(--border)" }}>
          <div className="max-w-3xl mx-auto px-6">
            <div className="gem-divider mb-10 text-sm">◆ PRIVACY IS NOT A FEATURE. IT&apos;S THE POINT. ◆</div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { sym: "◆", title: "NO GOOGLE LOGIN", desc: "We don't know your browsing history. We don't want to. Email and password only." },
                { sym: "✦", title: "ENCRYPTED CONTACTS", desc: "Your phone number is encrypted with AES-256. We literally cannot read it — until your match is confirmed." },
                { sym: "❋", title: "WE DON'T HOST CHATS", desc: "Once you have their number, the conversation is yours. We're not in the room." },
              ].map(p => (
                <div key={p.title} className="card p-5">
                  <div className="text-2xl mb-3" style={{ color: "var(--saffron)" }}>{p.sym}</div>
                  <h4 className="font-typewriter text-xs tracking-wide mb-2" style={{ color: "var(--ink)" }}>{p.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--ink-muted)" }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NOT TINDER. NOT SHAADI. */}
        <section className="py-16 relative overflow-hidden" style={{ background: "var(--bg-dark)", borderTop: "2px solid var(--border)", borderBottom: "2px solid var(--border)" }}>
          {/* Decorative Apsara — ghost watermark right edge */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none select-none pr-2 hidden lg:flex" style={{ opacity: 0.08 }}>
            <ApsaraDancer style={{ height: "340px", color: "var(--saffron)" }} />
          </div>
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <div className="gem-divider mb-10 text-sm">◆ WHAT MAKES US DIFFERENT ◆</div>
            <div className="text-center mb-10">
              <h3 className="font-typewriter text-2xl md:text-3xl tracking-wide" style={{ color: "var(--ink)" }}>
                WE ARE NOT TINDER.<br />
                WE ARE NOT BUMBLE.<br />
                WE ARE NOT A MATRIMONY APP.
              </h3>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  label: "TINDER / BUMBLE",
                  sym: "✗", symColor: "var(--maroon)", headerColor: "var(--maroon)",
                  points: [
                    "Infinite scroll. Infinite options.",
                    "You swipe 300 people a week.",
                    "Ghosting is the default.",
                    "The app needs you to stay single.",
                    "Designed for dopamine, not decisions.",
                  ],
                },
                {
                  label: "MATRIMONY APPS",
                  sym: "✗", symColor: "var(--ink-muted)", headerColor: "var(--ink-muted)",
                  points: [
                    "Biodata disguised as a profile.",
                    "Caste, salary, skin tone first.",
                    "Your parents do the matching.",
                    "Pay ₹5000 to message someone.",
                    "You're a listing, not a person.",
                  ],
                },
                {
                  label: "THE MAYATARA",
                  sym: "✓", symColor: "var(--green)", headerColor: "var(--saffron)",
                  highlight: true,
                  points: [
                    "One match. Every Friday. That's it.",
                    "We interview you. You're not a form.",
                    "Our AI matches on who you actually are.",
                    "Free. No subscription. No biodata.",
                    "We give you the contact. We leave.",
                  ],
                },
              ].map((col) => (
                <div key={col.label} className="card p-6"
                  style={{
                    borderColor: col.highlight ? "var(--saffron)" : "var(--border)",
                    boxShadow: col.highlight ? "5px 5px 0 var(--saffron)" : "5px 5px 0 var(--border)",
                  }}>
                  <div className="font-typewriter text-xs tracking-widest mb-5 pb-3"
                    style={{ color: col.headerColor, borderBottom: "1px solid var(--border)" }}>
                    {col.label}
                  </div>
                  <ul className="flex flex-col gap-3">
                    {col.points.map((p, i) => (
                      <li key={i} className="text-sm flex gap-2" style={{ color: "var(--ink)" }}>
                        <span style={{ color: col.symColor, flexShrink: 0, fontWeight: "bold" }}>{col.sym}</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sculpture interlude */}
        <div className="flex items-center justify-center gap-12 py-8" style={{ opacity: 0.35 }}>
          <LotusBlossom style={{ height: "56px", color: "var(--border)" }} />
          <LoveCouple style={{ height: "120px", color: "var(--saffron)" }} />
          <LotusBlossom style={{ height: "56px", color: "var(--border)" }} />
        </div>

        {/* THE HONEST SECTION */}
        <section className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="text-3xl mb-6" style={{ color: "var(--saffron)" }}>◆</div>
          <h3 className="font-typewriter text-2xl mb-5" style={{ color: "var(--ink)" }}>
            WE&apos;RE NOT CODING LOVE.<br />
            WE&apos;RE JUST ASKING BETTER QUESTIONS.
          </h3>
          <p className="text-base leading-relaxed mb-4" style={{ color: "var(--ink-muted)" }}>
            Every other app gives you a thousand profiles to scroll through.
            You get tired. You get cynical. You stop believing anyone real is on there.
          </p>
          <p className="text-base leading-relaxed mb-4" style={{ color: "var(--ink)" }}>
            The Mayatara gives you one match. We tell you why. You get their contact.
            What happens next has nothing to do with us.
          </p>
          <p className="font-serif-india text-lg italic" style={{ color: "var(--saffron)" }}>
            &ldquo;The rest is yours.&rdquo;
          </p>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto px-6 pb-20 text-center">
          <div className="card p-10" style={{ borderColor: "var(--saffron)", boxShadow: "6px 6px 0 var(--saffron)" }}>
            <div className="text-3xl mb-4" style={{ color: "var(--saffron)" }}>◆</div>
            <h3 className="font-typewriter text-xl mb-3" style={{ color: "var(--ink)" }}>
              DONE WITH HALF-MEASURES?
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>
              5 questions. One match. Every Friday.<br/>
              No noise in between.
            </p>
            <Link href="/mayatara/register" className="btn-primary text-base px-8 py-3">◆ &nbsp; Let&apos;s Begin</Link>

            {/* Terms + Philosophy — small, visible, before they sign up */}
            <div className="flex gap-3 justify-center mt-6 flex-wrap">
              <Link href="/mayatara/philosophy"
                className="font-typewriter text-xs px-4 py-2 tracking-wide"
                style={{ border: "1px solid var(--saffron)", color: "var(--saffron)", textDecoration: "none" }}>
                ✦ Our Philosophy
              </Link>
              <Link href="/mayatara/terms"
                className="font-typewriter text-xs px-4 py-2 tracking-wide"
                style={{ border: "1px solid var(--border)", color: "var(--ink-muted)", textDecoration: "none" }}>
                ◆ Terms & Privacy
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 py-6 text-center text-xs tracking-widest"
        style={{ borderColor: "var(--border)", color: "var(--ink-muted)", background: "var(--card)" }}>
        <div className="flex justify-center gap-4 text-base mb-3" style={{ color: "var(--border)" }}>
          {DECO.slice(0, 5).map((s, i) => <span key={i}>{s}</span>)}
        </div>
        <Image src="/mayatara-logo.png" alt="The Mayatara" width={32} height={32} style={{ objectFit: "contain", display: "inline-block", marginBottom: "8px" }} /><br />
        THE MAYATARA · FOR THE REAL ONES · FREE FOREVER · MADE IN INDIA<br />
        <span className="inline-block mt-1 opacity-60">DESIGNED BY SILICON VALLEY ALUMNI</span><br />
        <span className="mt-1 inline-block">
          <Link href="/mayatara/register" style={{ color: "var(--saffron)", textDecoration: "none" }}>Create Account</Link>
          &nbsp;·&nbsp;
          <Link href="/mayatara/login" style={{ color: "var(--ink-muted)", textDecoration: "none" }}>Log In</Link>
          &nbsp;·&nbsp;
          <Link href="/mayatara/compatibility" style={{ color: "var(--ink-muted)", textDecoration: "none" }}>Compatibility Check</Link>
          &nbsp;·&nbsp;
          <Link href="/mayatara/terms" style={{ color: "var(--ink-muted)", textDecoration: "none" }}>Terms & Privacy</Link>
          &nbsp;·&nbsp;
          <Link href="/mayatara/philosophy" style={{ color: "var(--ink-muted)", textDecoration: "none" }}>Our Philosophy</Link>
          &nbsp;·&nbsp;
          <Link href="/" style={{ color: "var(--saffron)", textDecoration: "none" }}>Find Real Work — OppIDX</Link>
        </span>
      </footer>
    </div>
  );
}
