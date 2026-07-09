import React, { useEffect, useRef, useState } from "react";
import { useStore } from "../../store/useStore";
import type { Mood } from "../../../../shared/types";
import "./Character.css";

const MOOD_EMOJI: Record<Mood, string> = {
  thinking: "🤔",
  neutral: "😐",
  happy: "🙂",
  excited: "😄",
  celebrating: "🥳",
  confused: "😕",
  worried: "😟",
  sad: "😢",
  crying: "😭",
};

const IDLE_EMOJI: Record<string, string> = {
  active: "",
  idle: "👀",
  yawning: "🥱",
  sleeping: "😴",
};

interface Props {
  onClick: () => void;
}

export const Character: React.FC<Props> = ({ onClick }) => {
  const { mood, idle, isCelebrating } = useStore();
  const [displayMood, setDisplayMood] = useState<Mood>(mood);
  const [isAnimating, setIsAnimating] = useState(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout>>();

  // Smooth mood transitions — don't jump instantly
  useEffect(() => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    setIsAnimating(true);
    transitionTimer.current = setTimeout(() => {
      setDisplayMood(mood);
      setIsAnimating(false);
    }, 300);
    return () => clearTimeout(transitionTimer.current);
  }, [mood]);

  const emoji =
    isCelebrating
      ? "🥳"
      : idle.phase !== "active"
      ? IDLE_EMOJI[idle.phase]
      : MOOD_EMOJI[displayMood];

  return (
    <div
      className={`character ${displayMood} ${isAnimating ? "transitioning" : ""} ${isCelebrating ? "celebrating" : ""} ${idle.phase !== "active" ? `idle-${idle.phase}` : ""}`}
      onClick={onClick}
      title="Click for details"
    >
      <div className="character-body">
        <span className="character-emoji">{emoji}</span>
        <div className="character-glow" />
      </div>
      <div className="character-shadow" />
    </div>
  );
};
