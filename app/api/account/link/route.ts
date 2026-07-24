import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/authSupabase'
import { linkSubscriberToAuthUser } from '@/lib/subscriberAuth'

/**
 * POST /api/account/link — called right after a client-side
 * supabase.auth.signInWithPassword() succeeds (login, not signup), to mint
 * oppidx's own Subscriber cookie for an already-existing Supabase identity.
 * Reads the access token from the Authorization header rather than trusting
 * anything the client claims about who it is.
 */
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Not configured.' }, { status: 503 })
  }

  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return NextResponse.json({ error: 'Missing token.' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user?.email) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 })
  }

  await linkSubscriberToAuthUser(data.user.id, data.user.email.toLowerCase())

  return NextResponse.json({ ok: true })
}
