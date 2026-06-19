import { prisma } from '@/lib/prisma'
import { PageTitle } from '@/components/ui/PageTitle'
import { DayEntry } from '@/components/chronicle/DayEntry'

export default async function ChroniclePage() {
  const days = await prisma.day.findMany({
    orderBy: { dayNumber: 'desc' },
    include: {
      sentences: {
        orderBy: { sequenceNumber: 'asc' },
        include: {
          author: { select: { displayName: true, id: true } }
        }
      }
    }
  })

  return (
    <div className="container-manuscript">
      <PageTitle 
        title="The Daily Chronicle" 
        subtitle="A record of every day in the story's history." 
        annotation="Historical Record" 
      />

      {days.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-serif text-xl italic text-[var(--color-pencil)]">
            The chronicle will begin with the first canonization.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {days.map(day => (
            <DayEntry
              key={day.dayNumber}
              dayNumber={day.dayNumber}
              date={day.date}
              totalSubmissions={day.totalSubmissions}
              acceptedCount={day.acceptedCount}
              sentences={day.sentences.map(s => ({
                sequenceNumber: s.sequenceNumber,
                content: s.content,
                authorName: s.author.displayName,
                authorId: s.author.id,
                voteCount: s.voteCount,
              }))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
