// app/api/cron/schedule-daily/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { scheduleCaptureTimes } from '@/lib/notifications/scheduler'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await scheduleCaptureTimes()
  return NextResponse.json({ success: true })
}