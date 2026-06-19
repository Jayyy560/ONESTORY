import { prisma } from '@/lib/prisma'
import { PageTitle } from '@/components/ui/PageTitle'
import { ArchiveLabel } from '@/components/ui/ArchiveLabel'
import { StoryReader } from '@/components/story/StoryReader'

export default async function Home() {
  const [sentenceCount, dayCount, userCount] = await Promise.all([
    prisma.sentence.count(),
    prisma.day.count(),
    prisma.user.count({
      where: {
        sentences: {
          some: {}
        }
      }
    })
  ])

  return (
    <div className="container-manuscript">
      <PageTitle 
        title="The Story" 
        subtitle="A document written by humanity, one sentence at a time." 
        annotation="Vol. I" 
      />

      <div className="mb-12 flex flex-wrap gap-x-12 gap-y-6 border-y border-[var(--color-ruled-line)] py-6">
        <ArchiveLabel label="Sentences" value={sentenceCount.toString()} />
        <ArchiveLabel label="Days" value={dayCount.toString()} />
        <ArchiveLabel label="Contributors" value={userCount.toString()} />
      </div>

      <StoryReader />
    </div>
  )
}
