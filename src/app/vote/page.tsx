import { prisma } from '@/lib/prisma'
import { PageTitle } from '@/components/ui/PageTitle'
import { VoteTimer } from '@/components/voting/VoteTimer'
import { VoteCard } from '@/components/voting/VoteCard'
import { getUserVotes } from '@/actions/votes'
import { getCurrentDayNumber } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function VotePage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/auth/login?redirect=/vote')
  }

  const user = await prisma.user.findUnique({
    where: { supabaseId: authUser.id }
  })

  if (!user) {
    redirect('/auth/login?redirect=/vote')
  }

  const dayNumber = getCurrentDayNumber()

  const submissions = await prisma.submission.findMany({
    where: {
      status: 'APPROVED',
      daySubmitted: dayNumber,
    },
    orderBy: { voteCount: 'desc' },
    include: {
      author: { select: { displayName: true, id: true } }
    }
  })

  const userVoteIds = await getUserVotes()

  return (
    <div className="container-manuscript">
      <PageTitle 
        title="The Voting Hall" 
        subtitle="Decide what becomes part of the story." 
        annotation="Public Vote" 
      />

      <div className="mb-12">
        <VoteTimer />
      </div>

      <div className="mb-8 flex justify-between items-end border-b border-[var(--color-ruled-line)] pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">
            Day {dayNumber} Candidates
          </h2>
          <p className="font-serif text-sm text-[var(--color-faded-ink)] mt-1">
            {submissions.length} sentences in queue
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-margin-note)]">
            Your Votes Today
          </p>
          <p className="font-serif font-bold text-[var(--color-ink)]">
            {userVoteIds.length}
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-[var(--color-ruled-line)]">
          <p className="font-serif text-lg italic text-[var(--color-pencil)]">
            The voting queue is currently empty.
          </p>
          <p className="font-mono text-xs text-[var(--color-margin-note)] mt-2">
            Waiting for moderators to approve new submissions.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map(submission => (
            <VoteCard
              key={submission.id}
              id={submission.id}
              content={submission.content}
              authorName={submission.author.displayName}
              voteCount={submission.voteCount}
              hasVoted={userVoteIds.includes(submission.id)}
              isOwnSubmission={submission.author.id === user.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
