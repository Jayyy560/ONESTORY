import { prisma } from '@/lib/prisma'
import { PageTitle } from '@/components/ui/PageTitle'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentDayNumber } from '@/lib/constants'
import { ApproveButton, RemoveButton, CanonizeButton } from '@/components/admin/AdminActions'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/auth/login?redirect=/admin')
  }

  const user = await prisma.user.findUnique({
    where: { supabaseId: authUser.id }
  })

  if (!user || user.role !== 'ADMIN') {
    redirect('/')
  }

  const dayNumber = getCurrentDayNumber()

  const pendingSubmissions = await prisma.submission.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { displayName: true } } }
  })

  const approvedSubmissions = await prisma.submission.findMany({
    where: { status: 'APPROVED', daySubmitted: dayNumber },
    orderBy: { voteCount: 'desc' },
    include: { author: { select: { displayName: true } } }
  })

  return (
    <div className="container-manuscript">
      <PageTitle 
        title="Moderation" 
        annotation="Admin Panel" 
      />

      <div className="mb-12 border border-[var(--color-ruled-line)] bg-[var(--color-aged-paper)] p-6 flex justify-between items-center">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-margin-note)] mb-1">
            Current Day
          </p>
          <p className="font-display text-2xl font-bold text-[var(--color-ink)]">
            Day {dayNumber}
          </p>
        </div>
        <CanonizeButton />
      </div>

      <div className="space-y-16">
        {/* Pending Review */}
        <section>
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-6 border-b border-[var(--color-ruled-line)] pb-2">
            Pending Review ({pendingSubmissions.length})
          </h2>
          
          {pendingSubmissions.length === 0 ? (
            <p className="font-serif italic text-[var(--color-pencil)]">No pending submissions.</p>
          ) : (
            <div className="space-y-4">
              {pendingSubmissions.map(sub => (
                <div key={sub.id} className="flex gap-4 border border-[var(--color-ruled-line)] p-4">
                  <div className="flex-1">
                    <p className="font-serif text-lg text-[var(--color-ink)]">{sub.content}</p>
                    <p className="font-mono text-[10px] text-[var(--color-margin-note)] mt-2">
                      By {sub.author.displayName} · {sub.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 justify-center">
                    <ApproveButton submissionId={sub.id} />
                    <RemoveButton submissionId={sub.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Approved Queue */}
        <section>
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-6 border-b border-[var(--color-ruled-line)] pb-2">
            Approved Queue - Day {dayNumber} ({approvedSubmissions.length})
          </h2>
          
          {approvedSubmissions.length === 0 ? (
            <p className="font-serif italic text-[var(--color-pencil)]">No approved submissions in queue for today.</p>
          ) : (
            <div className="space-y-4">
              {approvedSubmissions.map(sub => (
                <div key={sub.id} className="flex gap-4 border border-[var(--color-ruled-line)] p-4">
                  <div className="flex-1">
                    <p className="font-serif text-lg text-[var(--color-ink)]">{sub.content}</p>
                    <p className="font-mono text-[10px] text-[var(--color-margin-note)] mt-2">
                      By {sub.author.displayName} · {sub.voteCount} votes
                    </p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <RemoveButton submissionId={sub.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
