import { NextRequest, NextResponse } from 'next/server'

const COOKIE  = 'oppidx_session'
const SECRET  = process.env.SESSION_SECRET ?? 'dev_fallback_secret'
const MAX_AGE = 60 * 60 * 24 * 30 * 1000  // 30 days

/* ── In-edge rate limiter (auth endpoints only) ─────────────────
   Keyed by IP + route.  Max 10 attempts per 15 min window; locks 30 min.
   Uses globalThis so the Map survives hot-reloads in dev.
   In production with multiple instances, replace with Redis / KV.        */
declare global { var __rl: Map<string, { hits: number; since: number; lockUntil: number }> | undefined }
globalThis.__rl ??= new Map()
const rl = globalThis.__rl

function edgeRateLimit(key: string): { ok: boolean; retryAfter?: number } {
  const now    = Date.now()
  const WINDOW = 15 * 60_000   // 15 min
  const MAX    = 10
  const LOCK   = 30 * 60_000   // 30 min lock

  let e = rl.get(key)
  if (e && now < e.lockUntil) return { ok: false, retryAfter: Math.ceil((e.lockUntil - now) / 1000) }
  if (!e || now - e.since > WINDOW) { rl.set(key, { hits: 1, since: now, lockUntil: 0 }); return { ok: true } }
  e.hits++
  if (e.hits > MAX) { e.lockUntil = now + LOCK; return { ok: false, retryAfter: Math.ceil(LOCK / 1000) } }
  return { ok: true }
}

/* ── Session verification (Web Crypto — Edge safe) ──────────── */
async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length < 3) return false
  const sig     = parts.pop()!
  const payload = parts.join('.')

  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  )
  const sigBuf   = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  const expected = Array.from(new Uint8Array(sigBuf))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  if (sig !== expected) return false
  const ts = parseInt(parts[1] ?? '0')
  return Date.now() - ts < MAX_AGE
}

/* ── Security headers ───────────────────────────────────────── */
function applySecurityHeaders(res: NextResponse, req: NextRequest): NextResponse {
  const isProd = process.env.NODE_ENV === 'production'

  // Prevent MIME-type sniffing
  res.headers.set('X-Content-Type-Options', 'nosniff')

  // Prevent clickjacking
  res.headers.set('X-Frame-Options', 'DENY')

  // Stop browsers from sending Referer to external sites
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Disable sensitive browser features
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
  )

  // Force HTTPS in production
  if (isProd) {
    res.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    )
  }

  // Content Security Policy
  // • script-src includes 'unsafe-inline' because Next.js injects inline scripts
  // • style-src includes 'unsafe-inline' because Framer Motion uses inline styles
  // • script-src/connect-src/frame-src include Razorpay's domains because /submit
  //   loads their Checkout.js widget, which opens a payment iframe and talks to
  //   their API directly from the browser — without these the widget silently
  //   fails to load once live Razorpay keys are configured.
  // • script-src/connect-src include va.vercel-scripts.com for Vercel Analytics —
  //   in production on Vercel it loads via a same-origin proxied path ('self'
  //   covers it), but `next dev` falls back to this direct host, so it's needed
  //   for a clean local console too.
  // • Tighten further once you move to a CDN / nonces
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://lumberjack.razorpay.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
    "frame-src https://api.razorpay.com https://checkout.razorpay.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
  res.headers.set('Content-Security-Policy', csp)

  // Remove fingerprinting headers
  res.headers.delete('X-Powered-By')
  res.headers.delete('Server')

  return res
}

/* ── Proxy (formerly "Middleware" — renamed in Next.js 16) ───── */
const AUTH_ROUTES = ['/api/auth/login', '/api/auth/register']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  /* ── Rate-limit auth POST endpoints ── */
  if (AUTH_ROUTES.some(r => pathname.startsWith(r)) && req.method === 'POST') {
    const ip  = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
            ?? req.headers.get('x-real-ip')
            ?? 'unknown'
    const rlResult = edgeRateLimit(`${ip}:${pathname}`)
    if (!rlResult.ok) {
      return new NextResponse(
        JSON.stringify({ error: `Too many attempts. Try again in ${rlResult.retryAfter}s.` }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After':  String(rlResult.retryAfter),
            'X-Content-Type-Options': 'nosniff',
          },
        },
      )
    }
  }

  /* ── Protected paths — session required ──
     OppIDX is a public opportunities board: everything is open by default,
     including nonexistent/mistyped URLs (which should fall through to
     Next.js's normal 404, not get redirected to /auth). Only /admin itself
     needs a session — this used to be an ever-growing allowlist of "public"
     prefixes that defaulted to *protected* for anything not listed, which
     silently 302'd every unknown path (typos, bad links, new routes we
     forgot to add here) to the admin login screen instead of 404ing. ── */
  const isProtected = pathname === '/admin' || pathname.startsWith('/admin/')

  const session = req.cookies.get(COOKIE)?.value

  if (isProtected) {
    const authed = await isValidSession(session)
    if (!authed) {
      const url = req.nextUrl.clone()
      url.pathname = '/auth'
      url.searchParams.set('from', pathname)
      const redirect = NextResponse.redirect(url)
      return applySecurityHeaders(redirect, req)
    }
  }

  const res = NextResponse.next()
  return applySecurityHeaders(res, req)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
