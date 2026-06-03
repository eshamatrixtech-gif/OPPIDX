// app/api/moments/[momentId]/react/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendNotification } from '@/lib/notifications'

export async function POST(
  req: NextRequest,
  { params }: { params: { momentId: string } }
) {
  const userId = req.headers.get('x-user-id')
  const { momentId } = params

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { emoji } = await req.json()

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji required' }, { status: 400 })
    }

    // Check if moment exists
    const moment = await prisma.moment.findUnique({
      where: { id: momentId },
      include: { user: true },
    })

    if (!moment) {
      return NextResponse.json({ error: 'Moment not found' }, { status: 404 })
    }

    // Upsert reaction (update if exists, create if not)
    const reaction = await prisma.reaction.upsert({
      where: {
        momentId_userId: { momentId, userId },
      },
      update: { emoji },
      create: { momentId, userId, emoji },
    })

    // Notify moment owner
    if (moment.userId !== userId) {
      const reactor = await prisma.user.findUnique({ where: { id: userId } })
      
      await sendNotification(moment.userId, {
        type: 'REACTION',
        title: `${reactor?.name || 'Someone'} reacted`,
        body: `${emoji} to your Satya moment`,
        data: { momentId },
      })
    }

    return NextResponse.json({ reaction })
  } catch (error) {
    console.error('Error adding reaction:', error)
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 })
  }
}

// DELETE - Remove reaction
export async function DELETE(
  req: NextRequest,
  { params }: { params: { momentId: string } }
) {
  const userId = req.headers.get('x-user-id')
  const { momentId } = params

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.reaction.delete({
      where: {
        momentId_userId: { momentId, userId },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 })
  }
}