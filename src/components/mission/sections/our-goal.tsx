"use client";

import { useTranslations } from "next-intl";
import { AnimatedSection } from "@/components/ui/animated-section";

export function OurGoal() {
  const t = useTranslations("mission.seeker.goal");

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight mb-6 text-foreground">
              {t("title")}
            </h2>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={0.1}>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("text")}
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
