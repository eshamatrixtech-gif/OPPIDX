import Link from 'next/link'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'var(--pin)', marginBottom: 8, fontFamily: 'var(--font-mono)',
      }}>
        ◆ {title}
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Our Philosophy — OppIDX',
  description: 'On access, on honesty, on what automation actually is.',
}

export default function PhilosophyPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
          ← Back to OppIDX
        </Link>

        <div className="card-box" style={{ marginTop: 20, padding: '36px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ color: 'var(--pin)', marginBottom: 14, fontFamily: 'var(--font-mono)', letterSpacing: 8 }}>◆ ✦ ◆</div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 5vw, 30px)',
              lineHeight: 1.35, color: 'var(--ink)', textTransform: 'uppercase',
            }}>
              On access.<br />
              <span style={{ color: 'var(--pin)' }}>On honesty.</span><br />
              On what automation actually is.
            </h1>
          </div>

          <Section title="On access">
            <p>
              The opportunities that actually change someone's trajectory — the internship that becomes a
              career, the grant that funds the first version of an idea, the fellowship that opens a door
              nobody else would open — are rarely posted where everyone can see them. They circulate in
              private Discords, insider newsletters, alumni networks, group chats you have to already be in.
            </p>
            <p>
              That's not a meritocracy. That's a rolodex. The information exists; it's just gated by who
              you happen to know — not by who's actually ambitious enough to go after it.
            </p>
          </Section>

          <Section title="On honesty">
            <p>
              We don't inflate the numbers on this page. The counts you see are pulled live from the same
              database that powers the board — not a marketing figure, not a round number that sounds
              impressive. If a source stops publishing a listing, it comes down.
            </p>
            <p>
              The Subscribers and Opportunity Viewers counts both include
              people reached offline — at school and college campus drives, not on this website — added by
              hand, honestly, on top of the live numbers. We're telling you that plainly instead of quietly
              folding it in. See /terms for the full accounting.
            </p>
            <p>
              If we don't know something about a listing — exact eligibility, what to prepare — we leave it
              blank. We'd rather show you less than show you something we made up.
            </p>
          </Section>

          <Section title="On standards">
            <p>
              This is a curated collection, not an open bulletin board. Every listing that reaches the board —
              whether it arrived through the scraper or was submitted by hand — is held to the same bar:
              nothing illegal, nothing suggestive, nothing that reads like bait. A listing gets exactly one
              link, and it goes straight to the organization's own application page — secure, direct, nothing
              shortened or redirected. Nothing else. No phone numbers. No @handles. No "DM us to apply." No
              email address standing in for a real process. If the only way to "apply" is to message someone,
              it isn't a listing here — it's a contact request, and we don't carry those.
            </p>
          </Section>

          <Section title="On timing">
            <p>
              We don't work with deadlines. We work with opportunities. You won't find countdown timers or
              "closing soon" pressure here — just the fact that something real exists, and a link to go find
              out more on the source's own terms.
            </p>
            <p>
              Whether it's due tomorrow or next year isn't ours to weigh in on. The rest — going after it — is
              yours: your merit, your ambition, your timing.
            </p>
          </Section>

          <Section title="On what automation actually is">
            <p>
              We want to be honest about what the automation behind this site can and can't do — and, just as
              important, what it's allowed to touch. Every hour, it checks a short, fixed list of real,
              already-vetted public sources — job boards, hackathon platforms, government grant databases,
              community-maintained lists, and companies' own career-page APIs — for anything new, and adds it
              using plain, fixed rules. Nobody reviews those listings one by one before they go up. They don't
              need to: the trust was already spent vetting the source itself, once, not re-litigated per listing.
            </p>
            <p>
              That trust does not extend to a stranger with a browser. Anyone submitting a listing from outside
              that fixed list — the paid submission route — gets no such pass. Every one of those is read by an
              actual person before it's allowed anywhere near the board, and paying for that review buys the
              review, never the outcome.
            </p>
            <p>
              What's constant across both paths: there is no AI writing, guessing, embellishing, or deciding
              what's "genuine" anywhere in this pipeline. It cannot judge whether you're a good fit, and it
              cannot know anything a source didn't already publish. The judgment — what's real, what clears the
              bar, what doesn't — is made by a person or it isn't made at all.
            </p>
          </Section>

          <div style={{ textAlign: 'center', margin: '34px 0 30px', fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--pin)', fontStyle: 'italic' }}>
            "The rest is yours."
          </div>

          <Section title="On cost">
            <p>
              Keeping this list this clean isn't free, and we're not going to pretend it is. Full search is a
              subscription, not a growth-hack "free trial." Listing something here costs the person submitting
              it, not just us — because a fee is the simplest filter against noise that a human still has to
              review either way. We are not chasing volume or ad revenue. We would rather have a smaller,
              genuinely elite collection than a large noisy one.
            </p>
          </Section>

          <Section title="Why we built this">
            <p>
              Because people who are smart, capable, and doing everything right still miss opportunities
              simply because nobody forwarded them the email. Because the alternatives — paid newsletters,
              scattered spreadsheets, whoever's Twitter you happen to follow — all have their own gates.
            </p>
            <p>
              We built OppIDX because we believe that putting real, hand-checked opportunities in one honest
              place — not the biggest place, the most honest one — can change who finds them. Built brick by
              brick, for the ambitious ones willing to pay a little to be taken seriously.
            </p>
          </Section>

          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <div style={{ color: 'var(--pin)', marginBottom: 20, fontFamily: 'var(--font-mono)', letterSpacing: 8 }}>◆ ✦ ◆</div>
            <Link href="/browse" style={{
              display: 'inline-block', padding: '13px 26px', borderRadius: 2,
              background: 'var(--btn-bg)', color: 'var(--btn-text)', textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13.5, letterSpacing: '0.02em',
              boxShadow: '4px 4px 0 var(--shadow)',
            }}>
              ◆ Browse the board
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
