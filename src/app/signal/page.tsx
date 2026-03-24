"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useSignal } from "@/lib/hooks/useSignal";
import { useVault } from "@/lib/hooks/useVault";
import { hasHarshOrExpletiveLanguage } from "@/lib/word-sentiment";

/** Cohesive accents: blue, sage, rose, gold — not rainbow */
const BUBBLE_COLORS = ["#94a8e0", "#7aab9f", "#c49aab", "#c9ae8c", "#7b8fd8", "#a89872"];

const FALLBACK_SUGGESTIONS = [
  "Before your next Mirror, try naming one exact feeling word before reflecting.",
  "In Pulse, acknowledge what you heard before adding your own response.",
  "Start one difficult conversation with 'I need to feel heard on this.'",
  "After your partner shares, ask 'Did I get that right?' before adding your view.",
];

function ThemeBubbles({
  items,
  vault,
}: {
  items: { observation: string }[];
  vault: { tags: string[]; summary: string; responseContent?: string; mode?: string }[];
}) {
  const wordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
      "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
      "will", "would", "could", "should", "may", "might", "must", "can", "this", "that", "these",
      "those", "i", "you", "he", "she", "it", "we", "they", "partner", "from", "when", "what",
      "how", "felt", "needed", "share", "reflections", "need", "check",
    ]);
    const add = (word: string) => {
      const w = word.toLowerCase().replace(/[^\w]/g, "");
      if (w.length >= 3 && !stopWords.has(w)) {
        counts[w] = (counts[w] ?? 0) + 1;
      }
    };
    vault.forEach((v) => {
      if (v.responseContent) {
        v.responseContent.split(/\s+/).forEach(add);
      } else {
        v.tags.forEach((t) => add(t));
        v.summary.split(/\s+/).forEach(add);
      }
    });
    items.forEach((i) => i.observation.split(/\s+/).forEach(add));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([word, count]) => ({ word, count }));
  }, [items, vault]);

  if (wordCounts.length === 0) return null;

  const maxCount = Math.max(...wordCounts.map((w) => w.count), 1);
  return (
    <div className="flex flex-wrap gap-3 items-end justify-center py-4">
      {wordCounts.map(({ word, count }, i) => (
        <div
          key={word}
          className="rounded-full flex flex-col items-center justify-end transition-transform hover:scale-110"
          style={{
            width: 24 + (count / maxCount) * 48,
            height: 24 + (count / maxCount) * 48,
            minWidth: 32,
            minHeight: 32,
            backgroundColor: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
            opacity: 0.85,
          }}
          title={`${word}: ${count}`}
        >
          <span className="text-xs font-medium text-white/90 p-1 overflow-hidden text-ellipsis max-w-full text-center">
            {word}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SignalPage() {
  const { couple } = useAppStore();
  const { observations } = useSignal();
  const { entries: vaultEntries } = useVault();
  const items = observations.length > 0 ? observations : couple.signalObservations;
  const vault = vaultEntries.length > 0 ? vaultEntries : couple.vault;

  const [insights, setInsights] = useState<{
    themes?: string[];
    behaviorChange?: string;
  } | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const harshLanguageDetected = useMemo(() => {
    const allText = vault
      .map((v) => v.responseContent ?? v.summary)
      .filter(Boolean)
      .join(" ");
    return hasHarshOrExpletiveLanguage(allText);
  }, [vault]);

  useEffect(() => {
    if (vault.length === 0 && items.length === 0) return;
    setInsightsLoading(true);
    fetch("/api/ai/signal-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vaultEntries: vault.map((v) => ({
          mode: v.mode ?? "pulse",
          responseContent: v.responseContent,
          summary: v.summary,
        })),
        observations: items.map((i) => ({
          observation: i.observation,
          category: i.category,
        })),
        harshLanguageDetected,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.themes || data.behaviorChange) {
          setInsights({ themes: data.themes, behaviorChange: data.behaviorChange });
        }
      })
      .catch(() => setInsights(null))
      .finally(() => setInsightsLoading(false));
  }, [vault, items, harshLanguageDetected]);

  const themes = useMemo(() => {
    const rawThemes: string[] = [];
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
      "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
      "will", "would", "could", "should", "may", "might", "must", "can", "this", "that", "these",
      "those", "i", "you", "he", "she", "it", "we", "they", "partner", "from", "when", "what", "how",
    ]);
    vault.forEach((v) => {
      const text = v.responseContent ?? v.summary;
      if (!text) return;
      const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !stopWords.has(w));
      const pairs: Record<string, number> = {};
      for (let i = 0; i < words.length - 1; i++) {
        const pair = `${words[i]} ${words[i + 1]}`;
        pairs[pair] = (pairs[pair] ?? 0) + 1;
      }
      Object.entries(pairs)
        .filter(([, c]) => c >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .forEach(([p]) => rawThemes.push(p));
    });
    const singleWordCounts: Record<string, number> = {};
    vault.forEach((v) => {
      const text = v.responseContent ?? v.summary;
      if (!text) return;
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !stopWords.has(w))
        .forEach((w) => {
          singleWordCounts[w] = (singleWordCounts[w] ?? 0) + 1;
        });
    });
    const topWords = Object.entries(singleWordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([w]) => w);
    return [...new Set([...rawThemes, ...topWords])].slice(0, 6);
  }, [vault]);

  const behaviorChange = useMemo(() => {
    if (insights?.behaviorChange) return insights.behaviorChange;
    return FALLBACK_SUGGESTIONS[vault.length % FALLBACK_SUGGESTIONS.length];
  }, [vault.length, insights?.behaviorChange]);

  if (items.length === 0 && vault.length === 0) {
    return (
      <section className="card p-5">
        <h2 className="text-xl font-semibold">Signal</h2>
        <p className="mt-2 text-sm subtle">
          Signal translates session history into plain-language communication patterns so you can adjust faster.
        </p>
        <p className="mt-2 subtle">Complete a few sessions to see your first communication pattern.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Signal</h2>
      <p className="text-sm subtle">
        Read each pattern, discuss whether it feels true, and test one small behavior change in your next session.
      </p>

      {(themes.length > 0 || items.length > 0) && (
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Themes we&apos;re noticing</h3>
          {themes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <span key={t} className="rounded-full bg-[#233064] px-3 py-1 text-sm">
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm subtle">Complete more sessions to surface themes.</p>
          )}
          <ThemeBubbles
            items={items.map((i) => ({ observation: i.observation }))}
            vault={vault.map((v) => ({ tags: v.tags, summary: v.summary, responseContent: v.responseContent, mode: v.mode }))}
          />
        </div>
      )}

      <div className="card border-l-4 border-l-[var(--accent)] p-4">
        <h3 className="font-semibold mb-2">One small behavior change before your next session</h3>
        <p className="text-sm">{insightsLoading ? "Analyzing patterns..." : behaviorChange}</p>
      </div>

      {items.map((item) => (
        <article key={item.id} className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full bg-[#233064] px-2 py-1 text-xs">{item.category}</span>
            <span className="text-xs subtle">confidence {item.confidence.toFixed(2)}</span>
          </div>
          <p>{item.observation}</p>
          <p className="mt-2 text-xs subtle">
            Supporting sessions: {item.supportingSessionCount} | {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </article>
      ))}
    </section>
  );
}
