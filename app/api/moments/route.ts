// app/api/moments/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyzeGenuineness } from '@/lib/ai/genuineAnalyzer'
import { notifyFriends } from '@/lib/notifications'

// GET - Fetch moments from friends
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id') // Replace with your auth

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if user has posted today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const userMomentToday = await prisma.moment.findFirst({
      where: {
        userId,
        createdAt: { gte: today },
      },
    })

    // Get friend IDs
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

    // Fetch moments from friends (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const moments = await prisma.moment.findMany({
      where: {
        userId: { in: [...friendIds, userId] },
        createdAt: { gte: yesterday },
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        reactions: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      moments,
      hasPostedToday: !!userMomentToday,
      canViewFriends: !!userMomentToday,
    })
  } catch (error) {
    console.error('Error fetching moments:', error)
    return NextResponse.json({ error: 'Failed to fetch moments' }, { status: 500 })
  }
}

// POST - Create new moment
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { frontImage, backImage, caption, location } = await req.json()

    if (!frontImage || !backImage) {
      return NextResponse.json({ error: 'Both images required' }, { status: 400 })
    }

    // Check for active capture window
    const now = new Date()
    const captureWindow = await prisma.captureWindow.findFirst({
      where: {
        userId,
        scheduledAt: { lte: now },
        expiresAt: { gte: now },
        captured: false,
      },
    })

    const isLate = !captureWindow
    let lateByMins = 0

    if (isLate) {
      // Find the most recent expired window
      const lastWindow = await prisma.captureWindow.findFirst({
        where: { userId, captured: false },
        orderBy: { expiresAt: 'desc' },
      })

      if (lastWindow) {
        lateByMins = Math.floor((now.getTime() - lastWindow.expiresAt.getTime()) / 60000)
      }
    }

    // Analyze genuineness with AI
    const genuineScore = await analyzeGenuineness(frontImage, backImage, caption)

    // Create moment
    const moment = await prisma.moment.create({
      data: {
        userId,
        frontImage,
        backImage,
        caption,
        location,
        isLate,
        lateByMins,
        genuineScore,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    // Mark capture window as used
    if (captureWindow) {
      await prisma.captureWindow.update({
        where: { id: captureWindow.id },
        data: { captured: true },
      })
    }

    // Update brain score (bonus for genuine content)
    const brainBonus = Math.floor(genuineScore / 10) // 0-10 points
    await prisma.user.update({
      where: { id: userId },
      data: { brainScore: { increment: brainBonus } },
    })

    // Notify friends
    await notifyFriends(userId, moment.id)

    return NextResponse.json({ moment, brainBonus })
  } catch (error) {
    console.error('Error creating moment:', error)
    return NextResponse.json({ error: 'Failed to create moment' }, { status: 500 })
  }
}