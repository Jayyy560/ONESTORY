import Link from 'next/link'

interface RejectedSentenceProps {
  content: string
  authorName: string
  authorId: string
  voteCount: number
  dayNumber: number
}

export function RejectedSentence({ content, authorName, authorId, voteCount, dayNumber }: RejectedSentenceProps) {
  return (
    <div className="group relative border-l-2 border-[var(--color-ruled-line)] py-4 pl-6 hover:border-[var(--color-margin-note)] transition-colors">
      <p className="font-serif text-base leading-relaxed text-[var(--color-pencil)] italic">
        {content}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <span className="font-mono text-[10px] text-[var(--color-margin-note)]">
          Day {dayNumber}
        </span>
        <span className="text-[var(--color-ruled-line)]">&middot;</span>
        <Link
          href={`/contributor/${authorId}`}
          className="font-mono text-[10px] text-[var(--color-margin-note)] hover:text-[var(--color-archive-gold)]"
        >
          {authorName}
        </Link>
        <span className="text-[var(--color-ruled-line)]">&middot;</span>
        <span className="font-mono text-[10px] text-[var(--color-margin-note)]">
          {voteCount} votes
        </span>
      </div>
    </div>
  )
}
