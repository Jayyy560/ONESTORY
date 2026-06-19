interface DividerProps {
  /** Visual variant of the divider */
  variant?: "rule" | "ornament" | "chapter";
  /** Optional symbol for the ornament variant (defaults to ❧) */
  symbol?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Decorative divider inspired by old book typography.
 *
 * - `rule` — a simple horizontal line
 * - `ornament` — a line broken by a typographic ornament (❧, §, ※, etc.)
 * - `chapter` — a heavier double rule for major breaks
 */
export function Divider({
  variant = "rule",
  symbol = "❧",
  className = "",
}: DividerProps) {
  if (variant === "ornament") {
    return (
      <div
        className={`divider-ornament ${className}`}
        role="separator"
        aria-hidden="true"
      >
        <span className="font-display text-base select-none">{symbol}</span>
      </div>
    );
  }

  if (variant === "chapter") {
    return (
      <div
        className={`divider-chapter ${className}`}
        role="separator"
        aria-hidden="true"
      />
    );
  }

  return (
    <hr
      className={`divider-rule ${className}`}
      aria-hidden="true"
    />
  );
}
