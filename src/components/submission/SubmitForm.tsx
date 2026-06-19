'use client'

import { useState, useTransition } from 'react'
import { submitSentence } from '@/actions/submissions'
import { MAX_SENTENCE_LENGTH } from '@/lib/constants'

interface SubmitFormProps {
  disabled?: boolean
  disabledReason?: string
}

export function SubmitForm({ disabled = false, disabledReason }: SubmitFormProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const charCount = content.trim().length
  const charPercent = Math.min(100, (charCount / MAX_SENTENCE_LENGTH) * 100)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await submitSentence(content)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setContent('')
      }
    })
  }

  if (success) {
    return (
      <div className="border border-[var(--color-archive-gold)] bg-[var(--color-aged-paper)] p-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-archive-gold)] mb-3">
          Submission Received
        </p>
        <p className="font-serif text-lg text-[var(--color-faded-ink)]">
          Your sentence has been submitted for review.
        </p>
        <p className="font-serif text-sm italic text-[var(--color-pencil)] mt-2">
          If approved by a moderator, it will enter the public voting queue.
          Acceptance into the story is determined by community vote.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your sentence here..."
          disabled={disabled || isPending}
          rows={4}
          maxLength={MAX_SENTENCE_LENGTH + 50}
          className="w-full resize-none border border-[var(--color-ruled-line)] bg-[var(--color-aged-paper)] p-6 font-serif text-lg text-[var(--color-ink)] placeholder:text-[var(--color-margin-note)] placeholder:italic focus:border-[var(--color-archive-gold)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        {/* Character counter */}
        <div className="absolute bottom-3 right-3 font-mono text-[10px] text-[var(--color-margin-note)]">
          <span className={charCount > MAX_SENTENCE_LENGTH ? 'text-[var(--color-red-stamp)]' : ''}>
            {charCount}
          </span>
          /{MAX_SENTENCE_LENGTH}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-px w-full bg-[var(--color-ruled-line)]">
        <div
          className="h-px transition-all duration-200"
          style={{
            width: `${charPercent}%`,
            backgroundColor: charCount > MAX_SENTENCE_LENGTH ? 'var(--color-red-stamp)' : 'var(--color-archive-gold)',
          }}
        />
      </div>

      {error && (
        <p className="font-serif text-sm text-[var(--color-red-stamp)] border-l-2 border-[var(--color-red-stamp)] pl-4">
          {error}
        </p>
      )}

      {disabled && disabledReason && (
        <p className="font-serif text-sm italic text-[var(--color-pencil)] border-l-2 border-[var(--color-ruled-line)] pl-4">
          {disabledReason}
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-margin-note)]">
          One sentence. Choose your words carefully.
        </p>
        <button
          type="submit"
          disabled={disabled || isPending || charCount === 0 || charCount > MAX_SENTENCE_LENGTH}
          className="border-2 border-[var(--color-deep-brown)] bg-[var(--color-deep-brown)] px-8 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-parchment)] hover:bg-transparent hover:text-[var(--color-deep-brown)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isPending ? 'Submitting...' : 'Submit to the Archive'}
        </button>
      </div>
    </form>
  )
}
