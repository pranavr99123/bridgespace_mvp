"use client";

import { useEffect, useState } from "react";
import type { VaultEntry } from "@/lib/types";

export function useVault() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const response = await fetch("/api/vault");
        const json = await response.json();
        if (!active) return;
        if (Array.isArray(json.entries)) {
          setEntries(
            json.entries.map((item: Record<string, unknown>) => ({
              id: String(item.id),
              mode: (item.mode as VaultEntry["mode"]) ?? "pulse",
              createdAt: String(item.created_at ?? new Date().toISOString()),
              title: String(item.title ?? "Session"),
              summary: String(item.summary ?? ""),
              tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
              isMilestone: Boolean(item.is_milestone),
              highlight: item.highlight ? String(item.highlight) : undefined,
              responseContent: item.response_content ? String(item.response_content) : undefined,
            })),
          );
        }
      } catch {
        setEntries([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  return { entries, loading };
}
