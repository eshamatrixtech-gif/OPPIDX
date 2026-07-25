import { createHmac } from 'crypto'

/**
 * Signs/verifies a subscriber id for the digest-unsubscribe link — same
 * HMAC pattern as lib/subscriberSession.ts, but deliberately no expiry: an
 * unsubscribe link that stops working is the one link a compliance-minded
 * email absolutely cannot let expire.
 */
const SECRET = process.env.SESSION_SECRET ?? 'dev_fallback_secret'

export function signUnsubscribeToken(subscriberId: string): string {
  const sig = createHmac('sha256', SECRET).update(subscriberId).digest('hex')
  return `${subscriberId}.${sig}`
}

export function verifyUnsubscribeToken(token: string): string | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [subscriberId, sig] = parts
  const expected = createHmac('sha256', SECRET).update(subscriberId).digest('hex')
  return sig === expected ? subscriberId : null
}
