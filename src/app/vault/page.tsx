"use client";

import { useMemo, useState } from "react";
import { VaultCard } from "@/components/vault/VaultCard";
import { useVault } from "@/lib/hooks/useVault";
import { useAppStore } from "@/lib/store";

export default function VaultPage() {
  const { couple } = useAppStore();
  const { entries: remoteEntries } = useVault();
  const [mode, setMode] = useState("all");
  const [search, setSearch] = useState("");
  const baseEntries = remoteEntries.length > 0 ? remoteEntries : couple.vault;

  const entries = useMemo(
    () =>
      baseEntries.filter((entry) => {
        const modePass = mode === "all" || entry.mode === mode;
        const text = `${entry.summary} ${entry.tags.join(" ")}`.toLowerCase();
        const searchPass = !search.trim() || text.includes(search.toLowerCase());
        return modePass && searchPass;
      }),
    [baseEntries, mode, search],
  );

  return (
    <section className="space-y-4">
      <div className="card p-4">
        <h2 className="text-xl font-semibold">Vault</h2>
        <p className="mt-2 text-sm subtle">
          Your shared archive. Use it to revisit what you actually said, what improved, and which topics keep repeating.
        </p>
        <div className="mt-3">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="rounded-lg border border-[#34417a] bg-[#121a35] px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="pulse">Pulse</option>
            <option value="mirror">Mirror</option>
          </select>
        </div>
        <input
          className="mt-3 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-2"
          placeholder="Search summary or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {entries.length === 0 ? (
        <p className="subtle">No entries yet. Complete Pulse or Mirror to populate your Vault.</p>
      ) : (
        <div className="grid gap-3">
          {entries.map((entry) => (
            <VaultCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
}
