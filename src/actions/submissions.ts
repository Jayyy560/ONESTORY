'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { validateSentence } from '@/lib/validators'
import { getCurrentDayNumber, COOLDOWN_DAYS } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

// Get or create user in our database from Supabase auth
async function getOrCreateUser() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    return { error: 'Not authenticated' }
  }

  let user = await prisma.user.findUnique({
    where: { supabaseId: authUser.id }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        supabaseId: authUser.id,
        email: authUser.email || '',
        displayName: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Anonymous Contributor',
      }
    })
  }

  return { user }
}

export async function submitSentence(content: string) {
  const validation = validateSentence(content)
  if (!validation.valid) {
    return { error: validation.error }
  }

  const result = await getOrCreateUser()
  if ('error' in result) return result
  const { user } = result

  if (user.isBanned) {
    return { error: 'Your account has been suspended.' }
  }

  // Check cooldown
  if (user.cooldownUntil && user.cooldownUntil > new Date()) {
    const daysLeft = Math.ceil((user.cooldownUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return { error: `You are in a cooldown period. ${daysLeft} day(s) remaining. Your previous sentence was accepted into the story.` }
  }

  // Check if user already has a pending/approved submission for today
  const dayNumber = getCurrentDayNumber()
  const existingSubmission = await prisma.submission.findFirst({
    where: {
      authorId: user.id,
      daySubmitted: dayNumber,
      status: { in: ['PENDING', 'APPROVED'] },
    },
  })

  if (existingSubmission) {
    return { error: 'You have already submitted a sentence today. Wait for the daily canonization.' }
  }

  const submission = await prisma.submission.create({
    data: {
      content: content.trim(),
      authorId: user.id,
      daySubmitted: dayNumber,
    },
  })

  revalidatePath('/submit')
  revalidatePath('/admin')

  return { success: true, submissionId: submission.id }
}

export async function getUserSubmissionStatus() {
  const result = await getOrCreateUser()
  if ('error' in result) return { authenticated: false as const }
  const { user } = result

  const dayNumber = getCurrentDayNumber()
  const todaySubmission = await prisma.submission.findFirst({
    where: {
      authorId: user.id,
      daySubmitted: dayNumber,
      status: { in: ['PENDING', 'APPROVED'] },
    },
  })

  return {
    authenticated: true as const,
    userId: user.id,
    displayName: user.displayName,
    isBanned: user.isBanned,
    onCooldown: user.cooldownUntil ? user.cooldownUntil > new Date() : false,
    cooldownUntil: user.cooldownUntil,
    hasSubmittedToday: !!todaySubmission,
    todaySubmissionStatus: todaySubmission?.status || null,
  }
}
