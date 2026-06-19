import Link from 'next/link'
import { Stamp } from '@/components/ui/Stamp'

interface AcceptedSentence {
  sequenceNumber: number
  content: string
  authorName: string
  authorId: string
  voteCount: number
}

interface DayEntryProps {
  dayNumber: number
  date: Date
  totalSubmissions: number
  acceptedCount: number
  sentences: AcceptedSentence[]
}

export function DayEntry({ dayNumber, date, totalSubmissions, acceptedCount, sentences }: DayEntryProps) {
  return (
    <article className="border-b border-[var(--color-ruled-line)] py-10 last:border-b-0">
      {/* Day header — newspaper dateline style */}
      <header className="mb-6">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-margin-note)]">
              Day {dayNumber}
            </span>
            <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mt-1">
              {date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <div className="text-right">
            <Stamp status="ACCEPTED" />
            <p className="font-mono text-[10px] text-[var(--color-margin-note)] mt-1">
              {acceptedCount} of {totalSubmissions} submissions
            </p>
          </div>
        </div>
        <div className="h-px bg-[var(--color-ruled-line)] mt-4" />
      </header>

      {/* Accepted sentences */}
      <div className="space-y-3">
        {sentences.map((sentence) => (
          <div key={sentence.sequenceNumber} className="flex gap-4">
            <span className="font-mono text-[11px] text-[var(--color-margin-note)] w-8 text-right flex-shrink-0 pt-0.5">
              {sentence.sequenceNumber}
            </span>
            <div className="flex-1">
              <p className="font-serif text-base leading-relaxed text-[var(--color-ink)]">
                {sentence.content}
              </p>
              <p className="font-mono text-[10px] text-[var(--color-margin-note)] mt-1">
                <Link href={`/contributor/${sentence.authorId}`} className="hover:text-[var(--color-archive-gold)]">
                  {sentence.authorName}
                </Link>
                {' · '}
                {sentence.voteCount} votes
              </p>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
