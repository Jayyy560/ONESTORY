"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/story", label: "The Story" },
  { href: "/submit", label: "Submit" },
  { href: "/vote", label: "Vote" },
  { href: "/chronicle", label: "Chronicle" },
  { href: "/alternate-futures", label: "Alternate Futures" },
] as const;

function getDayNumber(): number {
  // Day 1 = launch date. Using a fixed epoch for consistency.
  // This should be replaced with actual launch date from config/env.
  const LAUNCH_DATE = new Date("2025-01-01T00:00:00Z");
  const now = new Date();
  const diffMs = now.getTime() - LAUNCH_DATE.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dayNumber = getDayNumber();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <header className="border-b border-ruled-line">
      {/* ── Masthead ────────────────────────────────────────────── */}
      <div className="container-wide py-6 sm:py-8 text-center">
        <Link href="/" className="inline-block no-underline">
          <h1 className="heading-masthead text-2xl sm:text-3xl md:text-4xl tracking-widest">
            One Story
          </h1>
          <p className="font-body italic text-faded-ink text-sm sm:text-base mt-1 font-light">
            A Document Written by Humanity
          </p>
        </Link>
      </div>

      {/* ── Navigation Bar ──────────────────────────────────────── */}
      <div className="border-t border-ruled-line">
        <div className="container-wide flex items-center justify-between py-2.5">
          {/* Day indicator */}
          <span className="text-annotation shrink-0">
            Day {dayNumber}
          </span>

          {/* Desktop navigation */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth & mobile menu toggle */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-meta hidden sm:inline">
                  {user.user_metadata?.full_name ??
                    user.email?.split("@")[0] ??
                    "Contributor"}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-ghost text-xs"
                  type="button"
                >
                  Leave
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="btn btn-secondary text-xs"
                type="button"
              >
                Enter the Archive
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden btn btn-ghost p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              type="button"
            >
              <span className="font-mono text-lg leading-none" aria-hidden="true">
                {menuOpen ? "✕" : "☰"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {menuOpen && (
          <nav
            className="md:hidden border-t border-ruled-line"
            aria-label="Mobile navigation"
          >
            <div className="container-wide py-3 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link block py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
