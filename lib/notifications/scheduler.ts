// lib/notifications/scheduler.ts

import { prisma } from '@/lib/db'
import { sendNotification } from './index'

// Run this with a cron job (e.g., Vercel Cron, or separate worker)
export async function scheduleCaptureTimes() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true },
    })

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    for (const user of users) {
      // Generate random time between 9 AM and 9 PM
      const randomHour = 9 + Math.floor(Math.random() * 12) // 9-21
      const randomMinute = Math.floor(Math.random() * 60)

      const scheduledAt = new Date(tomorrow)
      scheduledAt.setHours(randomHour, randomMinute, 0, 0)

      const expiresAt = new Date(scheduledAt.getTime() + 2 * 60 * 1000) // +2 minutes

      // Create capture window
      await prisma.captureWindow.create({
        data: {
          userId: user.id,
          scheduledAt,
          expiresAt,
        },
      })
    }

    console.log(`Scheduled capture times for ${users.length} users`)
  } catch (error) {
    console.error('Failed to schedule capture times:', error)
  }
}

// Check and send notifications (run every minute)
export async function checkAndNotify() {
  try {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    // Find windows that just started
    const activeWindows = await prisma.captureWindow.findMany({
      where: {
        scheduledAt: {
          gte: fiveMinutesAgo,
          lte: now,
        },
        captured: false,
      },
      include: {
        user: true,
      },
    })

    for (const window of activeWindows) {
      // Check if notification already sent (within last 5 minutes)
      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId: window.userId,
          type: 'CAPTURE_TIME',
          sentAt: { gte: fiveMinutesAgo },
        },
      })

      if (!recentNotification) {
        await sendNotification(window.userId, {
          type: 'CAPTURE_TIME',
          title: '⏰ Time for Satya!',
          body: 'You have 2 minutes to capture your moment',
          data: { windowId: window.id },
        })
      }
    }
  } catch (error) {
    console.error('Failed to check and notify:', error)
  }
}
