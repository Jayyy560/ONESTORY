import { prisma } from '@/lib/prisma'
import { PageTitle } from '@/components/ui/PageTitle'
import { RejectedSentence } from '@/components/alternate/RejectedSentence'
import { getCurrentDayNumber } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function AlternateFuturesPage() {
  const rejectedSubmissions = await prisma.submission.findMany({
    where: { status: 'REJECTED' },
    orderBy: [
      { daySubmitted: 'desc' },
      { voteCount: 'desc' }
    ],
    include: {
      author: { select: { displayName: true, id: true } }
    }
  })

  // Group by day
  const groupedByDay: Map<number, typeof rejectedSubmissions> = new Map()
  for (const sub of rejectedSubmissions) {
    const group = groupedByDay.get(sub.daySubmitted) || []
    group.push(sub)
    groupedByDay.set(sub.daySubmitted, group)
  }

  return (
    <div className="container-manuscript">
      <PageTitle 
        title="Alternate Futures" 
        subtitle="The sentences that almost became part of history." 
        annotation="The Paths Not Taken" 
      />

      <div className="mb-12 border-b border-[var(--color-ruled-line)] pb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-margin-note)]">
          Total Sentences Lost to Time
        </p>
        <p className="font-serif text-2xl text-[var(--color-ink)] mt-1">
          {rejectedSubmissions.length}
        </p>
      </div>

      {rejectedSubmissions.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-serif text-xl italic text-[var(--color-pencil)]">
            No alternate futures exist yet.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {Array.from(groupedByDay.entries()).map(([day, subs]) => (
            <div key={day}>
              <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-6 border-b border-[var(--color-ruled-line)] pb-2">
                Day {day}
              </h2>
              <div className="space-y-6">
                {subs.map(sub => (
                  <RejectedSentence
                    key={sub.id}
                    content={sub.content}
                    authorName={sub.author.displayName}
                    authorId={sub.author.id}
                    voteCount={sub.voteCount}
                    dayNumber={sub.daySubmitted}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
