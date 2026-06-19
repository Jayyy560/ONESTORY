'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) return null

  const user = await prisma.user.findUnique({
    where: { supabaseId: authUser.id }
  })

  return user
}

export async function castVote(submissionId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }
  if (user.isBanned) return { error: 'Your account has been suspended.' }

  // Verify the submission exists and is in APPROVED status (in voting queue)
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  })

  if (!submission) return { error: 'Submission not found.' }
  if (submission.status !== 'APPROVED') return { error: 'This submission is not in the voting queue.' }
  if (submission.authorId === user.id) return { error: 'You cannot vote on your own submission.' }

  // Check if already voted
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_submissionId: {
        userId: user.id,
        submissionId,
      },
    },
  })

  if (existingVote) return { error: 'You have already voted on this submission.' }

  // Create vote and increment vote count in a transaction
  await prisma.$transaction([
    prisma.vote.create({
      data: {
        userId: user.id,
        submissionId,
      },
    }),
    prisma.submission.update({
      where: { id: submissionId },
      data: { voteCount: { increment: 1 } },
    }),
  ])

  revalidatePath('/vote')

  return { success: true }
}

export async function removeVote(submissionId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }

  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_submissionId: {
        userId: user.id,
        submissionId,
      },
    },
  })

  if (!existingVote) return { error: 'You have not voted on this submission.' }

  await prisma.$transaction([
    prisma.vote.delete({
      where: { id: existingVote.id },
    }),
    prisma.submission.update({
      where: { id: submissionId },
      data: { voteCount: { decrement: 1 } },
    }),
  ])

  revalidatePath('/vote')

  return { success: true }
}

export async function getUserVotes() {
  const user = await getCurrentUser()
  if (!user) return []

  const votes = await prisma.vote.findMany({
    where: { userId: user.id },
    select: { submissionId: true },
  })

  return votes.map((v: any) => v.submissionId)
}
