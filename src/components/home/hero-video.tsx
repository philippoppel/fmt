"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface HeroVideoProps {
  className?: string;
}

// Pexels free stock video - warm, supportive therapy/connection scene
// Using a placeholder until a real video is sourced
const VIDEO_CONFIG = {
  // Placeholder using a calm, supportive video from Pexels
  webm: "/videos/hero-therapy.webm",
  mp4: "/videos/hero-therapy.mp4",
  poster: "/images/hero-video-poster.jpg",
  // Fallback to a gradient if video doesn't load
  fallbackGradient: "linear-gradient(135deg, oklch(60% 0.08 180) 0%, oklch(55% 0.12 220) 100%)",
};

export function HeroVideo({ className }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay might be blocked - that's okay
            console.log("Video autoplay was prevented");
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  const handleLoadedData = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative z-10",
        "w-[280px] sm:w-[350px] md:w-[450px] lg:w-[550px]",
        "aspect-video rounded-2xl overflow-hidden",
        "hero-video-container shadow-2xl",
        className
      )}
    >
      {/* Video element */}
      {!hasError && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          poster={VIDEO_CONFIG.poster}
          onLoadedData={handleLoadedData}
          onError={handleError}
        >
          <source src={VIDEO_CONFIG.mp4} type="video/mp4" />
          <source src={VIDEO_CONFIG.webm} type="video/webm" />
        </video>
      )}

      {/* Fallback gradient or loading state */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          isLoaded && !hasError ? "opacity-0" : "opacity-100"
        )}
        style={{
          background: VIDEO_CONFIG.fallbackGradient,
        }}
      >
        {/* Decorative elements for fallback */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-white/10 animate-pulse-glow" />
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-white/80 text-sm font-medium">
            Verbindung und Unterstützung
          </p>
        </div>
      </div>

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />

      {/* Border glow effect */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20 pointer-events-none" />

      {/* Decorative corner accents */}
      <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-white/30 rounded-tl-lg" />
      <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-white/30 rounded-br-lg" />
    </div>
  );
}
