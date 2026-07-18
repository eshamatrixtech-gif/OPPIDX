import { NextRequest, NextResponse } from 'next/server'
import { prisma }                    from '@/lib/db'
import { requireAuth }               from '@/lib/auth'
import { rateLimit }                 from '@/lib/rateLimit'
import { getClientIp }               from '@/lib/ip'
import { inferGeo }                  from '@/lib/scraper/geo'
import { getCurrentPaidSubscriber }  from '@/lib/subscriberSession'
import { FREE_SEARCH_LIMIT }         from '@/lib/limits'

const PAGE_SIZE = 24
const VALID_AUDIENCES = ['STUDENT', 'EARLY_CAREER', 'FOUNDER', 'GENERAL']
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard']

// Free tier's cap on the full-catalog /browse search — the homepage's
// hourly-rotating "best opportunities" picks (?featured=true) are exempt,
// as is anything an authenticated admin requests. Subscribers with an
// active paid plan see every result, same as admin. Free visitors see at
// most 10 hourly picks + 10 search results (20 total) before hitting the
// paywall — this is a premium, hand-curated collection, not a free-for-all.

/**
 * GET /api/opportunities — public listing.
 * Public callers only ever see verified, non-deleted entries. An
 * authenticated admin may pass ?status=unverified or ?status=all to see the
 * review queue (used by /admin).
 *
 * `audience` and `difficulty` accept comma-separated lists for the
 * multi-select filter bar, e.g. ?audience=STUDENT,FOUNDER
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const audience   = searchParams.get('audience')
  const difficulty = searchParams.get('difficulty')
  const region     = searchParams.get('region')
  const country    = searchParams.get('country')
  const tag        = searchParams.get('tag')
  const search     = searchParams.get('search')?.trim()
  const status     = searchParams.get('status')
  const featured   = searchParams.get('featured')
  const page       = Math.max(1, parseInt(searchParams.get('page') ?? '1') || 1)

  const where: Record<string, unknown> = { deletedAt: null }
  const isAdminQuery = status === 'unverified' || status === 'all'
  const isFeaturedQuery = featured === 'true'

  if (isAdminQuery) {
    const admin = await requireAuth()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (status === 'unverified') where.verified = false
  } else {
    where.verified = true
  }

  // Gate the full-catalog search (not the hourly homepage picks, not admin).
  let restricted = false
  if (!isAdminQuery && !isFeaturedQuery) {
    const paidSubscriber = await getCurrentPaidSubscriber()
    restricted = !paidSubscriber
  }

  if (audience) {
    const list = audience.split(',').map(a => a.trim()).filter(a => VALID_AUDIENCES.includes(a))
    if (list.length) where.audience = { in: list }
  }
  if (difficulty) {
    const list = difficulty.split(',').map(d => d.trim()).filter(d => VALID_DIFFICULTIES.includes(d))
    if (list.length) where.difficulty = { in: list }
  }
  if (region) {
    const list = region.split(',').map(r => r.trim()).filter(Boolean)
    if (list.length) where.region = { in: list }
  }
  if (country) {
    const list = country.split(',').map(c => c.trim()).filter(Boolean)
    if (list.length) where.country = { in: list }
  }
  if (featured === 'true') where.featured = true
  if (tag) where.tags = { contains: tag }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { org: { contains: search } },
      { tags: { contains: search } },
      { eligibility: { contains: search } },
    ]
  }

  const skip = (page - 1) * PAGE_SIZE
  const take = restricted ? Math.max(0, Math.min(PAGE_SIZE, FREE_SEARCH_LIMIT - skip)) : PAGE_SIZE

  const [items, total] = await Promise.all([
    take > 0
      ? prisma.opportunity.findMany({ where, orderBy: { addedAt: 'desc' }, skip, take })
      : Promise.resolve([]),
    prisma.opportunity.count({ where }), // always the real count — never hide this number
  ])

  // A real teaser, not a fabricated one — the actual next listing just past
  // the free limit, title + a short genuine preview only. Proves there's
  // something real behind the paywall instead of just a locked count.
  let teaser: { title: string; org: string | null; descriptionPreview: string } | null = null
  if (restricted && total > FREE_SEARCH_LIMIT) {
    const teaserItem = await prisma.opportunity.findFirst({
      where, orderBy: { addedAt: 'desc' }, skip: FREE_SEARCH_LIMIT,
      select: { title: true, org: true, description: true },
    })
    if (teaserItem) {
      teaser = { title: teaserItem.title, org: teaserItem.org, descriptionPreview: teaserItem.description.slice(0, 70) }
    }
  }

  return NextResponse.json({
    items, total, page, pageSize: PAGE_SIZE,
    ...(restricted ? { restricted: true, visibleLimit: FREE_SEARCH_LIMIT, teaser } : {}),
  })
}

/** POST /api/opportunities — admin-only create. */
export async function POST(req: NextRequest) {
  const admin = await requireAuth()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = rateLimit(`create-opp:${getClientIp(req)}`, 60_000, 20)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Slow down.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const {
    title, description, url, org, audience, eligibility, prepResources, difficulty,
    tags, location, compType, verified, featured, source, sourceUrl,
  } = body as Record<string, unknown>

  if (typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
  }
  if (typeof description !== 'string' || !description.trim()) {
    return NextResponse.json({ error: 'Description is required.' }, { status: 400 })
  }
  if (typeof url !== 'string' || !/^https?:\/\//.test(url)) {
    return NextResponse.json({ error: 'A valid application URL is required.' }, { status: 400 })
  }
  if (typeof audience !== 'string' || !VALID_AUDIENCES.includes(audience)) {
    return NextResponse.json({ error: 'Invalid audience.' }, { status: 400 })
  }

  const geo = typeof location === 'string' ? inferGeo(location) : { region: '', country: '' }

  const created = await prisma.opportunity.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      org: typeof org === 'string' ? org.trim() : null,
      audience,
      eligibility: typeof eligibility === 'string' ? eligibility.trim() : '',
      prepResources: typeof prepResources === 'string' ? prepResources.trim() : '',
      difficulty: typeof difficulty === 'string' && VALID_DIFFICULTIES.includes(difficulty) ? difficulty : 'Medium',
      tags: typeof tags === 'string' ? tags.trim() : '',
      location: typeof location === 'string' ? location.trim() : null,
      region: geo.region,
      country: geo.country,
      compType: typeof compType === 'string' ? compType.trim() : null,
      verified: typeof verified === 'boolean' ? verified : false,
      featured: typeof featured === 'boolean' ? featured : false,
      source: typeof source === 'string' && source ? source : 'user-provided',
      sourceUrl: typeof sourceUrl === 'string' ? sourceUrl.trim() : null,
    },
  })

  return NextResponse.json({ ok: true, item: created })
}
