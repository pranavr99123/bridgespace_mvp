"use client";

import { useState } from "react";
import { HeartBurst } from "@/components/ui/HeartBurst";
import { SessionWrapper } from "@/components/session/SessionWrapper";
import { SimultaneousReveal } from "@/components/session/SimultaneousReveal";
import { useAppStore } from "@/lib/store";
import { hasHarshWords, hasLovingWords } from "@/lib/word-sentiment";

export default function PulsePage() {
  const { couple, pulse, updatePulse, completeSession, addSignal } = useAppStore();
  const [heartBurst, setHeartBurst] = useState<string | null>(null);
  const isATurn = !pulse.submittedA;
  const canReveal = pulse.submittedA && pulse.submittedB;

  const submitA = () => {
    if (!pulse.responseA.trim() || pulse.submittedA) return;
    updatePulse({ submittedA: true });
    setHeartBurst("a");
  };

  const submitB = () => {
    if (!pulse.responseB.trim() || pulse.submittedB) return;
    updatePulse({ submittedB: true });
    setHeartBurst("b");
  };

  const finish = () => {
    const combined = `${pulse.responseA} ${pulse.responseB}`;
    completeSession(
      "pulse",
      `Bid type "${pulse.bidType}" completed with a partner response and simultaneous reveal.`,
      ["daily-ritual", pulse.bidType],
      {
        responseContent: `Partner A: ${pulse.responseA}\nPartner B: ${pulse.responseB}`,
        harshWords: hasHarshWords(combined),
        lovingWords: hasLovingWords(combined),
      },
    );
    addSignal({
      category: "bid_response",
      observation: "Both partners reached simultaneous reveal.",
      confidence: 0.78,
      supportingSessionCount: 1,
    });
    setHeartBurst("save");
  };

  return (
    <SessionWrapper mode="pulse" step={canReveal ? 3 : isATurn ? 1 : 2} totalSteps={3}>
        <div className="mb-4 rounded-lg border border-[#324177] bg-[#182347] p-3 text-sm">
          <p className="font-semibold">What this tab is</p>
          <p className="subtle">
            Pulse is a 5-minute daily connection ritual. One partner shares something small, the other responds.
          </p>
          <p className="mt-2 font-semibold">Why it matters</p>
          <p className="subtle">
            It builds consistency and emotional responsiveness before issues grow into an argument.
          </p>
        </div>
        <p className="mb-3 subtle">{pulse.prompt}</p>
        {isATurn ? (
          <div className="space-y-3">
            <textarea
              maxLength={280}
              className="min-h-28 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-3"
              value={pulse.responseA}
              onChange={(e) => updatePulse({ responseA: e.target.value })}
              placeholder="Share your thoughts..."
              disabled={pulse.submittedA}
            />
            <span className="inline-flex items-center gap-2">
              <button className="rounded-lg bg-accent px-4 py-2 text-[#09122a]" onClick={submitA} disabled={pulse.submittedA}>
                {pulse.submittedA ? "Submitted" : `Submit as ${couple.partnerAName}`}
              </button>
              {heartBurst === "a" && <HeartBurst inline onComplete={() => setHeartBurst(null)} />}
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {pulse.submittedA ? (
              <div className="rounded-lg border border-[#34417a] bg-[#121a35] p-3">
                <p className="mb-1 text-xs subtle">{couple.partnerAName}&apos;s message</p>
                <p className="text-sm">{pulse.responseA}</p>
              </div>
            ) : null}
            <p className="rounded-lg border border-[#34417a] bg-[#121a35] p-2 text-sm subtle">
              Respond in plain language: acknowledge what you heard and share your response.
            </p>
            <textarea
              maxLength={280}
              className="min-h-28 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-3"
              value={pulse.responseB}
              onChange={(e) => updatePulse({ responseB: e.target.value })}
              placeholder="Write your response..."
              disabled={pulse.submittedB || !pulse.submittedA}
            />
            <span className="inline-flex items-center gap-2">
              <button className="rounded-lg bg-accent px-4 py-2 text-[#09122a]" onClick={submitB} disabled={pulse.submittedB || !pulse.submittedA}>
                {pulse.submittedB ? "Submitted" : `Submit as ${couple.partnerBName}`}
              </button>
              {heartBurst === "b" && <HeartBurst inline onComplete={() => setHeartBurst(null)} />}
            </span>
          </div>
        )}

        {!canReveal && (
          <p className="mt-4 text-sm subtle">
            {pulse.submittedA || pulse.submittedB
              ? "One response is in. The app will show the next person&apos;s turn."
              : "Both partners must submit before reveal."}
          </p>
        )}

        {canReveal && (
          <div className="mt-5 space-y-4">
            <SimultaneousReveal
              labelA={`${couple.partnerAName} (Bid)`}
              responseA={pulse.responseA}
              labelB={`${couple.partnerBName} (Response)`}
              responseB={pulse.responseB}
            />
            <span className="inline-flex items-center gap-2">
              <button className="rounded-lg bg-accent-2 px-4 py-2 text-[#06251e]" onClick={finish}>
                Save to Vault
              </button>
              {heartBurst === "save" && <HeartBurst inline onComplete={() => setHeartBurst(null)} />}
            </span>
          </div>
        )}
      </SessionWrapper>
  );
}
