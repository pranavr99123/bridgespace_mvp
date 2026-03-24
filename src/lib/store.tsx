"use client";

import { createContext, useContext, useState } from "react";
import { pulsePrompts } from "@/lib/prompt-data";
import type {
  CoupleState,
  MirrorState,
  Mode,
  PulseState,
  SignalObservation,
  VaultEntry,
} from "@/lib/types";

interface AppContextType {
  couple: CoupleState;
  pulse: PulseState;
  mirror: MirrorState;
  setPartnerNames: (partnerAName: string, partnerBName: string) => void;
  updatePulse: (value: Partial<PulseState>) => void;
  updateMirror: (value: Partial<MirrorState>) => void;
  completeSession: (
    mode: Mode,
    summary: string,
    tags: string[],
    options?: { responseContent?: string; emotionsReflected?: boolean; harshWords?: boolean; lovingWords?: boolean },
  ) => void;
  addSignal: (observation: Omit<SignalObservation, "id" | "createdAt">) => void;
}

const initialCouple: CoupleState = {
  partnerAName: "Partner A",
  partnerBName: "Partner B",
  pulseTodayCompleted: false,
  vault: [],
  signalObservations: [],
  portrait: {
    warmth: 56,
    complexity: 22,
    tension: 18,
    openness: 48,
    momentum: 40,
    color_seed: "#6f89ff",
    gap_marks: 0,
    milestones: [],
  },
};

const initialPulse: PulseState = {
  prompt: pulsePrompts[0].prompt,
  bidType: pulsePrompts[0].bidType,
  responseA: "",
  responseB: "",
  submittedA: false,
  submittedB: false,
};

const initialMirror: MirrorState = {
  topic: "",
  oneDirectionOnly: false,
  shareA: { situation: "", emotion: "", need: "", coreMessage: "" },
  reflectionB: "",
  needCheckA: "",
  submittedShareA: false,
  submittedReflectionB: false,
  submittedNeedCheckA: false,
  directionADone: false,
  choseToDoB: null,
  shareB: { situation: "", emotion: "", need: "", coreMessage: "" },
  reflectionA: "",
  needCheckB: "",
  submittedShareB: false,
  submittedReflectionA: false,
  submittedNeedCheckB: false,
  directionBDone: false,
  aiFeedback: null,
};

const AppContext = createContext<AppContextType | null>(null);

const score = (value: number, delta: number): number =>
  Math.max(0, Math.min(100, value + delta));

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [couple, setCouple] = useState<CoupleState>(initialCouple);
  const [pulse, setPulse] = useState<PulseState>(initialPulse);
  const [mirror, setMirror] = useState<MirrorState>(initialMirror);

  const setPartnerNames = (partnerAName: string, partnerBName: string) =>
    setCouple((prev) => ({ ...prev, partnerAName, partnerBName }));

  const updatePulse = (value: Partial<PulseState>) =>
    setPulse((prev) => ({ ...prev, ...value }));
  const updateMirror = (value: Partial<MirrorState>) =>
    setMirror((prev) => ({ ...prev, ...value }));

  const completeSession = (
    mode: Mode,
    summary: string,
    tags: string[],
    options?: { responseContent?: string; emotionsReflected?: boolean; harshWords?: boolean; lovingWords?: boolean },
  ) => {
    const entry: VaultEntry = {
      id: crypto.randomUUID(),
      mode,
      createdAt: new Date().toISOString(),
      title: `${mode[0].toUpperCase()}${mode.slice(1)} reflection`,
      summary,
      tags,
      isMilestone: couple.vault.filter((v) => v.mode === mode).length === 0,
      responseContent: options?.responseContent,
    };

    let tensionDelta = -1;
    if (options?.emotionsReflected === false || options?.harshWords) tensionDelta = 4;
    if (options?.lovingWords) tensionDelta = -3;
    if (options?.emotionsReflected === true && !options?.harshWords) tensionDelta = -2;

    setCouple((prev) => ({
      ...prev,
      pulseTodayCompleted: mode === "pulse" ? true : prev.pulseTodayCompleted,
      vault: [entry, ...prev.vault],
      portrait: {
        ...prev.portrait,
        warmth: score(prev.portrait.warmth, mode === "pulse" ? 4 : 2),
        complexity: score(prev.portrait.complexity, 3),
        tension: score(prev.portrait.tension, tensionDelta),
        openness: score(prev.portrait.openness, mode === "mirror" ? 4 : 1),
        momentum: score(prev.portrait.momentum, 5),
      },
    }));

    if (mode === "pulse") {
      setPulse({
        ...initialPulse,
        ...pulsePrompts[Math.floor(Math.random() * pulsePrompts.length)],
      });
    }
    if (mode === "mirror") setMirror(initialMirror);
  };

  const addSignal = (observation: Omit<SignalObservation, "id" | "createdAt">) =>
    setCouple((prev) => ({
      ...prev,
      signalObservations: [
        {
          ...observation,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
        ...prev.signalObservations,
      ],
    }));

  const value = {
    couple,
    pulse,
    mirror,
    setPartnerNames,
    updatePulse,
    updateMirror,
    completeSession,
    addSignal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used inside AppProvider");
  return context;
}
