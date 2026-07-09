export interface EditorState {
  code: string;
  language: string;
}

type ChangeCallback = (state: EditorState) => void;

export class EditorWatcher {
  private observer: MutationObserver | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private lastCode = "";
  private callback: ChangeCallback;

  constructor(callback: ChangeCallback) {
    this.callback = callback;
  }

  start() {
    // LeetCode uses Monaco editor — poll the model value
    this.pollInterval = setInterval(() => this.poll(), 1500);
  }

  stop() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.observer) this.observer.disconnect();
  }

  private poll() {
    const state = this.readMonaco();
    if (!state) return;
    if (state.code !== this.lastCode) {
      this.lastCode = state.code;
      this.callback(state);
    }
  }

  private readMonaco(): EditorState | null {
    try {
      // Access Monaco via window global that LeetCode exposes
      const win = window as unknown as {
        monaco?: {
          editor: {
            getModels: () => Array<{
              getValue: () => string;
              getLanguageId: () => string;
            }>;
          };
        };
      };

      if (!win.monaco) return null;

      const models = win.monaco.editor.getModels();
      if (!models.length) return null;

      // Find the code model (not the test case model)
      const codeModel = models.find((m) => {
        const val = m.getValue();
        return val.length > 10 && !val.startsWith("[");
      }) ?? models[0];

      return {
        code: codeModel.getValue(),
        language: codeModel.getLanguageId(),
      };
    } catch {
      return null;
    }
  }

  getCurrentCode(): string {
    return this.lastCode;
  }
}
