import React, { useState, useRef, useCallback } from "react";
import { Character } from "./components/Character/Character";
import { SpeechBubble } from "./components/SpeechBubble/SpeechBubble";
import { Stats } from "./components/Stats/Stats";
import { Celebration } from "./components/Celebration/Celebration";
import { useBridge } from "./hooks/useBridge";
import { useStore } from "./store/useStore";
import "./App.css";

export const App: React.FC = () => {
  useBridge();

  const { isMinimized, setMinimized, isCelebrating, showDetails, toggleDetails } = useStore();

  // Draggable position
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".character")) {
      dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    }
  }, [pos]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStart.current) return;
    setPos({
      x: dragStart.current.px + (e.clientX - dragStart.current.mx),
      y: dragStart.current.py + (e.clientY - dragStart.current.my),
    });
  }, []);

  const onMouseUp = useCallback(() => {
    dragStart.current = null;
  }, []);

  React.useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  if (isMinimized) {
    return (
      <div className="neatcode-minimized" onClick={() => setMinimized(false)}>
        <span>NC</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="neatcode-container"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      onMouseDown={onMouseDown}
    >
      {isCelebrating && <Celebration />}
      <SpeechBubble />
      {showDetails && <Stats />}
      <Character onClick={toggleDetails} />
      <button
        className="minimize-btn"
        onClick={(e) => { e.stopPropagation(); setMinimized(true); }}
        title="Minimize"
      >
        ×
      </button>
    </div>
  );
};
