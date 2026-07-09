import Link from 'next/link'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'var(--pin)', marginBottom: 8, fontFamily: 'var(--font-mono)',
      }}>
        ◆ {title}
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Terms & Privacy — OppIDX',
  description: 'Plain English. No legal theatre.',
}

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
          ← Back to OppIDX
        </Link>

        <div className="card-box" style={{ marginTop: 20, padding: '36px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ color: 'var(--pin)', marginBottom: 14 }}>◆</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: 8 }}>
              Terms &amp; Privacy Policy
            </h1>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
              Plain English. No legal theatre.
            </p>
          </div>

          <Section title="What this is">
            OppIDX is a free, public directory of internships, scholarships, fellowships, grants, and
            competitions. It is not a recruiter, not an application service, and not affiliated with any
            organization listed here. It is an index — a pointer to real opportunities elsewhere on the web.
          </Section>

          <Section title="We are not responsible for what happens next">
            When you click "Apply," you leave OppIDX and deal directly with that organization. We have no
            role in their selection process, no visibility into your application, and no ability to intervene
            on your behalf. Any outcome of an application — positive or negative — is between you and them,
            not us.
          </Section>

          <Section title="We are not a support desk">
            We have no customer support line, no dispute resolution process, and no mediation between you and
            any organization listed. We also don't provide prep materials, coaching, or application review —
            you'll need to prepare for each opportunity on your own. If something about an application process
            goes wrong, that's between you and the organization running it.
          </Section>

          <Section title="How listings get here">
            Two ways. First, a native scraper built into this site checks a fixed set of real public sources
            (job boards, hackathon platforms, government grant databases, community-maintained listings, and
            individual companies' own career-page APIs) automatically, on an hourly schedule. It maps what
            those sources publish onto plain, deterministic rules — no AI writes or invents any part of a
            listing. Where a source doesn't state something (like eligibility), we leave that field blank
            rather than guess. Second, listings are occasionally added by hand after being checked directly
            against the organization's own page.
          </Section>

          <Section title="No guarantees">
            Listings can go stale between checks. Deadlines, eligibility, and compensation are set by the
            organization running the program, not by us, and can change without notice on their end. Always
            confirm the details that matter to you on the organization's own page before relying on anything
            you read here.
          </Section>

          <Section title="Your data">
            We collect only what you give us. If you enter your email to join the newsletter, we store that
            email and nothing else attached to it — no profile, no tracking cookie, no behavioral history. Page
            views on individual listings are counted in aggregate as a single running number, not tied to any
            visitor's identity. We do not sell data, and we do not share your email with anyone outside
            OppIDX.
          </Section>

          <Section title="Who can use this">
            Anyone can browse OppIDX — no account or login is required to see listings. The only login on
            this site belongs to the site's own admin account, used to manage and verify listings; it is not a
            general user-registration system.
          </Section>

          <Section title="Governing law">
            These Terms are governed by the laws of India. Any dispute arising from your use of OppIDX is
            subject to Indian law.
          </Section>

          <Section title="Changes">
            We may update these terms as the site changes. We'll update the date below when we do.
            Continuing to use OppIDX after a change means you accept the current version.
          </Section>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20, marginTop: 30, textAlign: 'center' }}>
            <p style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
              Last updated: July 2026 · OppIDX is free, forever.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
