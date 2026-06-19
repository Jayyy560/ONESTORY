interface ChapterMarkerProps {
  dayNumber: number
  date: Date
  sentenceCount: number
}

export function ChapterMarker({ dayNumber, date, sentenceCount }: ChapterMarkerProps) {
  return (
    <div className="my-10 flex items-center gap-4" id={`day-${dayNumber}`}>
      <div className="h-px flex-1 bg-[var(--color-ruled-line)]" />
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-margin-note)]">
          Day {dayNumber}
        </p>
        <p className="font-serif text-xs italic text-[var(--color-pencil)]">
          {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p className="font-mono text-[9px] text-[var(--color-margin-note)] mt-0.5">
          {sentenceCount} {sentenceCount === 1 ? 'sentence' : 'sentences'} accepted
        </p>
      </div>
      <div className="h-px flex-1 bg-[var(--color-ruled-line)]" />
    </div>
  )
}
