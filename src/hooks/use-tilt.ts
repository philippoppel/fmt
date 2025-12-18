"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface TiltState {
  rotateX: number;
  rotateY: number;
  scale: number;
}

export function useTilt(maxTilt: number = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -maxTilt;
      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * maxTilt;

      setTilt({ rotateX, rotateY, scale: 1.02 });
    },
    [maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const element = ref.current;
    if (!element) return;

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  const style = {
    transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
    transition: "transform 0.15s ease-out",
  };

  return { ref, style, tilt };
}
