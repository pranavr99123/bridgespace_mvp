"use client";

import { useEffect, useState } from "react";
import type { VaultEntry } from "@/lib/types";

export function VaultCard({ entry }: { entry: VaultEntry }) {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!entry.responseContent) {
      setAiSummary(null);
      return;
    }
    setLoading(true);
    fetch("/api/ai/vault-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        responseContent: entry.responseContent,
        mode: entry.mode,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.summary) setAiSummary(data.summary);
      })
      .catch(() => setAiSummary(null))
      .finally(() => setLoading(false));
  }, [entry.id, entry.responseContent, entry.mode]);

  const subtitle = aiSummary ?? (loading ? "Summarizing..." : entry.summary);

  return (
    <article className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="rounded-full bg-[#233064] px-2 py-1 text-xs uppercase">{entry.mode}</p>
        <p className="text-xs subtle">{new Date(entry.createdAt).toLocaleString()}</p>
      </div>
      <h3 className="text-lg font-semibold">{entry.title}</h3>
      <p className="mt-1 text-sm subtle">{subtitle}</p>
    </article>
  );
}
