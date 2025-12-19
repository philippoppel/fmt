"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useParallax } from "@/hooks/use-parallax";

export interface FloatingImageConfig {
  id: string;
  topic: string;
  label: string;
  /** Unsplash image URL or local path */
  src: string;
  /** Position on desktop (percentage or px values) */
  position: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  /** Size in pixels */
  size: {
    width: number;
    height: number;
  };
  /** Parallax speed (0.1 - 0.5) */
  parallaxSpeed: number;
  /** Animation delay in seconds */
  delay: number;
  /** Rotation in degrees (-10 to 10) */
  rotation: number;
  /** Z-index for layering */
  zIndex?: number;
}

interface HeroFloatingImageProps {
  config: FloatingImageConfig;
  className?: string;
}

export function HeroFloatingImage({ config, className }: HeroFloatingImageProps) {
  const { offset, isActive } = useParallax({
    speed: config.parallaxSpeed,
    direction: "up"
  });

  return (
    <div
      className={cn(
        "hero-floating-image absolute rounded-xl overflow-hidden shadow-lg",
        "opacity-0 animate-hero-image-reveal",
        "transition-all duration-700 ease-out",
        "hover:scale-105 hover:shadow-xl hover:z-20",
        "group cursor-pointer",
        className
      )}
      style={{
        ...config.position,
        width: config.size.width,
        height: config.size.height,
        zIndex: config.zIndex || 1,
        "--hero-rotation": `${config.rotation}deg`,
        animationDelay: `${config.delay}s`,
        transform: isActive
          ? `translateY(${offset}px) rotate(${config.rotation}deg)`
          : `rotate(${config.rotation}deg)`,
      } as React.CSSProperties}
    >
      <Image
        src={config.src}
        alt="" // Decorative image
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes={`${config.size.width}px`}
        loading="lazy"
      />

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

      {/* Topic label on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <span className="text-xs font-medium text-white drop-shadow-lg bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
          {config.label}
        </span>
      </div>

      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all" />
    </div>
  );
}
