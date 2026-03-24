export type Mode = "pulse" | "mirror";
export type PartnerRole = "A" | "B";

export interface PortraitState {
  warmth: number;
  complexity: number;
  tension: number;
  openness: number;
  momentum: number;
  color_seed: string;
  gap_marks: number;
  milestones: string[];
}

export interface CoupleState {
  partnerAName: string;
  partnerBName: string;
  pulseTodayCompleted: boolean;
  signalObservations: SignalObservation[];
  vault: VaultEntry[];
  portrait: PortraitState;
}

export interface SignalObservation {
  id: string;
  category: "bid_response" | "empathy" | "escalation" | "repair" | "avoidance";
  observation: string;
  confidence: number;
  supportingSessionCount: number;
  createdAt: string;
}

export interface VaultEntry {
  id: string;
  mode: Mode;
  createdAt: string;
  title: string;
  summary: string;
  tags: string[];
  isMilestone: boolean;
  highlight?: string;
  responseContent?: string;
}

export interface PulseState {
  prompt: string;
  bidType: string;
  responseA: string;
  responseB: string;
  submittedA: boolean;
  submittedB: boolean;
}

export interface MirrorState {
  topic: string;
  oneDirectionOnly: boolean;
  shareA: { situation: string; emotion: string; need: string; coreMessage: string };
  reflectionB: string;
  needCheckA: string;
  submittedShareA: boolean;
  submittedReflectionB: boolean;
  submittedNeedCheckA: boolean;
  directionADone: boolean;
  choseToDoB: boolean | null;
  shareB: { situation: string; emotion: string; need: string; coreMessage: string };
  reflectionA: string;
  needCheckB: string;
  submittedShareB: boolean;
  submittedReflectionA: boolean;
  submittedNeedCheckB: boolean;
  directionBDone: boolean;
  aiFeedback: {
    capturedSituation: boolean;
    capturedEmotion: boolean;
    capturedNeed: boolean;
    capturedCoreMessage: boolean;
    gentleNote: string | null;
    suggestions: string[];
  } | null;
}
