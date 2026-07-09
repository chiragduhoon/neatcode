import React, { useEffect, useRef } from "react";
import "./Celebration.css";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  rotation: number;
  rotationSpeed: number;
}

const COLORS = ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#3b82f6", "#f97316"];

export const Celebration: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 300;

    // Spawn confetti
    for (let i = 0; i < 60; i++) {
      particles.current.push({
        x: 150 + (Math.random() - 0.5) * 60,
        y: 150,
        vx: (Math.random() - 0.5) * 8,
        vy: -(Math.random() * 6 + 4),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 6 + 3,
        life: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    function animate() {
      ctx!.clearRect(0, 0, 300, 300);
      particles.current = particles.current.filter((p) => p.life > 0);

      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.life -= 0.012;
        p.rotation += p.rotationSpeed;

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.globalAlpha = p.life;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx!.restore();
      });

      if (particles.current.length > 0) {
        animRef.current = requestAnimationFrame(animate);
      }
    }

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="celebration-overlay">
      <canvas ref={canvasRef} className="confetti-canvas" />
      <div className="victory-text">🎉 We did it! 🎉</div>
    </div>
  );
};
