// app/api/friends/[friendshipId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendNotification } from '@/lib/notifications'

// PATCH - Accept or reject
export async function PATCH(
  req: NextRequest,
  { params }: { params: { friendshipId: string } }
) {
  const userId = req.headers.get('x-user-id')
  const { friendshipId } = params

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action } = await req.json() // 'accept' or 'reject'

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    })

    if (!friendship || friendship.friendId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (action === 'accept') {
      await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: 'ACCEPTED' },
      })

      // Notify the requester
      const user = await prisma.user.findUnique({ where: { id: userId } })
      await sendNotification(friendship.userId, {
        type: 'FRIEND_REQUEST',
        title: 'Friend request accepted!',
        body: `${user?.name || 'Someone'} accepted your friend request`,
        data: { userId },
      })

      return NextResponse.json({ success: true, status: 'ACCEPTED' })
    } else {
      await prisma.friendship.delete({
        where: { id: friendshipId },
      })

      return NextResponse.json({ success: true, status: 'REJECTED' })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE - Remove friend
export async function DELETE(
  req: NextRequest,
  { params }: { params: { friendshipId: string } }
) {
  const userId = req.headers.get('x-user-id')
  const { friendshipId } = params

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    })

    if (!friendship || (friendship.userId !== userId && friendship.friendId !== userId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.friendship.delete({
      where: { id: friendshipId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 })
  }
}
