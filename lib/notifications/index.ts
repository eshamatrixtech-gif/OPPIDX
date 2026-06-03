// lib/notifications/index.ts

import webpush from 'web-push'
import { prisma } from '@/lib/db'

// Generate VAPID keys once: npx web-push generate-vapid-keys
webpush.setVapidDetails(
  'mailto:your@email.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

interface NotificationPayload {
  type: string
  title: string
  body: string
  data?: any
}

export async function sendNotification(userId: string, payload: NotificationPayload) {
  try {
    // Save to database
    await prisma.notification.create({
      data: {
        userId,
        type: payload.type as any,
        title: payload.title,
        body: payload.body,
        data: payload.data,
      },
    })

    // Get user's push subscription (you'll need to store this)
    // For now, we'll just save to DB
    // In production, you'd send actual push notification here

    console.log(`Notification for ${userId}:`, payload)
    return true
  } catch (error) {
    console.error('Failed to send notification:', error)
    return false
  }
}

export async function notifyFriends(userId: string, momentId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' },
        ],
      },
    })

    const friendIds = friendships.map(f => 
      f.userId === userId ? f.friendId : f.userId
    )

    await Promise.all(
      friendIds.map(friendId =>
        sendNotification(friendId, {
          type: 'FRIEND_POSTED',
          title: `${user?.name || 'A friend'} posted`,
          body: 'Check out their Satya moment!',
          data: { momentId, userId },
        })
      )
    )
  } catch (error) {
    console.error('Failed to notify friends:', error)
  }
}