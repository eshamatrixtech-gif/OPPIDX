// app/api/friends/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendNotification } from '@/lib/notifications'

// GET - List friends
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, brainScore: true } },
        friend: { select: { id: true, name: true, avatar: true, brainScore: true } },
      },
    })

    const friends = friendships.map(f => 
      f.userId === userId ? f.friend : f.user
    )

    // Get pending requests
    const pendingRequests = await prisma.friendship.findMany({
      where: {
        friendId: userId,
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json({ 
      friends, 
      pendingRequests: pendingRequests.map(r => ({
        id: r.id,
        user: r.user,
        createdAt: r.createdAt,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 })
  }
}

// POST - Send friend request
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { friendId } = await req.json()

    if (!friendId || friendId === userId) {
      return NextResponse.json({ error: 'Invalid friend ID' }, { status: 400 })
    }

    // Check if friendship already exists
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Friendship already exists' }, { status: 400 })
    }

    // Create friendship request
    const friendship = await prisma.friendship.create({
      data: {
        userId,
        friendId,
        status: 'PENDING',
      },
    })

    // Notify the friend
    const user = await prisma.user.findUnique({ where: { id: userId } })
    await sendNotification(friendId, {
      type: 'FRIEND_REQUEST',
      title: 'New friend request',
      body: `${user?.name || 'Someone'} wants to be your friend`,
      data: { friendshipId: friendship.id, userId },
    })

    return NextResponse.json({ friendship })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 })
  }
}