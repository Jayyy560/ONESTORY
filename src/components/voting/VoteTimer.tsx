'use client'

import { useState, useEffect } from 'react'
import { DAILY_LOCK_HOUR_UTC, DAILY_LOCK_MINUTE_UTC } from '@/lib/constants'

export function VoteTimer() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    function calculateTimeLeft() {
      const now = new Date()
      const lockTime = new Date(now)
      lockTime.setUTCHours(DAILY_LOCK_HOUR_UTC, DAILY_LOCK_MINUTE_UTC, 0, 0)

      if (now >= lockTime) {
        setTimeLeft(null)
        return
      }

      const diffMs = lockTime.getTime() - now.getTime()
      setTimeLeft({
        hours: Math.floor(diffMs / (1000 * 60 * 60)),
        minutes: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diffMs % (1000 * 60)) / 1000),
      })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!timeLeft) {
    return (
      <div className="border border-[var(--color-red-stamp)] bg-[var(--color-aged-paper)] px-6 py-4 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-red-stamp)]">
          Today&apos;s Canonization Has Concluded
        </p>
        <p className="font-serif text-sm italic text-[var(--color-pencil)] mt-1">
          Voting resumes tomorrow.
        </p>
      </div>
    )
  }

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className="border border-[var(--color-ruled-line)] bg-[var(--color-aged-paper)] px-6 py-4 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-margin-note)] mb-2">
        Time Remaining Until Daily Canonization
      </p>
      <p className="font-mono text-3xl tracking-[0.1em] text-[var(--color-ink)]">
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </p>
      <p className="font-serif text-xs italic text-[var(--color-pencil)] mt-2">
        11:00 PM IST · The top 30 sentences will become part of the story.
      </p>
    </div>
  )
}
