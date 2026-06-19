import Link from 'next/link'

interface SentenceBlockProps {
  sequenceNumber: number
  content: string
  authorName: string
  authorId: string
  acceptedAt: Date
  dayNumber: number
}

export function SentenceBlock({
  sequenceNumber,
  content,
  authorName,
  authorId,
  acceptedAt,
  dayNumber,
}: SentenceBlockProps) {
  return (
    <div className="group relative py-3 pl-16 md:pl-20" id={`sentence-${sequenceNumber}`}>
      {/* Sentence number in margin */}
      <span className="absolute left-0 top-3.5 font-mono text-[11px] text-[var(--color-margin-note)] select-none w-12 md:w-16 text-right pr-4">
        {sequenceNumber}
      </span>
      
      {/* The sentence itself */}
      <p className="font-serif text-lg md:text-xl leading-relaxed text-[var(--color-ink)]">
        {content}
      </p>
      
      {/* Attribution — only visible on hover */}
      <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="font-mono text-[10px] text-[var(--color-margin-note)]">
          <Link href={`/contributor/${authorId}`} className="hover:text-[var(--color-archive-gold)] transition-colors">
            {authorName}
          </Link>
          {' · '}
          Day {dayNumber}
          {' · '}
          {acceptedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  )
}
