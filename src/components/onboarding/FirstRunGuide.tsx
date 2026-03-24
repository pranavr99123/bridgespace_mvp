"use client";

import { useState } from "react";

const steps = [
  {
    title: "Pulse (daily, 5 min)",
    body: "Use when you want a quick daily check-in. One partner shares, the other responds. Best for staying connected.",
  },
  {
    title: "Mirror (2-3x weekly, 15-20 min)",
    body: "Use when one of you feels misunderstood. You practice reflecting feelings and needs before problem-solving.",
  },
  {
    title: "Vault + Signal (weekly review)",
    body: "Use Vault to revisit what was said and agreed. Use Signal to spot recurring patterns and choose one behavior to improve.",
  },
];

export function FirstRunGuide() {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const seen = window.localStorage.getItem("bridgespace-guide-seen");
    return !seen;
  });

  if (!open) return null;

  return (
    <section className="card mb-5 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Quick walkthrough</h2>
          <p className="text-sm subtle">
            New here? This tells you when to use each tab and why.
          </p>
        </div>
        <button
          className="rounded-lg bg-[#233064] px-3 py-1 text-sm"
          onClick={() => {
            window.localStorage.setItem("bridgespace-guide-seen", "1");
            setOpen(false);
          }}
        >
          Dismiss
        </button>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {steps.map((step) => (
          <article key={step.title} className="rounded-lg bg-[#182347] p-3">
            <p className="text-sm font-semibold">{step.title}</p>
            <p className="mt-1 text-sm subtle">{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
