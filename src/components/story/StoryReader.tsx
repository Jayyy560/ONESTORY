import { prisma } from '@/lib/prisma'
import { SentenceBlock } from './SentenceBlock'
import { ChapterMarker } from './ChapterMarker'

interface StoryReaderProps {
  fromDay?: number
}

export async function StoryReader({ fromDay }: StoryReaderProps) {
  const sentences = await prisma.sentence.findMany({
    orderBy: { sequenceNumber: 'asc' },
    include: {
      author: { select: { displayName: true, id: true } },
      day: true,
    },
    ...(fromDay ? { where: { dayNumber: { gte: fromDay } } } : {}),
  })

  if (sentences.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-xl italic text-[var(--color-pencil)]">
          The story has not yet begun.
        </p>
        <p className="font-mono text-xs text-[var(--color-margin-note)] mt-4">
          Be the first to submit a sentence.
        </p>
      </div>
    )
  }

  // Group sentences by day
  const dayGroups: Map<number, typeof sentences> = new Map()
  for (const sentence of sentences) {
    const group = dayGroups.get(sentence.dayNumber) || []
    group.push(sentence)
    dayGroups.set(sentence.dayNumber, group)
  }

  return (
    <article className="story-reader">
      {Array.from(dayGroups.entries()).map(([dayNumber, daySentences]) => (
        <section key={dayNumber}>
          <ChapterMarker
            dayNumber={dayNumber}
            date={daySentences[0].day.date}
            sentenceCount={daySentences.length}
          />
          {daySentences.map((sentence) => (
            <SentenceBlock
              key={sentence.id}
              sequenceNumber={sentence.sequenceNumber}
              content={sentence.content}
              authorName={sentence.author.displayName}
              authorId={sentence.author.id}
              acceptedAt={sentence.acceptedAt}
              dayNumber={sentence.dayNumber}
            />
          ))}
        </section>
      ))}
    </article>
  )
}
