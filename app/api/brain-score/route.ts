// app/api/brain-score/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')

  try {
    const data = await req.json()

    const {
      feedPosts = [],
      scrollMinutes = 0,
      sessionCount = 1,
      nighttimeUsage = false,
      shortFormCount = 0,
      longFormCount = 0,
      dmsSent = 0,
      passiveScrollTime = 0,
    } = data

    // Base calculations
    let screenTimeScore = Math.max(0, 100 - scrollMinutes * 2)
    let contentScore = feedPosts.length > 0
      ? feedPosts.reduce((sum: number, p: any) => sum + (p.score || 50), 0) / feedPosts.length
      : 50
    let engagementScore = Math.min(100, dmsSent * 5 + longFormCount * 10)
    let balanceScore = 100 - (shortFormCount * 3) - (passiveScrollTime * 0.5)
    let nightScore = nighttimeUsage ? 30 : 100

    // Satya moment bonus
    let satyaBonus = 0

    if (userId) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayMoment = await prisma.moment.findFirst({
        where: {
          userId,
          createdAt: { gte: today },
        },
      })

      if (todayMoment) {
        satyaBonus = Math.floor(todayMoment.genuineScore / 5)

        if (!todayMoment.isLate) {
          satyaBonus += 10
        }
      }
    }

    // Calculate total
    const weights = {
      screenTime: 0.2,
      content: 0.25,
      engagement: 0.15,
      balance: 0.2,
      night: 0.1,
      satya: 0.1,
    }

    const total = Math.round(
      screenTimeScore * weights.screenTime +
      contentScore * weights.content +
      engagementScore * weights.engagement +
      Math.max(0, balanceScore) * weights.balance +
      nightScore * weights.night +
      satyaBonus * weights.satya * 5
    )

    const clampedTotal = Math.min(100, Math.max(0, total))

    // Determine label and color
    let label = 'Struggling'
    let color = '#c41e3a'

    if (clampedTotal >= 80) {
      label = 'Thriving'
      color = '#40e0d0'
    } else if (clampedTotal >= 60) {
      label = 'Balanced'
      color = '#ff9933'
    } else if (clampedTotal >= 40) {
      label = 'Mindful'
      color = '#ff9933'
    }

    // Generate insight
    const insights = [
      clampedTotal >= 70 && satyaBonus > 0
        ? 'Your genuine Satya moment today lifted your spirit. Keep sharing real moments.'
        : null,
      clampedTotal >= 70
        ? 'Like a lotus rising through still waters, your digital presence reflects inner calm.'
        : null,
      clampedTotal < 50 && nighttimeUsage
        ? 'Late night scrolling detected. Your mind needs rest to bloom tomorrow.'
        : null,
      shortFormCount > 5
        ? 'Too much short-form content today. Seek depth over distraction.'
        : null,
      satyaBonus === 0
        ? 'Share a Satya moment today to boost your wellness score.'
        : null,
    ].filter(Boolean)

    const insight = insights[0] || 'Your digital wellness journey continues. Stay mindful.'

    return NextResponse.json({
      total: clampedTotal,
      label,
      color,
      insight,
      satyaBonus,
      categories: {
        screenTime: { label: 'Screen Time', score: Math.round(screenTimeScore) },
        content: { label: 'Content Quality', score: Math.round(contentScore) },
        engagement: { label: 'Engagement', score: Math.round(engagementScore) },
        balance: { label: 'Balance', score: Math.round(Math.max(0, balanceScore)) },
        night: { label: 'Sleep Hygiene', score: Math.round(nightScore) },
        satya: { label: 'Genuine Moments', score: Math.round(satyaBonus * 5) },
      },
    })
  } catch (error) {
    console.error('Brain score error:', error)
    return NextResponse.json({ error: 'Failed to calculate' }, { status: 500 })
  }
}