"use client";

import { useEffect, useState } from "react";

interface AnimatedBackgroundProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  variant?: "mesh" | "gradient" | "aurora" | "waves";
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export function AnimatedBackground({
  primaryColor = "var(--profile-primary, #8B7355)",
  secondaryColor = "var(--profile-secondary, #F5F0EB)",
  accentColor = "var(--profile-accent, #D4A574)",
  variant = "aurora",
  intensity = "high",
  className,
}: AnimatedBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!prefersReducedMotion) {
      setMounted(true);
    }
  }, []);

  const opacityMap = {
    low: { base: 0.15, secondary: 0.1 },
    medium: { base: 0.25, secondary: 0.15 },
    high: { base: 0.4, secondary: 0.25 },
  }[intensity];

  if (!mounted) {
    // Static fallback for SSR or reduced motion
    return (
      <div
        className={`absolute inset-0 pointer-events-none ${className || ""}`}
        style={{
          background: `linear-gradient(135deg, ${secondaryColor} 0%, white 50%, ${secondaryColor} 100%)`,
        }}
        aria-hidden="true"
      />
    );
  }

  if (variant === "aurora") {
    return (
      <div
        className={`absolute inset-0 overflow-hidden pointer-events-none ${className || ""}`}
        aria-hidden="true"
      >
        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${secondaryColor} 0%, white 50%, ${secondaryColor} 100%)`,
          }}
        />

        {/* Aurora effect - multiple animated blobs */}
        <div
          className="absolute -top-1/2 -left-1/4 w-full h-full rounded-full animate-aurora-1"
          style={{
            background: `radial-gradient(ellipse at center, ${primaryColor} 0%, transparent 70%)`,
            opacity: opacityMap.base,
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute -bottom-1/2 -right-1/4 w-full h-full rounded-full animate-aurora-2"
          style={{
            background: `radial-gradient(ellipse at center, ${accentColor} 0%, transparent 70%)`,
            opacity: opacityMap.base,
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-3/4 rounded-full animate-aurora-3"
          style={{
            background: `radial-gradient(ellipse at center, ${primaryColor} 0%, transparent 60%)`,
            opacity: opacityMap.secondary,
            filter: "blur(100px)",
          }}
        />
      </div>
    );
  }

  if (variant === "mesh") {
    return (
      <div
        className={`absolute inset-0 overflow-hidden pointer-events-none ${className || ""}`}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 animate-mesh-gradient"
          style={{
            backgroundImage: `
              radial-gradient(at 40% 20%, ${primaryColor} 0px, transparent 50%),
              radial-gradient(at 80% 0%, ${accentColor} 0px, transparent 50%),
              radial-gradient(at 0% 50%, ${primaryColor} 0px, transparent 50%),
              radial-gradient(at 80% 50%, ${secondaryColor} 0px, transparent 50%),
              radial-gradient(at 0% 100%, ${accentColor} 0px, transparent 50%),
              radial-gradient(at 80% 100%, ${primaryColor} 0px, transparent 50%)
            `,
            backgroundSize: "200% 200%",
            opacity: opacityMap.base,
          }}
        />
      </div>
    );
  }

  if (variant === "waves") {
    return (
      <div
        className={`absolute inset-0 overflow-hidden pointer-events-none ${className || ""}`}
        aria-hidden="true"
      >
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1440 800"
        >
          <defs>
            <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: primaryColor, stopOpacity: opacityMap.base }} />
              <stop offset="50%" style={{ stopColor: accentColor, stopOpacity: opacityMap.secondary }} />
              <stop offset="100%" style={{ stopColor: primaryColor, stopOpacity: opacityMap.base }} />
            </linearGradient>
          </defs>
          <path
            className="animate-wave-1"
            fill="url(#wave-gradient-1)"
            d="M0,192L48,208C96,224,192,256,288,261.3C384,267,480,245,576,224C672,203,768,181,864,186.7C960,192,1056,224,1152,234.7C1248,245,1344,235,1392,229.3L1440,224L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"
          />
          <path
            className="animate-wave-2"
            fill="url(#wave-gradient-1)"
            style={{ opacity: 0.5 }}
            d="M0,320L48,298.7C96,277,192,235,288,234.7C384,235,480,277,576,298.7C672,320,768,320,864,298.7C960,277,1056,235,1152,224C1248,213,1344,235,1392,245.3L1440,256L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"
          />
        </svg>
      </div>
    );
  }

  // Default gradient
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className || ""}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 animate-gradient"
        style={{
          background: `linear-gradient(45deg, ${primaryColor}, ${accentColor}, ${secondaryColor}, ${primaryColor})`,
          backgroundSize: "400% 400%",
          opacity: opacityMap.base,
        }}
      />
    </div>
  );
}
