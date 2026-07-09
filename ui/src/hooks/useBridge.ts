import { useEffect } from "react";
import { useStore } from "../store/useStore";
import type { AIAnalysis, GameStats } from "../../../shared/types";

export function useBridge() {
  const { setAnalysis, setCelebrating, setIdle, setActive, setStats } = useStore();

  useEffect(() => {
    const onAnalysis = (e: Event) => {
      const analysis = (e as CustomEvent<AIAnalysis>).detail;
      setAnalysis(analysis);
    };

    const onCelebrate = () => {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 5000);
    };

    const onIdle = (e: Event) => {
      const { idleSeconds } = (e as CustomEvent<{ idleSeconds: number }>).detail;
      setIdle(idleSeconds);
    };

    const onTestResult = (e: Event) => {
      const result = (e as CustomEvent<string>).detail;
      if (result === "passed") {
        onCelebrate();
      }
    };

    // Load stats from chrome storage
    chrome.storage.local.get("gameStats", (data) => {
      if (data.gameStats) setStats(data.gameStats as GameStats);
    });

    window.addEventListener("neatcode:analysis", onAnalysis);
    window.addEventListener("neatcode:celebrate", onCelebrate);
    window.addEventListener("neatcode:idle", onIdle);
    window.addEventListener("neatcode:testresult", onTestResult);

    // Reset idle on any input
    const resetIdle = () => setActive();
    document.addEventListener("keydown", resetIdle);

    return () => {
      window.removeEventListener("neatcode:analysis", onAnalysis);
      window.removeEventListener("neatcode:celebrate", onCelebrate);
      window.removeEventListener("neatcode:idle", onIdle);
      window.removeEventListener("neatcode:testresult", onTestResult);
      document.removeEventListener("keydown", resetIdle);
    };
  }, [setAnalysis, setCelebrating, setIdle, setActive, setStats]);
}
