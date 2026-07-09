import React from "react";
import { useStore } from "../../store/useStore";
import "./Stats.css";

export const Stats: React.FC = () => {
  const { stats, mood, confidence, reason } = useStore();

  const xpToNextLevel = stats.level * 100;
  const xpProgress = (stats.xp % xpToNextLevel) / xpToNextLevel;

  return (
    <div className="stats-panel">
      <div className="stats-header">
        <span className="level-badge">Lv.{stats.level}</span>
        <span className="coins">🪙 {stats.coins}</span>
      </div>

      <div className="xp-bar-container">
        <div className="xp-bar" style={{ width: `${xpProgress * 100}%` }} />
        <span className="xp-label">{stats.xp % xpToNextLevel}/{xpToNextLevel} XP</span>
      </div>

      <div className="mood-analysis">
        <div className="confidence-label">
          Confidence: <strong>{confidence}%</strong>
        </div>
        <div className="confidence-bar-container">
          <div
            className={`confidence-bar mood-${mood}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        {reason && <p className="reason-text">{reason}</p>}
      </div>

      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.problemsSolved}</span>
          <span className="stat-label">Solved</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.streak}</span>
          <span className="stat-label">🔥 Streak</span>
        </div>
      </div>

      {stats.achievements.length > 0 && (
        <div className="achievements">
          {stats.achievements.slice(-3).map((a, i) => (
            <span key={i} className="achievement-badge">🏆 {a}</span>
          ))}
        </div>
      )}
    </div>
  );
};
