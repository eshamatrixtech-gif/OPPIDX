import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentSubscriber } from '@/lib/subscriberSession'

/** GET /api/directory/mine — this visitor's own directory profile, if any
 * (no session or no profile both just mean `item: null`, not an error). */
export async function GET() {
  const subscriber = await getCurrentSubscriber()
  if (!subscriber) return NextResponse.json({ item: null })

  let row: Awaited<ReturnType<typeof prisma.directoryProfile.findUnique>>
  try {
    row = await prisma.directoryProfile.findUnique({ where: { subscriberId: subscriber.id } })
  } catch {
    return NextResponse.json({ item: null })
  }
  if (!row || row.deletedAt) return NextResponse.json({ item: null })

  return NextResponse.json({
    item: {
      id: row.id,
      displayName: row.displayName,
      lookingFor: row.lookingFor.split(',').map(s => s.trim()).filter(Boolean),
      tags: row.tags,
      bio: row.bio,
    },
  })
}

/** DELETE /api/directory/mine — leave the directory (soft delete, same
 * pattern as Opportunity/Resource/Comment). */
export async function DELETE() {
  const subscriber = await getCurrentSubscriber()
  if (!subscriber) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.directoryProfile.updateMany({
    where: { subscriberId: subscriber.id },
    data: { deletedAt: new Date(), visible: false },
  })

  return NextResponse.json({ ok: true })
}
