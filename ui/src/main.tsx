import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

// Mount directly into the container the content script created
function mount() {
  const container = (window as unknown as Record<string, unknown>).__neatcode_container__ as HTMLElement | undefined;
  if (!container) {
    // Retry if container not ready yet
    setTimeout(mount, 100);
    return;
  }

  const mountPoint = document.createElement("div");
  mountPoint.id = "neatcode-app";
  mountPoint.style.pointerEvents = "auto";
  container.appendChild(mountPoint);

  createRoot(mountPoint).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

mount();
