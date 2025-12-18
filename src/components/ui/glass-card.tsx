"use client";

import { useTilt } from "@/hooks/use-tilt";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  enableTilt?: boolean;
  glowOnHover?: boolean;
  className?: string;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, enableTilt = true, glowOnHover = true, ...props }, forwardedRef) => {
    const { ref: tiltRef, style: tiltStyle } = useTilt(enableTilt ? 8 : 0);

    // Combine refs
    const setRefs = (element: HTMLDivElement | null) => {
      // Set tilt ref
      (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
      // Set forwarded ref
      if (typeof forwardedRef === "function") {
        forwardedRef(element);
      } else if (forwardedRef) {
        forwardedRef.current = element;
      }
    };

    return (
      <div
        ref={setRefs}
        style={enableTilt ? tiltStyle : undefined}
        className={cn(
          // Base
          "relative overflow-hidden rounded-2xl",
          // Glassmorphism
          "bg-white/70 backdrop-blur-xl",
          "border border-white/20",
          // Shadow
          "shadow-xl shadow-black/5",
          // Hover glow
          glowOnHover && [
            "before:absolute before:inset-0 before:rounded-2xl",
            "before:opacity-0 hover:before:opacity-100",
            "before:transition-opacity before:duration-300",
            "before:bg-gradient-to-br before:from-white/20 before:to-transparent",
            "before:-z-10",
          ],
          // Transition
          "transition-shadow duration-300",
          "hover:shadow-2xl hover:shadow-black/10",
          className
        )}
        {...props}
      >
        {/* Subtle gradient overlay on hover */}
        <div
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none",
            "bg-gradient-to-br from-white/10 via-transparent to-white/5",
            glowOnHover && "group-hover:opacity-100"
          )}
        />
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
