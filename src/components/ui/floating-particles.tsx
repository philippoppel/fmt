"use client";

import { useMemo, useEffect, useState } from "react";

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
  hasGlow: boolean;
  glowSize: number;
}

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  className?: string;
  intensity?: "subtle" | "medium" | "high";
}

export function FloatingParticles({
  count = 30,
  color = "var(--profile-primary, #8B7355)",
  className,
  intensity = "high",
}: FloatingParticlesProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!prefersReducedMotion) {
      setMounted(true);
    }
  }, []);

  const intensityConfig = {
    subtle: { sizeMultiplier: 1, opacityMultiplier: 1, glowChance: 0.1 },
    medium: { sizeMultiplier: 1.5, opacityMultiplier: 1.5, glowChance: 0.3 },
    high: { sizeMultiplier: 2.5, opacityMultiplier: 2, glowChance: 0.5 },
  }[intensity];

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const hasGlow = Math.random() < intensityConfig.glowChance;
        return {
          id: i,
          size: (Math.random() * 8 + 4) * intensityConfig.sizeMultiplier,
          x: Math.random() * 100,
          y: Math.random() * 100,
          duration: Math.random() * 15 + 8,
          delay: Math.random() * 8,
          opacity: Math.min((Math.random() * 0.4 + 0.2) * intensityConfig.opacityMultiplier, 0.9),
          hasGlow,
          glowSize: hasGlow ? Math.random() * 20 + 10 : 0,
        };
      }),
    [count, intensityConfig]
  );

  if (!mounted) return null;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className || ""}`}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: color,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: p.hasGlow
              ? `0 0 ${p.glowSize}px ${p.glowSize / 2}px ${color}`
              : "none",
            filter: p.hasGlow ? "blur(0px)" : "blur(1px)",
          }}
        />
      ))}
    </div>
  );
}
