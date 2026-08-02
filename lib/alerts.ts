import { rateLimit } from '@/lib/rateLimit'

/**
 * Internal ops alerting — separate from lib/discord.ts's
 * sendDiscordMessage(), which posts to the *public* community server and
 * is gated behind SOCIAL_CHANNELS_ENABLED (currently off). Error payloads
 * can contain request paths, digests, and stack-adjacent detail that
 * shouldn't be visible to community members, so this uses its own webhook
 * pointed at a private channel and has no dependency on that flag.
 *
 * No-ops (returns false, never throws) until DISCORD_ALERTS_WEBHOOK_URL is
 * set — create an incoming webhook on a private Discord channel and add
 * the URL to your env to turn this on.
 */
export async function sendOpsAlert(content: string): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_ALERTS_WEBHOOK_URL
  if (!webhookUrl) return false

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.slice(0, 1900) }),
    })
    if (!res.ok) {
      console.error('[alerts] send failed:', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.error('[alerts] send threw:', err)
    return false
  }
}

/** One alert per distinct error key per window — a crash-looping route
 * would otherwise post hundreds of near-identical messages. */
export async function sendThrottledOpsAlert(key: string, content: string): Promise<boolean> {
  const rl = rateLimit(`ops-alert:${key}`, 15 * 60_000, 1)
  if (!rl.ok) return false
  return sendOpsAlert(content)
}
