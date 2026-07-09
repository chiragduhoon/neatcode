import React, { useEffect, useState } from "react";
import { useStore } from "../../store/useStore";
import "./SpeechBubble.css";

export const SpeechBubble: React.FC = () => {
  const { message, mood, idle } = useStore();
  const [visible, setVisible] = useState(false);
  const [displayMessage, setDisplayMessage] = useState(message);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setVisible(true);
    setDisplayMessage(message);
    setKey((k) => k + 1);

    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  // Idle messages
  useEffect(() => {
    const idleMessages: Record<string, string> = {
      idle: "Still thinking? Take your time...",
      yawning: "I'm getting a little sleepy... 🥱",
      sleeping: "zzz... wake me when you're back!",
    };
    if (idle.phase !== "active" && idleMessages[idle.phase]) {
      setDisplayMessage(idleMessages[idle.phase]);
      setVisible(true);
      setKey((k) => k + 1);
    }
  }, [idle.phase]);

  if (!visible) return null;

  return (
    <div className={`speech-bubble mood-${mood}`} key={key}>
      <p>{displayMessage}</p>
      <div className="bubble-tail" />
    </div>
  );
};
