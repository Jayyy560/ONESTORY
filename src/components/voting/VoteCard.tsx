'use client'

import { useState, useTransition } from 'react'
import { castVote, removeVote } from '@/actions/votes'

interface VoteCardProps {
  id: string
  content: string
  authorName: string
  voteCount: number
  hasVoted: boolean
  isOwnSubmission: boolean
}

export function VoteCard({ id, content, authorName, voteCount, hasVoted: initialHasVoted, isOwnSubmission }: VoteCardProps) {
  const [hasVoted, setHasVoted] = useState(initialHasVoted)
  const [displayVotes, setDisplayVotes] = useState(voteCount)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleVote() {
    setError(null)
    startTransition(async () => {
      if (hasVoted) {
        const result = await removeVote(id)
        if ('error' in result && result.error) {
          setError(result.error)
        } else {
          setHasVoted(false)
          setDisplayVotes(prev => prev - 1)
        }
      } else {
        const result = await castVote(id)
        if ('error' in result && result.error) {
          setError(result.error)
        } else {
          setHasVoted(true)
          setDisplayVotes(prev => prev + 1)
        }
      }
    })
  }

  return (
    <div className="border-b border-[var(--color-ruled-line)] py-6 last:border-b-0">
      <div className="flex gap-6">
        {/* Vote button */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            onClick={handleVote}
            disabled={isPending || isOwnSubmission}
            title={isOwnSubmission ? 'You cannot vote on your own submission' : hasVoted ? 'Remove vote' : 'Cast vote'}
            className={`flex h-10 w-10 items-center justify-center border-2 font-mono text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
              hasVoted
                ? 'border-[var(--color-archive-gold)] bg-[var(--color-archive-gold)] text-[var(--color-parchment)]'
                : 'border-[var(--color-ruled-line)] text-[var(--color-pencil)] hover:border-[var(--color-archive-gold)] hover:text-[var(--color-archive-gold)]'
            }`}
          >
            ▲
          </button>
          <span className="font-mono text-xs text-[var(--color-faded-ink)] font-medium">
            {displayVotes}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="font-serif text-lg leading-relaxed text-[var(--color-ink)]">
            {content}
          </p>
          <p className="mt-2 font-mono text-[10px] text-[var(--color-margin-note)]">
            Submitted by {authorName}
            {isOwnSubmission && ' · Your submission'}
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-2 ml-16 font-serif text-xs text-[var(--color-red-stamp)]">
          {error}
        </p>
      )}
    </div>
  )
}
