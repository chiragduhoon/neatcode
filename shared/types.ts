export type Mood =
  | "thinking"
  | "neutral"
  | "happy"
  | "excited"
  | "celebrating"
  | "confused"
  | "worried"
  | "sad"
  | "crying";

export interface AIAnalysis {
  mood: Mood;
  confidence: number;
  reason: string;
  message: string;
  animation: string;
}

export interface CodeSnapshot {
  code: string;
  language: string;
  timestamp: number;
  problemTitle: string;
}

export interface AnalyzeRequest {
  currentCode: string;
  previousCode: string;
  language: string;
  problemTitle: string;
  diagnostics: string[];
  elapsedMinutes: number;
  attemptCount: number;
  lastMood: Mood;
  testResult?: "passed" | "failed" | "runtime_error" | null;
}

export interface GameStats {
  xp: number;
  level: number;
  coins: number;
  streak: number;
  lastSolvedDate: string;
  problemsSolved: number;
  totalSolveTimeMinutes: number;
  achievements: string[];
}

export interface Settings {
  groqApiKey: string;
  enabled: boolean;
  animationSpeed: "slow" | "normal" | "fast";
  speechFrequency: "low" | "normal" | "high";
  moodSensitivity: number;
  characterTheme: "default" | "dark" | "cute";
  showStats: boolean;
}

export type MessageType =
  | "ANALYSIS_RESULT"
  | "ANALYZE_CODE"
  | "STATS_UPDATE"
  | "SETTINGS_UPDATE"
  | "TEST_RESULT"
  | "GET_STATS"
  | "GET_SETTINGS"
  | "INJECT_BRIDGE";

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}
