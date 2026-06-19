import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto">
      {/* Decorative rule */}
      <div className="container-wide">
        <hr className="divider-rule" />
      </div>

      <div className="container-wide py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-display font-bold text-sm tracking-widest uppercase text-faded-ink">
              One Story
            </p>
            <p className="text-meta mt-0.5">
              The story belongs to everyone.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/story"
              className="nav-link text-xs"
            >
              Read from the Beginning
            </Link>
            <span className="text-annotation">
              &copy; {year}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
