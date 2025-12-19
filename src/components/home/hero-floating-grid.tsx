"use client";

import { useTranslations } from "next-intl";
import { HeroFloatingImage, FloatingImageConfig } from "./hero-floating-image";

// Unsplash image URLs for each topic (curated for emotional resonance)
// Using Unsplash Source API for reliable, high-quality images
const TOPIC_IMAGES: Record<string, string> = {
  depression: "https://images.unsplash.com/photo-1541199249251-f713e6145474?w=400&h=300&fit=crop&q=80",
  anxiety: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&q=80",
  family: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop&q=80",
  relationships: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop&q=80",
  burnout: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&q=80",
  trauma: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop&q=80",
  addiction: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop&q=80",
  eating: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=300&fit=crop&q=80",
  adhd: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&q=80",
  selfcare: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&q=80",
  stress: "https://images.unsplash.com/photo-1509909756405-be0199881695?w=400&h=300&fit=crop&q=80",
  sleep: "https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400&h=300&fit=crop&q=80",
};

export function HeroFloatingGrid() {
  const t = useTranslations("home.hero.topics");

  // Configuration for all 12 floating images
  // Positioned to create an organic, asymmetric layout around the center
  const floatingImages: FloatingImageConfig[] = [
    // Top row - left side
    {
      id: "depression",
      topic: "depression",
      label: t("depression"),
      src: TOPIC_IMAGES.depression,
      position: { top: "8%", left: "5%" },
      size: { width: 160, height: 120 },
      parallaxSpeed: 0.3,
      delay: 0.1,
      rotation: -3,
      zIndex: 5,
    },
    // Top row - center-left
    {
      id: "anxiety",
      topic: "anxiety",
      label: t("anxiety"),
      src: TOPIC_IMAGES.anxiety,
      position: { top: "5%", left: "22%" },
      size: { width: 140, height: 100 },
      parallaxSpeed: 0.25,
      delay: 0.15,
      rotation: 2,
      zIndex: 4,
    },
    // Top row - right side
    {
      id: "family",
      topic: "family",
      label: t("family"),
      src: TOPIC_IMAGES.family,
      position: { top: "10%", right: "8%" },
      size: { width: 150, height: 110 },
      parallaxSpeed: 0.35,
      delay: 0.2,
      rotation: 4,
      zIndex: 5,
    },
    // Second row - left
    {
      id: "relationships",
      topic: "relationships",
      label: t("relationships"),
      src: TOPIC_IMAGES.relationships,
      position: { top: "25%", left: "3%" },
      size: { width: 130, height: 95 },
      parallaxSpeed: 0.2,
      delay: 0.25,
      rotation: -2,
      zIndex: 3,
    },
    // Second row - right
    {
      id: "burnout",
      topic: "burnout",
      label: t("burnout"),
      src: TOPIC_IMAGES.burnout,
      position: { top: "28%", right: "5%" },
      size: { width: 145, height: 105 },
      parallaxSpeed: 0.28,
      delay: 0.3,
      rotation: 3,
      zIndex: 4,
    },
    // Middle row - far left
    {
      id: "trauma",
      topic: "trauma",
      label: t("trauma"),
      src: TOPIC_IMAGES.trauma,
      position: { top: "45%", left: "2%" },
      size: { width: 120, height: 90 },
      parallaxSpeed: 0.15,
      delay: 0.35,
      rotation: -4,
      zIndex: 2,
    },
    // Middle row - far right
    {
      id: "addiction",
      topic: "addiction",
      label: t("addiction"),
      src: TOPIC_IMAGES.addiction,
      position: { top: "48%", right: "3%" },
      size: { width: 125, height: 92 },
      parallaxSpeed: 0.18,
      delay: 0.4,
      rotation: 5,
      zIndex: 3,
    },
    // Lower row - left
    {
      id: "eating",
      topic: "eating",
      label: t("eating"),
      src: TOPIC_IMAGES.eating,
      position: { bottom: "28%", left: "8%" },
      size: { width: 135, height: 98 },
      parallaxSpeed: 0.22,
      delay: 0.45,
      rotation: 2,
      zIndex: 4,
    },
    // Lower row - center-left
    {
      id: "adhd",
      topic: "adhd",
      label: t("adhd"),
      src: TOPIC_IMAGES.adhd,
      position: { bottom: "25%", left: "25%" },
      size: { width: 115, height: 85 },
      parallaxSpeed: 0.2,
      delay: 0.5,
      rotation: -3,
      zIndex: 3,
    },
    // Lower row - center-right
    {
      id: "selfcare",
      topic: "selfcare",
      label: t("selfcare"),
      src: TOPIC_IMAGES.selfcare,
      position: { bottom: "22%", right: "22%" },
      size: { width: 140, height: 102 },
      parallaxSpeed: 0.25,
      delay: 0.55,
      rotation: 4,
      zIndex: 4,
    },
    // Bottom row - left
    {
      id: "stress",
      topic: "stress",
      label: t("stress"),
      src: TOPIC_IMAGES.stress,
      position: { bottom: "8%", left: "12%" },
      size: { width: 125, height: 90 },
      parallaxSpeed: 0.18,
      delay: 0.6,
      rotation: -2,
      zIndex: 5,
    },
    // Bottom row - right
    {
      id: "sleep",
      topic: "sleep",
      label: t("sleep"),
      src: TOPIC_IMAGES.sleep,
      position: { bottom: "10%", right: "10%" },
      size: { width: 130, height: 95 },
      parallaxSpeed: 0.22,
      delay: 0.65,
      rotation: 3,
      zIndex: 5,
    },
  ];

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Only show on larger screens - hidden on mobile for performance */}
      <div className="hidden md:block w-full h-full">
        {floatingImages.map((config) => (
          <HeroFloatingImage
            key={config.id}
            config={config}
            className="pointer-events-auto"
          />
        ))}
      </div>

      {/* Mobile: Show a simplified grid instead */}
      <div className="md:hidden grid grid-cols-3 gap-2 p-4 mt-auto">
        {floatingImages.slice(0, 6).map((config, index) => (
          <div
            key={config.id}
            className="relative aspect-[4/3] rounded-lg overflow-hidden opacity-0 animate-hero-image-reveal"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <img
              src={config.src}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="absolute bottom-1 left-1 text-[10px] font-medium text-white/90">
              {config.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
