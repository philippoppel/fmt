"use client";

import { useState, useEffect, useCallback } from "react";

interface UseParallaxOptions {
  /** Speed multiplier for parallax effect (0.1 - 1.0). Default: 0.5 */
  speed?: number;
  /** Direction of parallax movement. Default: 'up' */
  direction?: "up" | "down";
  /** Whether to disable on mobile for performance. Default: true */
  disableOnMobile?: boolean;
  /** Breakpoint for mobile detection. Default: 768 */
  mobileBreakpoint?: number;
}

interface UseParallaxReturn {
  /** Current parallax offset in pixels */
  offset: number;
  /** Whether parallax is currently active */
  isActive: boolean;
}

/**
 * Hook for creating parallax scroll effects.
 * Respects user's reduced motion preference and can be disabled on mobile.
 */
export function useParallax({
  speed = 0.5,
  direction = "up",
  disableOnMobile = true,
  mobileBreakpoint = 768,
}: UseParallaxOptions = {}): UseParallaxReturn {
  const [offset, setOffset] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const multiplier = direction === "up" ? -1 : 1;
    setOffset(scrollY * speed * multiplier);
  }, [speed, direction]);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setIsActive(false);
      return;
    }

    // Check for mobile viewport
    const isMobile = window.innerWidth < mobileBreakpoint;
    if (disableOnMobile && isMobile) {
      setIsActive(false);
      return;
    }

    setIsActive(true);

    // Add scroll listener with passive flag for performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, disableOnMobile, mobileBreakpoint]);

  // Listen for viewport changes
  useEffect(() => {
    if (!disableOnMobile) return;

    const handleResize = () => {
      const isMobile = window.innerWidth < mobileBreakpoint;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      setIsActive(!isMobile && !prefersReducedMotion);

      if (isMobile || prefersReducedMotion) {
        setOffset(0);
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [disableOnMobile, mobileBreakpoint]);

  return { offset, isActive };
}

/**
 * Hook for mouse-based parallax effects on hover.
 * Creates a subtle depth effect based on mouse position.
 */
export function useMouseParallax(
  elementRef: React.RefObject<HTMLElement | null>,
  intensity: number = 10
) {
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      setTransform({
        x: deltaX * intensity,
        y: deltaY * intensity,
      });
    };

    const handleMouseLeave = () => {
      setTransform({ x: 0, y: 0 });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [elementRef, intensity]);

  return transform;
}
