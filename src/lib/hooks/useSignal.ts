"use client";

import { useEffect, useState } from "react";
import type { SignalObservation } from "@/lib/types";

export function useSignal() {
  const [observations, setObservations] = useState<SignalObservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const response = await fetch("/api/signal");
        const json = await response.json();
        if (!active) return;
        if (Array.isArray(json.observations)) {
          setObservations(
            json.observations.map((item: Record<string, unknown>) => ({
              id: String(item.id),
              category: (item.category as SignalObservation["category"]) ?? "repair",
              observation: String(item.observation ?? ""),
              confidence: Number(item.confidence ?? 0),
              supportingSessionCount: Array.isArray(item.session_ids)
                ? (item.session_ids as unknown[]).length
                : 0,
              createdAt: String(item.created_at ?? new Date().toISOString()),
            })),
          );
        }
      } catch {
        setObservations([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  return { observations, loading };
}
