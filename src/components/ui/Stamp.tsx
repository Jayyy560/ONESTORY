interface StampProps {
  status: 'ACCEPTED' | 'REJECTED' | 'PENDING' | 'APPROVED' | 'REMOVED'
  className?: string
}

const stampStyles: Record<StampProps['status'], string> = {
  ACCEPTED: 'border-[var(--color-red-stamp)] text-[var(--color-red-stamp)] rotate-[-2deg]',
  REJECTED: 'border-[var(--color-pencil)] text-[var(--color-pencil)] rotate-[1deg]',
  PENDING: 'border-[var(--color-margin-note)] text-[var(--color-margin-note)] rotate-[-1deg]',
  APPROVED: 'border-[var(--color-archive-gold)] text-[var(--color-archive-gold)] rotate-[-2deg]',
  REMOVED: 'border-[var(--color-pencil)] text-[var(--color-pencil)] line-through rotate-[2deg] opacity-60',
}

export function Stamp({ status, className = '' }: StampProps) {
  return (
    <span
      className={`inline-block rounded-sm border-2 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] ${stampStyles[status]} ${className}`}
      style={{ fontVariantCaps: 'all-small-caps' }}
    >
      {status}
    </span>
  )
}
