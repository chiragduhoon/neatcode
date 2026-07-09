export interface EditorState {
  code: string;
  language: string;
}

type ChangeCallback = (state: EditorState) => void;

interface BridgeMessage {
  source?: string;
  code?: string;
  language?: string;
}

// Content scripts run in an isolated world and cannot see LeetCode's
// window.monaco. A bridge script injected into the MAIN world (see
// background/service-worker.ts) polls Monaco and relays code snapshots
// here via window.postMessage.
export class EditorWatcher {
  private lastCode = "";
  private callback: ChangeCallback;
  private listener = (event: MessageEvent<BridgeMessage>) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== "neatcode-bridge") return;
    if (typeof data.code !== "string" || typeof data.language !== "string") return;
    if (data.code === this.lastCode) return;
    this.lastCode = data.code;
    this.callback({ code: data.code, language: data.language });
  };

  constructor(callback: ChangeCallback) {
    this.callback = callback;
  }

  start() {
    window.addEventListener("message", this.listener);
  }

  stop() {
    window.removeEventListener("message", this.listener);
  }

  getCurrentCode(): string {
    return this.lastCode;
  }
}
