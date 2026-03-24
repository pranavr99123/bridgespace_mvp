"use client";

import { useState } from "react";
import { HeartBurst } from "@/components/ui/HeartBurst";
import { SessionWrapper } from "@/components/session/SessionWrapper";
import { useAppStore } from "@/lib/store";

const shareFields = [
  { key: "situation" as const, placeholder: "When [situation]..." },
  { key: "emotion" as const, placeholder: "I felt [emotion]..." },
  { key: "need" as const, placeholder: "I needed..." },
  { key: "coreMessage" as const, placeholder: "I want you to understand..." },
];

export default function MirrorPage() {
  const { couple, mirror, updateMirror, completeSession, addSignal } = useAppStore();
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [heartBurst, setHeartBurst] = useState<string | null>(null);

  const triggerHeart = (id: string) => setHeartBurst(id);

  const shareAReady =
    mirror.topic &&
    mirror.shareA.situation &&
    mirror.shareA.emotion &&
    mirror.shareA.need &&
    mirror.shareA.coreMessage;
  const shareBReady =
    mirror.shareB.situation &&
    mirror.shareB.emotion &&
    mirror.shareB.need &&
    mirror.shareB.coreMessage;

  const phase =
    !mirror.submittedShareA
      ? "A_SHARE"
      : !mirror.submittedReflectionB
        ? "B_REFLECT"
        : !mirror.submittedNeedCheckA
          ? "A_NEEDCHECK"
          : !mirror.directionADone
            ? "A_NEEDCHECK"
            : mirror.choseToDoB === null
              ? "A_DONE"
              : mirror.choseToDoB === false
                ? "COMPLETE"
                : !mirror.submittedShareB
                  ? "B_SHARE"
                  : !mirror.submittedReflectionA
                    ? "A_REFLECT"
                    : !mirror.submittedNeedCheckB
                      ? "B_NEEDCHECK"
                      : !mirror.directionBDone
                        ? "B_NEEDCHECK"
                        : "COMPLETE";

  const sessionReady =
    phase === "COMPLETE" ||
    (mirror.directionADone && mirror.choseToDoB === false);

  const runFeedback = async () => {
    if (!sessionReady) return;
    setFeedbackBusy(true);
    try {
      const response = await fetch("/api/ai/mirror-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share: mirror.shareA,
          reflection: mirror.directionBDone
            ? `${mirror.reflectionB}\n---\n${mirror.reflectionA}`
            : `${mirror.reflectionB}\nNeed check: ${mirror.needCheckA}`,
        }),
      });
      const data = await response.json();
      const suggestions = Array.isArray(data.suggestions)
        ? data.suggestions
        : [
            data.gentle_note || "Name one exact feeling and one need before responding.",
            "Use 'I hear you needing X' before adding your perspective.",
            "Ask 'Did I get that right?' after reflecting.",
          ];
      updateMirror({
        aiFeedback: {
          capturedSituation: Boolean(data.captured_situation),
          capturedEmotion: Boolean(data.captured_emotion),
          capturedNeed: Boolean(data.captured_need),
          capturedCoreMessage: Boolean(data.captured_core_message),
          gentleNote: data.gentle_note ? String(data.gentle_note) : null,
          suggestions,
        },
      });
    } finally {
      setFeedbackBusy(false);
    }
  };

  const finish = () => {
    const shareContent = mirror.directionBDone
      ? `${mirror.shareA.situation} ${mirror.shareA.emotion} ${mirror.shareA.need} ${mirror.shareA.coreMessage}\n---\n${mirror.shareB.situation} ${mirror.shareB.emotion} ${mirror.shareB.need} ${mirror.shareB.coreMessage}`
      : `${mirror.shareA.situation} ${mirror.shareA.emotion} ${mirror.shareA.need} ${mirror.shareA.coreMessage}`;
    const reflectionContent = mirror.directionBDone
      ? `${mirror.reflectionB}\n---\n${mirror.reflectionA}`
      : mirror.reflectionB;
    const emotionsReflected = mirror.aiFeedback
      ? mirror.aiFeedback.capturedEmotion && mirror.aiFeedback.capturedNeed
      : undefined;
    completeSession(
      "mirror",
      mirror.directionBDone
        ? "Two-direction empathy mirror with both partners heard."
        : "One-direction empathy mirror.",
      ["empathy", "nvc"],
      {
        responseContent: `Share:\n${shareContent}\n\nReflections:\n${reflectionContent}`,
        emotionsReflected,
      },
    );
    addSignal({
      category: "empathy",
      observation: "Mirror session completed with feeling/need reflection.",
      confidence: 0.81,
      supportingSessionCount: 1,
    });
  };

  const step =
    phase === "COMPLETE" || sessionReady
      ? 6
      : phase === "A_DONE"
        ? 5
        : ["A_SHARE", "B_REFLECT", "A_NEEDCHECK", "B_SHARE", "A_REFLECT", "B_NEEDCHECK"].indexOf(phase) + 1;

  return (
    <>
      <SessionWrapper mode="mirror" step={Math.min(step, 6)} totalSteps={6}>
        <div className="mb-4 rounded-lg border border-[#324177] bg-[#182347] p-3 text-sm">
          <p className="font-semibold">What this tab is</p>
          <p className="subtle">
            Mirror is for feeling understood. Both partners take a turn: one shares, the other reflects, then you check. By default both directions run; you can skip the second if one person wants to focus on being heard.
          </p>
          <p className="mt-2 font-semibold">Why it matters</p>
          <p className="subtle">
            Arguments get worse when people feel misunderstood. Mirror trains accurate emotional listening.
          </p>
          <p className="mt-2 font-semibold">How to use it</p>
          <p className="subtle">
            The app shows whose turn it is. Complete each step in order; no manual switching needed.
          </p>
        </div>

        {phase === "A_SHARE" && (
          <div className="space-y-3">
            <input
              className="rounded-lg border border-[#34417a] bg-[#121a35] p-2 w-full"
              placeholder="Topic"
              maxLength={120}
              value={mirror.topic}
              onChange={(e) => updateMirror({ topic: e.target.value })}
            />
            {shareFields.map(({ key, placeholder }) => (
              <textarea
                key={key}
                className="rounded-lg border border-[#34417a] bg-[#121a35] p-2 w-full"
                placeholder={placeholder}
                value={mirror.shareA[key]}
                onChange={(e) =>
                  updateMirror({ shareA: { ...mirror.shareA, [key]: e.target.value } })
                }
              />
            ))}
            <span className="inline-flex items-center gap-2">
              <button
                className="rounded-lg bg-accent px-4 py-2 text-[#09122a]"
                disabled={!shareAReady}
                onClick={() => {
                  updateMirror({ submittedShareA: true });
                  triggerHeart("shareA");
                }}
              >
                Submit as {couple.partnerAName}
              </button>
              {heartBurst === "shareA" && <HeartBurst inline onComplete={() => setHeartBurst(null)} />}
            </span>
          </div>
        )}

        {phase === "B_REFLECT" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-[#34417a] bg-[#121a35] p-3">
              <p className="text-xs subtle mb-1">{couple.partnerAName}&apos;s share</p>
              <p className="text-sm">{mirror.shareA.situation}</p>
              <p className="text-sm subtle mt-1">Felt: {mirror.shareA.emotion}</p>
              <p className="text-sm subtle">Needed: {mirror.shareA.need}</p>
            </div>
            <textarea
              className="min-h-24 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-2"
              placeholder={`In your own words, what did ${couple.partnerAName} feel and need?`}
              value={mirror.reflectionB}
              onChange={(e) => updateMirror({ reflectionB: e.target.value })}
            />
            <span className="inline-flex items-center gap-2">
              <button
                className="rounded-lg bg-accent px-4 py-2 text-[#09122a]"
                disabled={!mirror.reflectionB.trim()}
                onClick={() => {
                  updateMirror({ submittedReflectionB: true });
                  triggerHeart("reflectB");
                }}
              >
                Submit as {couple.partnerBName}
              </button>
              {heartBurst === "reflectB" && <HeartBurst inline onComplete={() => setHeartBurst(null)} />}
            </span>
          </div>
        )}

        {phase === "A_NEEDCHECK" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-[#34417a] bg-[#121a35] p-3">
              <p className="text-xs subtle mb-1">{couple.partnerBName}&apos;s reflection</p>
              <p className="text-sm">{mirror.reflectionB}</p>
            </div>
            <textarea
              className="min-h-24 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-2"
              placeholder={`What need do you hear ${couple.partnerBName} naming for you?`}
              value={mirror.needCheckA}
              onChange={(e) => updateMirror({ needCheckA: e.target.value })}
            />
            <span className="inline-flex items-center gap-2">
              <button
                className="rounded-lg bg-accent px-4 py-2 text-[#09122a]"
                disabled={!mirror.needCheckA.trim()}
                onClick={() => {
                  updateMirror({ submittedNeedCheckA: true, directionADone: true });
                  triggerHeart("needCheckA");
                }}
              >
                Submit as {couple.partnerAName}
              </button>
              {heartBurst === "needCheckA" && <HeartBurst inline onComplete={() => setHeartBurst(null)} />}
            </span>
          </div>
        )}

        {phase === "A_DONE" && (
          <div className="space-y-4">
            <p className="text-sm subtle">
              {couple.partnerAName} felt heard. Now it&apos;s {couple.partnerBName}&apos;s turn to share and be reflected.
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="inline-flex items-center gap-2">
                <button
                  className="rounded-lg bg-accent px-4 py-2 text-[#09122a]"
                  onClick={() => {
                    updateMirror({ choseToDoB: true });
                    triggerHeart("continueB");
                  }}
                >
                  Continue — {couple.partnerBName}&apos;s turn
                </button>
                {heartBurst === "continueB" && <HeartBurst inline onComplete={() => setHeartBurst(null)} />}
              </span>
              <span className="inline-flex items-center gap-2">
                <button
                  className="rounded-lg bg-[#233064] px-4 py-2"
                  onClick={() => {
                    updateMirror({ choseToDoB: false });
                    triggerHeart("skipB");
                  }}
                >
                  Skip — one direction today
                </button>
                {heartBurst === "skipB" && <HeartBurst inline onComplete={() => setHeartBurst(null)} />}
              </span>
            </div>
          </div>
        )}

        {phase === "B_SHARE" && (
          <div className="space-y-3">
            <p className="text-sm subtle">
              {couple.partnerBName}, your turn to share. {couple.partnerAName} will reflect next.
            </p>
            {shareFields.map(({ key, placeholder }) => (
              <textarea
                key={key}
                className="rounded-lg border border-[#34417a] bg-[#121a35] p-2 w-full"
                placeholder={placeholder}
                value={mirror.shareB[key]}
                onChange={(e) =>
                  updateMirror({ shareB: { ...mirror.shareB, [key]: e.target.value } })
                }
              />
            ))}
            <span className="inline-flex items-center gap-2">
              <button
                className="rounded-lg bg-accent px-4 py-2 text-[#09122a]"
                disabled={!shareBReady}
                onClick={() => {
                  updateMirror({ submittedShareB: true });
                  triggerHeart("shareB");
                }}
              >
                Submit as {couple.partnerBName}
              </button>
              {heartBurst === "shareB" && <HeartBurst inline onComplete={() => setHeartBurst(null)} />}
            </span>
          </div>
        )}

        {phase === "A_REFLECT" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-[#34417a] bg-[#121a35] p-3">
              <p className="text-xs subtle mb-1">{couple.partnerBName}&apos;s share</p>
              <p className="text-sm">{mirror.shareB.situation}</p>
              <p className="text-sm subtle mt-1">Felt: {mirror.shareB.emotion}</p>
              <p className="text-sm subtle">Needed: {mirror.shareB.need}</p>
            </div>
            <textarea
              className="min-h-24 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-2"
              placeholder={`In your own words, what did ${couple.partnerBName} feel and need?`}
              value={mirror.reflectionA}
              onChange={(e) => updateMirror({ reflectionA: e.target.value })}
            />
            <span className="inline-flex items-center gap-2">
              <button
                className="rounded-lg bg-accent px-4 py-2 text-[#09122a]"
                disabled={!mirror.reflectionA.trim()}
                onClick={() => {
                  updateMirror({ submittedReflectionA: true });
                  triggerHeart("reflectA");
                }}
              >
                Submit as {couple.partnerAName}
              </button>
              {heartBurst === "reflectA" && <HeartBurst inline onComplete={() => setHeartBurst(null)} />}
            </span>
          </div>
        )}

        {phase === "B_NEEDCHECK" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-[#34417a] bg-[#121a35] p-3">
              <p className="text-xs subtle mb-1">{couple.partnerAName}&apos;s reflection</p>
              <p className="text-sm">{mirror.reflectionA}</p>
            </div>
            <textarea
              className="min-h-24 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-2"
              placeholder={`What need do you hear ${couple.partnerAName} naming for you?`}
              value={mirror.needCheckB}
              onChange={(e) => updateMirror({ needCheckB: e.target.value })}
            />
            <span className="inline-flex items-center gap-2">
              <button
                className="rounded-lg bg-accent px-4 py-2 text-[#09122a]"
                disabled={!mirror.needCheckB.trim()}
                onClick={() => {
                  updateMirror({ submittedNeedCheckB: true, directionBDone: true });
                  triggerHeart("needCheckB");
                }}
              >
                Submit as {couple.partnerBName}
              </button>
              {heartBurst === "needCheckB" && <HeartBurst inline onComplete={() => setHeartBurst(null)} />}
            </span>
          </div>
        )}

        {(phase === "COMPLETE" || (mirror.directionADone && mirror.choseToDoB === false)) && (
          <>
            <button
              className="rounded-lg bg-accent px-4 py-2 text-[#09122a]"
              onClick={runFeedback}
              disabled={feedbackBusy}
            >
              {feedbackBusy ? "Assessing Communication..." : "Assessing Communication"}
            </button>
            <p className="mt-2 text-xs subtle">
              Checks whether each person heard the other accurately and suggests specific improvements.
            </p>
          </>
        )}

        {mirror.aiFeedback && (
          <div className="mt-3 rounded-lg border border-[#39508d] bg-[#182347] p-3 text-sm">
            <p className="font-semibold">Communication suggestions</p>
            {mirror.aiFeedback.suggestions?.map((suggestion, i) => (
              <p key={i} className="mt-1 subtle">• {suggestion}</p>
            ))}
          </div>
        )}

        {(phase === "COMPLETE" || (mirror.directionADone && mirror.choseToDoB === false)) && (
          <div className="mt-4 space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-xl border border-[#34417a] bg-[#1a2448] p-4">
                <p className="mb-2 text-sm text-accent">{couple.partnerAName}</p>
                <p className="whitespace-pre-wrap">{`${mirror.shareA.situation}\nFelt: ${mirror.shareA.emotion}\nNeeded: ${mirror.shareA.need}\n\nReflection from ${couple.partnerBName}: ${mirror.reflectionB}`}</p>
              </article>
              {mirror.directionBDone ? (
                <article className="rounded-xl border border-[#34417a] bg-[#1a2448] p-4">
                  <p className="mb-2 text-sm text-accent-2">{couple.partnerBName}</p>
                  <p className="whitespace-pre-wrap">{`${mirror.shareB.situation}\nFelt: ${mirror.shareB.emotion}\nNeeded: ${mirror.shareB.need}\n\nReflection from ${couple.partnerAName}: ${mirror.reflectionA}`}</p>
                </article>
              ) : null}
            </div>
            <span className="inline-flex items-center gap-2">
              <button
                className="rounded-lg bg-accent-2 px-4 py-2 text-[#06251e]"
                onClick={() => {
                  finish();
                  triggerHeart("save");
                }}
              >
                Save Mirror Session
              </button>
              {heartBurst === "save" && <HeartBurst inline onComplete={() => setHeartBurst(null)} />}
            </span>
          </div>
        )}
      </SessionWrapper>
    </>
  );
}
