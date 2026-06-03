// app/api/cron/capture-notify/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { checkAndNotify } from '@/lib/notifications/scheduler'

export async function GET(req: NextRequest) {
  // Verify cron secret (for Vercel Cron)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await checkAndNotify()
  return NextResponse.json({ success: true })
}
