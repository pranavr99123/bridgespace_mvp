"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartBurst } from "@/components/ui/HeartBurst";
import { FirstRunGuide } from "@/components/onboarding/FirstRunGuide";
import { Portrait } from "@/components/portrait/Portrait";
import { LS_PARTNER_A, LS_PARTNER_B } from "@/lib/partner-storage";
import { useAppStore } from "@/lib/store";

export default function HomePage() {
  const { couple, setPartnerNames, partnerBJoinedConfirmed, confirmPartnerJoined } = useAppStore();
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem("bridgespace-intro-shown");
  });
  const [introFading, setIntroFading] = useState(false);
  const [partnerAName, setPartnerAName] = useState(couple.partnerAName);
  const [partnerBName, setPartnerBName] = useState(couple.partnerBName);
  const [heartBurst, setHeartBurst] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pendingNameRaw = sessionStorage.getItem("bridgespace-pending-name");
    const pendingInvite = sessionStorage.getItem("bridgespace-pending-invite");
    let b = "Partner B";
    try {
      const stored = localStorage.getItem(LS_PARTNER_B);
      if (stored) b = stored;
    } catch {
      /* ignore */
    }
    let googleName: string | null = null;
    if (pendingNameRaw) {
      sessionStorage.removeItem("bridgespace-pending-name");
      googleName = pendingNameRaw;
      setPartnerAName(pendingNameRaw);
      setPartnerNames(pendingNameRaw, b);
    }
    if (pendingInvite) {
      sessionStorage.removeItem("bridgespace-pending-invite");
      const inviter =
        googleName ||
        (() => {
          try {
            return localStorage.getItem(LS_PARTNER_A) || "Your partner";
          } catch {
            return "Your partner";
          }
        })();
      void fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: pendingInvite, inviterName: inviter }),
      });
    }
  }, [setPartnerNames]);

  useEffect(() => {
    setPartnerAName(couple.partnerAName);
    setPartnerBName(couple.partnerBName);
  }, [couple.partnerAName, couple.partnerBName]);

  useEffect(() => {
    if (!showIntro) return;
    const startFade = window.setTimeout(() => setIntroFading(true), 1600);
    const hide = window.setTimeout(() => {
      setShowIntro(false);
      sessionStorage.setItem("bridgespace-intro-shown", "1");
    }, 2600);
    return () => {
      window.clearTimeout(startFade);
      window.clearTimeout(hide);
    };
  }, [showIntro]);

  const saveNames = () => {
    setPartnerNames(partnerAName.trim() || "Partner A", partnerBName.trim() || "Partner B");
    setHeartBurst(true);
  };

  return (
    <>
      {showIntro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)] transition-opacity duration-1000 ease-out"
          style={{ opacity: introFading ? 0 : 1 }}
        >
          <div className="text-center transition-opacity duration-700" style={{ opacity: introFading ? 0 : 1 }}>
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-[var(--accent)]/35 shadow-[0_0_64px_rgba(139,159,212,0.35)] ring-1 ring-[var(--accent)]/25 animate-pulse" />
            <h1 className="text-3xl font-semibold text-[var(--foreground)]">Welcome to Bridgespace</h1>
            <p className="mt-2 text-[var(--muted)]">A warmer way to communicate, one conversation at a time.</p>
          </div>
        </div>
      )}
      <FirstRunGuide />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="card border-l-4 border-l-[var(--accent)] bg-[var(--panel)] p-4">
            <h2 className="text-lg font-semibold">How to use Bridgespace</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Use <strong className="font-semibold text-[var(--foreground)]">Pulse</strong> for daily connection and{" "}
              <strong className="font-semibold text-[var(--foreground)]">Mirror</strong> for empathy practice. Sessions go to{" "}
              <strong className="font-semibold text-[var(--foreground)]">Vault</strong>, and{" "}
              <strong className="font-semibold text-[var(--foreground)]">Signal</strong> surfaces patterns.
            </p>
          </section>
          <Portrait state={couple.portrait} />
          <section className="card p-4">
            <h3 className="text-lg font-semibold">How this visual works</h3>
            <p className="mt-2 text-sm subtle">
              The scene brightens as communication improves and becomes stormier with strain.
            </p>
            <ul className="mt-2 space-y-1 text-sm subtle">
              <li>Warmth: rises with completed Pulse/Mirror sessions and responsive replies.</li>
              <li>Openness: rises when feelings and needs are expressed clearly in Mirror and Pulse.</li>
              <li>Tension: rises after difficult argument cycles, drops with calmer sessions and repair.</li>
              <li>Momentum: rises with consistent recent activity across tabs.</li>
            </ul>
          </section>
        </div>
        <aside className="space-y-4">
          {!partnerBJoinedConfirmed && (
            <div className="card border border-[var(--card-border)] bg-[var(--panel-soft)]/80 p-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Partner not in your menu yet?</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                After they accept your invite and join Bridgespace, confirm here so their name appears in the top bar next to yours.
              </p>
              <button
                type="button"
                className="mt-3 w-full rounded-full bg-[var(--accent)] py-2.5 text-sm font-semibold text-white hover:brightness-[1.06]"
                onClick={confirmPartnerJoined}
              >
                My partner has joined — show them in the app
              </button>
            </div>
          )}
          <div className="card p-4">
            <h2 className="text-xl font-semibold">Names in the app</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">How you and your partner appear in Pulse, Mirror, and elsewhere.</p>
            <div className="mt-3 grid gap-2">
              <input
                className="rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-2"
                value={partnerAName}
                onChange={(e) => setPartnerAName(e.target.value)}
                placeholder="Your name"
              />
              <input
                className="rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-2"
                value={partnerBName}
                onChange={(e) => setPartnerBName(e.target.value)}
                placeholder="Partner’s name (optional until they join)"
              />
              <span className="inline-flex items-center gap-2">
                <button
                  className="rounded-full bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-white hover:brightness-[1.06]"
                  onClick={saveNames}
                >
                  Save names
                </button>
                {heartBurst && <HeartBurst inline onComplete={() => setHeartBurst(false)} />}
              </span>
            </div>
          </div>

          <div className="card p-4">
          <h2 className="text-xl font-semibold">Today&apos;s Pulse</h2>
          <p className="mt-2 subtle">
            {couple.pulseTodayCompleted
              ? "Completed for today."
              : "Pending. One of you can start now."}
          </p>
          <p className="mt-2 text-sm subtle">
            Goal: one small emotional bid and one response. It keeps connection alive without a long talk.
          </p>
          <div className="mt-4 grid gap-2">
            <Link
              className="rounded-full bg-[var(--accent)] px-3 py-2.5 text-center text-sm font-semibold text-white hover:brightness-[1.06]"
              href="/pulse"
            >
              Start Pulse
            </Link>
            <Link
              className="rounded-full border border-[var(--card-border)] bg-[var(--panel-soft)] px-3 py-2.5 text-center text-sm font-medium text-[var(--foreground)] hover:ring-1 hover:ring-[var(--accent)]/30"
              href="/mirror"
            >
              Start Mirror
            </Link>
          </div>
          </div>
        </aside>
      </div>
    </>
  );
}
