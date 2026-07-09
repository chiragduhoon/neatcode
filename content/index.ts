import { EditorWatcher } from "./editorWatcher";
import { scrapeProblem, scrapeTestResult, scrapeDiagnostics } from "./problemScraper";
import type { AnalyzeRequest, AIAnalysis, Mood } from "../shared/types";

const DEBOUNCE_MS = 4000;
const MIN_DIFF_CHARS = 10;
const MAX_CALL_INTERVAL_MS = 15000;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastCallTime = 0;
let lastCode = "";
let previousCode = "";
let attemptCount = 0;
let startTime = Date.now();
let lastMood: Mood = "thinking";
let injected = false;

function injectUI() {
  if (injected) return;
  injected = true;

  // Create a container div directly in body (no shadow DOM — simpler and reliable)
  const container = document.createElement("div");
  container.id = "neatcode-container";
  container.style.cssText = `
    position: fixed !important;
    bottom: 24px !important;
    right: 24px !important;
    z-index: 2147483647 !important;
    pointer-events: none;
  `;
  document.body.appendChild(container);

  // Store container on window so ui/main.tsx can find it
  (window as unknown as Record<string, unknown>).__neatcode_container__ = container;

  // Load the React UI in this isolated world — it needs chrome.storage and
  // the container global, neither of which exists in the page's main world.
  import(/* @vite-ignore */ chrome.runtime.getURL("ui/index.js")).catch((e) =>
    console.error("[NeatCode] Failed to load UI:", e)
  );

  // Load UI CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("ui/index.css");
  document.head.appendChild(link);
}

function postToUI(analysis: AIAnalysis) {
  window.dispatchEvent(new CustomEvent("neatcode:analysis", { detail: analysis }));
}

function postIdleToUI(idleSeconds: number) {
  window.dispatchEvent(new CustomEvent("neatcode:idle", { detail: { idleSeconds } }));
}

async function triggerAnalysis(code: string, language: string) {
  const now = Date.now();
  if (now - lastCallTime < MAX_CALL_INTERVAL_MS) return;
  if (code === lastCode && Math.abs(code.length - (previousCode?.length ?? 0)) < MIN_DIFF_CHARS) return;

  lastCallTime = now;
  previousCode = lastCode;
  lastCode = code;

  const { title } = scrapeProblem();
  const diagnostics = scrapeDiagnostics();
  const testResult = scrapeTestResult();
  const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);

  const req: AnalyzeRequest = {
    currentCode: code,
    previousCode,
    language,
    problemTitle: title,
    diagnostics,
    elapsedMinutes,
    attemptCount,
    lastMood,
    testResult,
  };

  try {
    const result = await chrome.runtime.sendMessage({ type: "ANALYZE_CODE", payload: req });
    if (result && !result.error) {
      lastMood = result.mood as Mood;
      postToUI(result as AIAnalysis);
    }
  } catch (e) {
    console.error("[NeatCode] AI error:", e);
  }
}

// Track submit clicks
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (
    target.textContent?.trim().toLowerCase() === "submit" ||
    target.closest('[data-e2e-locator="console-submit-button"]')
  ) {
    attemptCount++;
  }
});

// Watch for test results
const resultObserver = new MutationObserver(() => {
  const result = scrapeTestResult();
  if (result) {
    window.dispatchEvent(new CustomEvent("neatcode:testresult", { detail: result }));
    if (result === "passed") {
      window.dispatchEvent(new CustomEvent("neatcode:celebrate"));
      lastMood = "celebrating";
    }
  }
});
resultObserver.observe(document.body, { childList: true, subtree: true });

// Idle tracking
let lastTypingTime = Date.now();
setInterval(() => {
  const idleSecs = Math.floor((Date.now() - lastTypingTime) / 1000);
  if (idleSecs > 10) postIdleToUI(idleSecs);
}, 5000);

function init() {
  if (!window.location.pathname.includes("/problems/")) return;
  injectUI();

  // Ask the background worker to inject the main-world Monaco bridge
  chrome.runtime
    .sendMessage({ type: "INJECT_BRIDGE" })
    .catch((e) => console.error("[NeatCode] Bridge injection failed:", e));

  const watcher = new EditorWatcher((state) => {
    lastTypingTime = Date.now();
    window.dispatchEvent(new CustomEvent("neatcode:typing"));
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      triggerAnalysis(state.code, state.language);
    }, DEBOUNCE_MS);
  });

  watcher.start();
}

if (document.readyState === "complete") {
  init();
} else {
  window.addEventListener("load", init);
}

// SPA navigation support
let lastPath = location.pathname;
setInterval(() => {
  if (location.pathname !== lastPath) {
    lastPath = location.pathname;
    startTime = Date.now();
    attemptCount = 0;
    lastCode = "";
    previousCode = "";
    injected = false;
    if (location.pathname.includes("/problems/")) init();
  }
}, 1000);
