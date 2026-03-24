"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartBurst } from "@/components/ui/HeartBurst";
import { FirstRunGuide } from "@/components/onboarding/FirstRunGuide";
import { Portrait } from "@/components/portrait/Portrait";
import { useAppStore } from "@/lib/store";

export default function HomePage() {
  const { couple, setPartnerNames } = useAppStore();
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem("bridgespace-intro-shown");
  });
  const [introFading, setIntroFading] = useState(false);
  const [partnerAName, setPartnerAName] = useState(couple.partnerAName);
  const [partnerBName, setPartnerBName] = useState(couple.partnerBName);
  const [heartBurst, setHeartBurst] = useState(false);

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1020] transition-opacity duration-1000 ease-out"
          style={{ opacity: introFading ? 0 : 1 }}
        >
          <div className="text-center transition-opacity duration-700" style={{ opacity: introFading ? 0 : 1 }}>
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-b from-[#ffd17a] to-[#ff8f7a] shadow-[0_0_80px_#ffb08a] animate-pulse" />
            <h1 className="text-3xl font-semibold">Welcome to Bridgespace</h1>
            <p className="mt-2 text-[#9ca8d4]">A warmer way to communicate, one conversation at a time.</p>
          </div>
        </div>
      )}
      <FirstRunGuide />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="card p-4">
            <h2 className="text-lg font-semibold">How to use Bridgespace</h2>
            <p className="mt-2 text-sm subtle">
              Use <strong>Pulse</strong> for daily connection and <strong>Mirror</strong> for empathy practice.
              Completed sessions go to <strong>Vault</strong>, and <strong>Signal</strong> shows your communication patterns.
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
        <aside className="card p-4">
          <h2 className="text-xl font-semibold">Partner names</h2>
          <p className="mt-2 text-sm subtle">Set the names used throughout the app.</p>
          <div className="mt-3 grid gap-2">
            <input
              className="rounded-lg border border-[#34417a] bg-[#121a35] p-2"
              value={partnerAName}
              onChange={(e) => setPartnerAName(e.target.value)}
              placeholder="Partner A name"
            />
            <input
              className="rounded-lg border border-[#34417a] bg-[#121a35] p-2"
              value={partnerBName}
              onChange={(e) => setPartnerBName(e.target.value)}
              placeholder="Partner B name"
            />
            <span className="inline-flex items-center gap-2">
              <button className="rounded-lg bg-[#233064] px-3 py-2 text-center" onClick={saveNames}>
                Save names
              </button>
              {heartBurst && <HeartBurst inline onComplete={() => setHeartBurst(false)} />}
            </span>
          </div>

          <h2 className="text-xl font-semibold mt-6">Today&apos;s Pulse</h2>
          <p className="mt-2 subtle">
            {couple.pulseTodayCompleted
              ? "Completed for today."
              : "Pending. One of you can start now."}
          </p>
          <p className="mt-2 text-sm subtle">
            Goal: one small emotional bid and one response. It keeps connection alive without a long talk.
          </p>
          <div className="mt-4 grid gap-2">
            <Link className="rounded-lg bg-accent px-3 py-2 text-center text-[#09122a]" href="/pulse">
              Start Pulse
            </Link>
            <Link className="rounded-lg bg-[#233064] px-3 py-2 text-center" href="/mirror">
              Start Mirror
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
