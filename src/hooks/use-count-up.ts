"use client";

import { useEffect, useState } from "react";

interface UseCountUpOptions {
  end: number;
  duration?: number;
  start?: number;
  decimals?: number;
  enabled?: boolean;
}

export function useCountUp({
  end,
  duration = 2000,
  start = 0,
  decimals = 0,
  enabled = true,
}: UseCountUpOptions) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!enabled) {
      setCount(start);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setCount(end);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function: easeOutExpo
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      const currentCount = start + (end - start) * easeOutExpo;

      setCount(Number(currentCount.toFixed(decimals)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start, decimals, enabled]);

  return count;
}
