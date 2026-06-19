'use client'

import { useState, useTransition } from 'react'
import { approveSubmission, removeSubmission, runDailyCanonization } from '@/actions/admin'

export function ApproveButton({ submissionId }: { submissionId: string }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  if (done) return <span className="font-mono text-[10px] text-[var(--color-archive-gold)]">Approved</span>

  return (
    <button
      onClick={() => startTransition(async () => {
        await approveSubmission(submissionId)
        setDone(true)
      })}
      disabled={isPending}
      className="border border-[var(--color-archive-gold)] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-archive-gold)] hover:bg-[var(--color-archive-gold)] hover:text-[var(--color-parchment)] transition-colors disabled:opacity-50"
    >
      {isPending ? '...' : 'Approve'}
    </button>
  )
}

export function RemoveButton({ submissionId }: { submissionId: string }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  if (done) return <span className="font-mono text-[10px] text-[var(--color-red-stamp)]">Removed</span>

  return (
    <button
      onClick={() => startTransition(async () => {
        await removeSubmission(submissionId)
        setDone(true)
      })}
      disabled={isPending}
      className="border border-[var(--color-red-stamp)] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-red-stamp)] hover:bg-[var(--color-red-stamp)] hover:text-[var(--color-parchment)] transition-colors disabled:opacity-50"
    >
      {isPending ? '...' : 'Remove'}
    </button>
  )
}

export function CanonizeButton() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <button
        onClick={() => startTransition(async () => {
          const res = await runDailyCanonization()
          if ('error' in res) setResult(`Error: ${res.error}`)
          else setResult(`Canonization complete. ${res.accepted} accepted, ${res.rejected} rejected.`)
        })}
        disabled={isPending}
        className="border-2 border-[var(--color-red-stamp)] bg-[var(--color-red-stamp)] px-6 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-parchment)] hover:bg-transparent hover:text-[var(--color-red-stamp)] transition-colors disabled:opacity-50"
      >
        {isPending ? 'Processing...' : 'Run Daily Canonization'}
      </button>
      {result && (
        <p className="font-mono text-xs text-[var(--color-faded-ink)]">{result}</p>
      )}
    </div>
  )
}
