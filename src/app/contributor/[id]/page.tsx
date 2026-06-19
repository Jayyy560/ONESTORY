import { prisma } from '@/lib/prisma'
import { PageTitle } from '@/components/ui/PageTitle'
import { ArchiveLabel } from '@/components/ui/ArchiveLabel'
import { notFound } from 'next/navigation'

export default async function ContributorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const user = await prisma.user.findUnique({
    where: { id: resolvedParams.id },
    include: {
      sentences: {
        orderBy: { sequenceNumber: 'desc' }
      }
    }
  })

  if (!user) {
    notFound()
  }

  const daysActive = new Set(user.sentences.map(s => s.dayNumber)).size

  return (
    <div className="container-manuscript">
      <PageTitle 
        title={user.displayName} 
        annotation="Contributor Record" 
      />

      <div className="mb-12 flex flex-wrap gap-x-12 gap-y-6 border-y border-[var(--color-ruled-line)] py-6">
        <ArchiveLabel 
          label="Joined" 
          value={user.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} 
        />
        <ArchiveLabel label="Sentences Accepted" value={user.sentences.length.toString()} />
        <ArchiveLabel label="Days Active" value={daysActive.toString()} />
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-6 border-b border-[var(--color-ruled-line)] pb-2">
          Accepted Contributions
        </h2>

        {user.sentences.length === 0 ? (
          <p className="font-serif text-lg italic text-[var(--color-pencil)]">
            No accepted sentences yet.
          </p>
        ) : (
          <div className="space-y-6">
            {user.sentences.map(sentence => (
              <div key={sentence.id} className="flex gap-4">
                <span className="font-mono text-[11px] text-[var(--color-margin-note)] w-8 text-right flex-shrink-0 pt-0.5">
                  {sentence.sequenceNumber}
                </span>
                <div className="flex-1">
                  <p className="font-serif text-base leading-relaxed text-[var(--color-ink)]">
                    {sentence.content}
                  </p>
                  <p className="font-mono text-[10px] text-[var(--color-margin-note)] mt-1">
                    Day {sentence.dayNumber} · {sentence.acceptedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
