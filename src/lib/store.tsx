"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { hasSupabaseEnv } from "@/lib/env";
import { createClientSafe } from "@/lib/supabase/client";
import { pulsePrompts } from "@/lib/prompt-data";
import { LS_PARTNER_A, LS_PARTNER_B, LS_PARTNER_JOINED_CONFIRMED } from "@/lib/partner-storage";
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
  partnerBJoinedConfirmed: boolean;
  confirmPartnerJoined: () => void;
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
  const [partnerBJoinedConfirmed, setPartnerBJoinedConfirmed] = useState(false);

  useEffect(() => {
    try {
      const a = localStorage.getItem(LS_PARTNER_A);
      const b = localStorage.getItem(LS_PARTNER_B);
      if (a || b) {
        setCouple((prev) => ({
          ...prev,
          partnerAName: a || prev.partnerAName,
          partnerBName: b || prev.partnerBName,
        }));
      }
      const joined = localStorage.getItem(LS_PARTNER_JOINED_CONFIRMED) === "1";
      const legacyLinked = localStorage.getItem("bridgespace-partner-b-linked") === "1";
      if (!joined && legacyLinked && b && b !== "Partner B") {
        localStorage.setItem(LS_PARTNER_JOINED_CONFIRMED, "1");
        setPartnerBJoinedConfirmed(true);
      } else {
        setPartnerBJoinedConfirmed(joined);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!hasSupabaseEnv()) return;
    const client = createClientSafe();
    if (!client) return;
    void client.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const meta = user.user_metadata as Record<string, string | undefined>;
      const name = meta?.display_name || meta?.full_name || meta?.name || meta?.given_name;
      if (!name) return;
      setCouple((prev) => {
        if (prev.partnerAName !== "Partner A") return prev;
        try {
          localStorage.setItem(LS_PARTNER_A, name);
        } catch {
          /* ignore */
        }
        return { ...prev, partnerAName: name };
      });
    });
  }, []);

  const confirmPartnerJoined = useCallback(() => {
    try {
      localStorage.setItem(LS_PARTNER_JOINED_CONFIRMED, "1");
    } catch {
      /* ignore */
    }
    setPartnerBJoinedConfirmed(true);
  }, []);

  const setPartnerNames = (partnerAName: string, partnerBName: string) => {
    try {
      localStorage.setItem(LS_PARTNER_A, partnerAName);
      localStorage.setItem(LS_PARTNER_B, partnerBName);
    } catch {
      /* ignore */
    }
    setCouple((prev) => ({ ...prev, partnerAName, partnerBName }));
  };

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
    partnerBJoinedConfirmed,
    confirmPartnerJoined,
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
