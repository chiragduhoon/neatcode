import React, { useEffect, useState } from "react";
import type { Settings } from "../../shared/types";
import "./Popup.css";

const DEFAULT: Settings = {
  groqApiKey: "",
  enabled: true,
  animationSpeed: "normal",
  speechFrequency: "normal",
  moodSensitivity: 5,
  characterTheme: "default",
  showStats: true,
};

export const Popup: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);

  useEffect(() => {
    chrome.storage.local.get("settings", (data) => {
      if (data.settings) setSettings(data.settings as Settings);
    });
  }, []);

  const save = () => {
    chrome.storage.local.set({ settings }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  return (
    <div className="popup">
      <header className="popup-header">
        <div className="logo">
          <span className="logo-emoji">🤖</span>
          <div>
            <h1>NeatCode</h1>
            <p>AI Coding Companion</p>
          </div>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => update("enabled", e.target.checked)}
          />
          <span className="slider" />
        </label>
      </header>

      <section className="section">
        <label className="field-label">
          Groq API Key
          <span className="free-badge">FREE</span>
        </label>
        <p className="field-hint">
          Get your free key at{" "}
          <a href="https://console.groq.com" target="_blank" rel="noreferrer">
            console.groq.com
          </a>
        </p>
        <div className="key-input-row">
          <input
            type={keyVisible ? "text" : "password"}
            className="field-input"
            placeholder="gsk_..."
            value={settings.groqApiKey}
            onChange={(e) => update("groqApiKey", e.target.value)}
          />
          <button className="eye-btn" onClick={() => setKeyVisible(!keyVisible)}>
            {keyVisible ? "🙈" : "👁"}
          </button>
        </div>
      </section>

      <section className="section">
        <label className="field-label">Animation Speed</label>
        <div className="radio-group">
          {(["slow", "normal", "fast"] as const).map((v) => (
            <label key={v} className={`radio-option ${settings.animationSpeed === v ? "active" : ""}`}>
              <input type="radio" value={v} checked={settings.animationSpeed === v} onChange={() => update("animationSpeed", v)} />
              {v}
            </label>
          ))}
        </div>
      </section>

      <section className="section">
        <label className="field-label">Speech Frequency</label>
        <div className="radio-group">
          {(["low", "normal", "high"] as const).map((v) => (
            <label key={v} className={`radio-option ${settings.speechFrequency === v ? "active" : ""}`}>
              <input type="radio" value={v} checked={settings.speechFrequency === v} onChange={() => update("speechFrequency", v)} />
              {v}
            </label>
          ))}
        </div>
      </section>

      <section className="section">
        <label className="field-label">
          Mood Sensitivity: <strong>{settings.moodSensitivity}</strong>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={settings.moodSensitivity}
          onChange={(e) => update("moodSensitivity", Number(e.target.value))}
          className="range-input"
        />
        <div className="range-labels">
          <span>Calm</span>
          <span>Reactive</span>
        </div>
      </section>

      <section className="section">
        <label className="field-label checkbox-label">
          <input
            type="checkbox"
            checked={settings.showStats}
            onChange={(e) => update("showStats", e.target.checked)}
          />
          Show XP & Stats panel
        </label>
      </section>

      <button className={`save-btn ${saved ? "saved" : ""}`} onClick={save}>
        {saved ? "✓ Saved!" : "Save Settings"}
      </button>

      <footer className="popup-footer">
        <span>NeatCode v1.0 • Powered by Groq (free)</span>
      </footer>
    </div>
  );
};
