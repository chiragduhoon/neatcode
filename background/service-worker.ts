import type { AnalyzeRequest, AIAnalysis, ExtensionMessage, Settings } from "../shared/types";

const DEFAULT_SETTINGS: Settings = {
  groqApiKey: "",
  enabled: true,
  animationSpeed: "normal",
  speechFrequency: "normal",
  moodSensitivity: 5,
  characterTheme: "default",
  showStats: true,
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
});

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === "ANALYZE_CODE") {
      analyzeCode(message.payload as AnalyzeRequest)
        .then(sendResponse)
        .catch((err) => sendResponse({ error: err.message }));
      return true; // keep channel open for async
    }

    if (message.type === "GET_SETTINGS") {
      chrome.storage.local.get("settings", (data) => {
        sendResponse(data.settings ?? DEFAULT_SETTINGS);
      });
      return true;
    }

    if (message.type === "SETTINGS_UPDATE") {
      chrome.storage.local.set({ settings: message.payload }, () =>
        sendResponse({ ok: true })
      );
      return true;
    }
  }
);

async function analyzeCode(req: AnalyzeRequest): Promise<AIAnalysis> {
  const data = await chrome.storage.local.get("settings");
  const settings: Settings = data.settings ?? DEFAULT_SETTINGS;

  if (!settings.groqApiKey) {
    return fallbackAnalysis(req);
  }

  const prompt = buildPrompt(req);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.groqApiKey}`,
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content:
            "You are NeatCode, an AI coding companion. Analyze the user's DSA solving progress emotionally. NEVER reveal the solution. Only evaluate progress direction. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const json = await response.json();
  const text: string = json.choices?.[0]?.message?.content ?? "";

  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");
    return JSON.parse(match[0]) as AIAnalysis;
  } catch {
    return fallbackAnalysis(req);
  }
}

function buildPrompt(req: AnalyzeRequest): string {
  const diff = getDiffSummary(req.previousCode, req.currentCode);
  return `
Problem: ${req.problemTitle}
Language: ${req.language}
Elapsed: ${req.elapsedMinutes} minutes
Attempt #: ${req.attemptCount}
Last mood: ${req.lastMood}
Test result: ${req.testResult ?? "none"}
Diagnostics: ${req.diagnostics.join(", ") || "none"}
Code changes: ${diff}

Current code:
\`\`\`
${req.currentCode.slice(0, 1500)}
\`\`\`

Evaluate the user's PROGRESS DIRECTION only. Do NOT solve the problem.
Consider: Is complexity improving? Are bugs being fixed? Are they going in circles?

Respond ONLY with this JSON (no other text):
{
  "mood": "one of: thinking|neutral|happy|excited|celebrating|confused|worried|sad|crying",
  "confidence": <0-100 integer>,
  "reason": "<one short sentence about progress>",
  "message": "<short encouraging message, max 12 words, never reveal solution>",
  "animation": "<same as mood>"
}
`.trim();
}

function getDiffSummary(prev: string, curr: string): string {
  if (!prev) return "First look at code";
  const prevLines = prev.split("\n").length;
  const currLines = curr.split("\n").length;
  const diff = currLines - prevLines;
  if (diff > 5) return `Added ${diff} lines`;
  if (diff < -5) return `Removed ${Math.abs(diff)} lines`;
  if (prev === curr) return "No change";
  return "Small edits";
}

function fallbackAnalysis(req: AnalyzeRequest): AIAnalysis {
  // Offline heuristic mood without API
  const hasCode = req.currentCode.trim().length > 50;
  const isProgressing = req.currentCode !== req.previousCode;
  const hasDiagnostics = req.diagnostics.length > 0;

  if (req.testResult === "passed") {
    return { mood: "celebrating", confidence: 100, reason: "Tests passed!", message: "We did it! Amazing work!", animation: "celebrating" };
  }
  if (!hasCode) {
    return { mood: "thinking", confidence: 30, reason: "Just getting started", message: "Take your time, I'm here!", animation: "thinking" };
  }
  if (hasDiagnostics) {
    return { mood: "worried", confidence: 40, reason: "Errors detected", message: "Check those errors, you got this!", animation: "worried" };
  }
  if (isProgressing) {
    return { mood: "happy", confidence: 65, reason: "Making progress", message: "Looking good, keep going!", animation: "happy" };
  }
  return { mood: "neutral", confidence: 50, reason: "Thinking phase", message: "Take your time...", animation: "neutral" };
}
