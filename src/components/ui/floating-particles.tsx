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
}

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  className?: string;
}

export function FloatingParticles({
  count = 20,
  color = "var(--profile-primary, #8B7355)",
  className,
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

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.3 + 0.1,
      })),
    [count]
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
            filter: "blur(0.5px)",
          }}
        />
      ))}
    </div>
  );
}
