import React from 'react'

interface ArchiveLabelProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function ArchiveLabel({ label, value, className = '' }: ArchiveLabelProps) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-margin-note)]">
        {label}
      </span>
      <span className="font-serif text-sm text-[var(--color-faded-ink)]">
        {value}
      </span>
    </div>
  )
}
