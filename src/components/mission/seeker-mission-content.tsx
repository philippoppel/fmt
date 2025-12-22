"use client";

import { useEffect, useRef } from "react";
import { MissionHero } from "./sections/mission-hero";
import { TrustFoundation } from "./sections/trust-foundation";
import { OurGoal } from "./sections/our-goal";
import { HowWeBuildTrust } from "./sections/how-we-build-trust";
import { TwoPaths } from "./sections/two-paths";
import { Transparency } from "./sections/transparency";
import { KnowledgeSection } from "./sections/knowledge-section";
import { MissionCta } from "./sections/mission-cta";

// Scroll-triggered animation hook for the container
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = ref.current?.querySelectorAll(".scroll-animate");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

export function SeekerMissionContent() {
  const containerRef = useScrollAnimation();

  return (
    <div ref={containerRef}>
      {/* Hero Section */}
      <MissionHero />

      {/* Trust Foundation - Emotional Core */}
      <TrustFoundation />

      {/* Our Goal */}
      <OurGoal />

      {/* How We Build Trust - 3-Step Process */}
      <HowWeBuildTrust />

      {/* Two Paths - Self vs Guided */}
      <TwoPaths />

      {/* Transparency Section */}
      <Transparency />

      {/* Knowledge Section */}
      <KnowledgeSection />

      {/* Final CTA */}
      <MissionCta />
    </div>
  );
}
