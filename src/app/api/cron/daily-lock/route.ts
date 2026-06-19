import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentDayNumber, MAX_DAILY_ACCEPTED, COOLDOWN_DAYS } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dayNumber = getCurrentDayNumber()

  // Check if already locked
  const existingDay = await prisma.day.findUnique({ where: { dayNumber } })
  if (existingDay?.isLocked) {
    return NextResponse.json({ message: `Day ${dayNumber} already locked` })
  }

  // Get top voted APPROVED submissions
  const approvedSubmissions = await prisma.submission.findMany({
    where: {
      status: 'APPROVED',
      daySubmitted: dayNumber,
    },
    orderBy: { voteCount: 'desc' },
  })

  const toAccept = approvedSubmissions.slice(0, MAX_DAILY_ACCEPTED)
  const toReject = approvedSubmissions.slice(MAX_DAILY_ACCEPTED)

  const lastSentence = await prisma.sentence.findFirst({
    orderBy: { sequenceNumber: 'desc' },
  })
  let nextSequence = (lastSentence?.sequenceNumber || 0) + 1

  const now = new Date()
  const cooldownDate = new Date(now.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)

  await prisma.$transaction(async (tx) => {
    for (const sub of toAccept) {
      await tx.sentence.create({
        data: {
          sequenceNumber: nextSequence++,
          content: sub.content,
          authorId: sub.authorId,
          acceptedAt: now,
          dayNumber,
          voteCount: sub.voteCount,
          submissionId: sub.id,
        },
      })

      await tx.submission.update({
        where: { id: sub.id },
        data: { status: 'ACCEPTED' },
      })

      await tx.user.update({
        where: { id: sub.authorId },
        data: { cooldownUntil: cooldownDate },
      })
    }

    if (toReject.length > 0) {
      await tx.submission.updateMany({
        where: { id: { in: toReject.map(s => s.id) } },
        data: { status: 'REJECTED' },
      })
    }

    await tx.day.upsert({
      where: { dayNumber },
      create: {
        dayNumber,
        date: now,
        isLocked: true,
        totalSubmissions: approvedSubmissions.length,
        acceptedCount: toAccept.length,
        lockedAt: now,
      },
      update: {
        isLocked: true,
        totalSubmissions: approvedSubmissions.length,
        acceptedCount: toAccept.length,
        lockedAt: now,
      },
    })
  })

  revalidatePath('/')
  revalidatePath('/chronicle')
  revalidatePath('/alternate-futures')
  revalidatePath('/vote')

  return NextResponse.json({
    success: true,
    day: dayNumber,
    accepted: toAccept.length,
    rejected: toReject.length,
  })
}
