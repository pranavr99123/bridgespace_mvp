import { Suspense } from "react";

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="p-8 text-center text-[var(--muted)]">Loading…</div>}>{children}</Suspense>;
}
