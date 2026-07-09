import { create } from "zustand";
import type { Mood, AIAnalysis, GameStats } from "../../../shared/types";

interface IdleState {
  seconds: number;
  phase: "active" | "idle" | "yawning" | "sleeping";
}

interface Store {
  mood: Mood;
  confidence: number;
  message: string;
  reason: string;
  isMinimized: boolean;
  isCelebrating: boolean;
  idle: IdleState;
  stats: GameStats;
  showDetails: boolean;

  setAnalysis: (analysis: AIAnalysis) => void;
  setMinimized: (v: boolean) => void;
  setCelebrating: (v: boolean) => void;
  setIdle: (seconds: number) => void;
  setActive: () => void;
  setStats: (stats: GameStats) => void;
  toggleDetails: () => void;
}

const defaultStats: GameStats = {
  xp: 0,
  level: 1,
  coins: 0,
  streak: 0,
  lastSolvedDate: "",
  problemsSolved: 0,
  totalSolveTimeMinutes: 0,
  achievements: [],
};

export const useStore = create<Store>((set) => ({
  mood: "thinking",
  confidence: 50,
  message: "I'm watching your progress...",
  reason: "",
  isMinimized: false,
  isCelebrating: false,
  idle: { seconds: 0, phase: "active" },
  stats: defaultStats,
  showDetails: false,

  setAnalysis: (analysis) =>
    set({
      mood: analysis.mood,
      confidence: analysis.confidence,
      message: analysis.message,
      reason: analysis.reason,
      idle: { seconds: 0, phase: "active" },
    }),

  setMinimized: (v) => set({ isMinimized: v }),
  setCelebrating: (v) => set({ isCelebrating: v }),

  setIdle: (seconds) =>
    set({
      idle: {
        seconds,
        phase:
          seconds < 30 ? "idle"
          : seconds < 90 ? "yawning"
          : "sleeping",
      },
    }),

  setActive: () => set({ idle: { seconds: 0, phase: "active" } }),
  setStats: (stats) => set({ stats }),
  toggleDetails: () => set((s) => ({ showDetails: !s.showDetails })),
}));
