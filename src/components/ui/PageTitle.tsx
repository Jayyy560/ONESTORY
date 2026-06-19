import { Divider } from './Divider'

interface PageTitleProps {
  title: string
  subtitle?: string
  annotation?: string
}

export function PageTitle({ title, subtitle, annotation }: PageTitleProps) {
  return (
    <header className="mb-12 mt-8">
      {annotation && (
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-margin-note)] mb-3">
          {annotation}
        </p>
      )}
      <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--color-ink)] tracking-tight leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 font-serif text-lg italic text-[var(--color-faded-ink)]">
          {subtitle}
        </p>
      )}
      <Divider variant="ornament" className="mt-8" />
    </header>
  )
}
