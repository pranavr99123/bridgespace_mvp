"use client";

import Link from "next/link";

export function LandingPage() {
  return (
    <div className="landing-root relative min-h-[calc(100vh-0px)] overflow-hidden px-5 py-16 md:py-24">
      <div className="landing-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-warm)] md:text-sm">
          For couples who want to feel closer
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-balance md:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-pink)] bg-clip-text text-transparent">
            Bridgespace
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-[var(--muted)] md:text-xl">
          A gentle place to check in, practice empathy, and notice patterns—so small moments of connection add up.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            href="/signup"
            className="inline-flex min-w-[280px] items-center justify-center rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-8 py-3.5 text-base font-semibold text-white shadow-[0_10px_36px_rgba(123,143,216,0.3)] transition hover:brightness-[1.05] hover:shadow-[0_14px_44px_rgba(123,143,216,0.34)]"
          >
            Get closer to your partner
          </Link>
          <p className="text-sm text-[var(--muted)]">
            Returning user?{" "}
            <Link href="/login" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mx-auto mt-20 grid max-w-2xl gap-6 text-left md:grid-cols-3 md:gap-4">
          {[
            {
              step: "1",
              title: "Pulse",
              desc: "A short daily check-in: share a feeling or need, respond with care.",
              border: "border-l-[var(--accent)]",
              badgeBg: "bg-[var(--accent)]/18 text-[var(--accent)]",
            },
            {
              step: "2",
              title: "Mirror",
              desc: "Practice reflecting what you heard—so your partner feels understood.",
              border: "border-l-[var(--accent-sage)]",
              badgeBg: "bg-[var(--accent-sage)]/18 text-[var(--accent-sage)]",
            },
            {
              step: "3",
              title: "Signal",
              desc: "See themes from your real words and one small shift to try next time.",
              border: "border-l-[var(--accent-pink)]",
              badgeBg: "bg-[var(--accent-pink)]/18 text-[var(--accent-pink)]",
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`rounded-2xl border border-[var(--card-border)] border-l-4 ${item.border} bg-[var(--panel-soft)]/95 p-5 backdrop-blur-sm`}
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${item.badgeBg}`}
              >
                {item.step}
              </span>
              <h2 className="mt-3 font-semibold text-[var(--foreground)]">{item.title}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{item.desc}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-16 max-w-md text-sm text-[var(--muted)]">
          Built for partners who are busy, tired, or navigating tension—and still want warmth on purpose.
        </p>
      </div>
    </div>
  );
}
