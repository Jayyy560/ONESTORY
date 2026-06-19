import { prisma } from '@/lib/prisma'
import { PageTitle } from '@/components/ui/PageTitle'
import { SubmitForm } from '@/components/submission/SubmitForm'
import { getUserSubmissionStatus } from '@/actions/submissions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Divider } from '@/components/ui/Divider'

export default async function SubmitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/submit')
  }

  const status = await getUserSubmissionStatus()
  
  const recentSentences = await prisma.sentence.findMany({
    take: 5,
    orderBy: { sequenceNumber: 'desc' },
  })

  // Determine disabled state
  let disabled = false
  let disabledReason = ''

  if (status.isBanned) {
    disabled = true
    disabledReason = 'Your account has been suspended.'
  } else if (status.onCooldown) {
    disabled = true
    const daysLeft = status.cooldownUntil 
      ? Math.ceil((status.cooldownUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0
    disabledReason = `You are in a cooldown period. ${daysLeft} day(s) remaining. Your previous sentence was accepted into the story.`
  } else if (status.hasSubmittedToday) {
    disabled = true
    disabledReason = 'You have already submitted a sentence today. Wait for the daily canonization.'
  }

  return (
    <div className="container-manuscript">
      <PageTitle 
        title="Submit a Sentence" 
        subtitle="Your words could become part of history." 
        annotation="Submission Queue" 
      />

      <div className="mb-12">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-margin-note)] mb-4">
          Context: The Last 5 Sentences
        </h2>
        <div className="space-y-4 border-l-2 border-[var(--color-ruled-line)] pl-6 py-2">
          {recentSentences.reverse().map(sentence => (
            <p key={sentence.id} className="font-serif text-lg leading-relaxed text-[var(--color-faded-ink)]">
              {sentence.content}
            </p>
          ))}
          {recentSentences.length === 0 && (
            <p className="font-serif italic text-[var(--color-pencil)]">The story has not yet begun.</p>
          )}
        </div>
      </div>

      <Divider variant="rule" className="mb-12" />

      <div className="mb-8 border border-[var(--color-ruled-line)] bg-[var(--color-parchment)] p-6">
        <p className="font-serif text-sm leading-relaxed text-[var(--color-ink)]">
          <strong>Notice:</strong> Your sentence will be reviewed by a moderator before entering the voting queue. 
          The community will then vote, and at 11:00 PM IST, the top 30 sentences become permanent canon.
        </p>
      </div>

      <SubmitForm disabled={disabled} disabledReason={disabledReason} />
    </div>
  )
}
