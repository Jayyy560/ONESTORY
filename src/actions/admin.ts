'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { COOLDOWN_DAYS, MAX_DAILY_ACCEPTED, getCurrentDayNumber } from '@/lib/constants'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) return { error: 'Not authenticated' }

  const user = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
  })

  if (!user || user.role !== 'ADMIN') {
    return { error: 'Insufficient permissions' }
  }

  return { user }
}

// Approve a submission (move from PENDING to APPROVED = enters voting queue)
export async function approveSubmission(submissionId: string) {
  const result = await requireAdmin()
  if ('error' in result) return result

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: 'APPROVED',
      moderatedById: result.user.id,
      moderatedAt: new Date(),
    },
  })

  revalidatePath('/admin')
  revalidatePath('/vote')

  return { success: true }
}

// Remove a submission (admin rejection)
export async function removeSubmission(submissionId: string, note?: string) {
  const result = await requireAdmin()
  if ('error' in result) return result

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: 'REMOVED',
      moderatedById: result.user.id,
      moderatedAt: new Date(),
      moderationNote: note || null,
    },
  })

  revalidatePath('/admin')

  return { success: true }
}

// Ban/unban a user
export async function toggleUserBan(userId: string) {
  const result = await requireAdmin()
  if ('error' in result) return result

  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!targetUser) return { error: 'User not found' }
  if (targetUser.role === 'ADMIN') return { error: 'Cannot ban an admin' }

  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: !targetUser.isBanned },
  })

  revalidatePath('/admin')

  return { success: true, banned: !targetUser.isBanned }
}

// Daily canonization: lock the day, accept top 30, reject the rest
export async function runDailyCanonization() {
  const result = await requireAdmin()
  if ('error' in result) return result

  const dayNumber = getCurrentDayNumber()

  // Check if already locked
  const existingDay = await prisma.day.findUnique({ where: { dayNumber } })
  if (existingDay?.isLocked) {
    return { error: `Day ${dayNumber} is already locked.` }
  }

  // Get top voted APPROVED submissions for this day
  const approvedSubmissions = await prisma.submission.findMany({
    where: {
      status: 'APPROVED',
      daySubmitted: dayNumber,
    },
    orderBy: { voteCount: 'desc' },
  })

  const toAccept = approvedSubmissions.slice(0, MAX_DAILY_ACCEPTED)
  const toReject = approvedSubmissions.slice(MAX_DAILY_ACCEPTED)

  // Get current max sequence number
  const lastSentence = await prisma.sentence.findFirst({
    orderBy: { sequenceNumber: 'desc' },
  })
  let nextSequence = (lastSentence?.sequenceNumber || 0) + 1

  const now = new Date()
  const cooldownDate = new Date(now.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)

  // Execute in transaction
  await prisma.$transaction(async (tx) => {
    // Accept top sentences
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

      // Set cooldown on author
      await tx.user.update({
        where: { id: sub.authorId },
        data: { cooldownUntil: cooldownDate },
      })
    }

    // Reject remaining
    if (toReject.length > 0) {
      await tx.submission.updateMany({
        where: { id: { in: toReject.map(s => s.id) } },
        data: { status: 'REJECTED' },
      })
    }

    // Create/update day record
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
  revalidatePath('/admin')

  return { success: true, accepted: toAccept.length, rejected: toReject.length }
}
