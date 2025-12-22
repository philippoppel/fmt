"use client";

import { useTranslations } from "next-intl";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Ear, Puzzle, Lightbulb } from "lucide-react";

const steps = [
  { key: "step1", icon: Ear, color: "trust" },
  { key: "step2", icon: Puzzle, color: "calm" },
  { key: "step3", icon: Lightbulb, color: "hope" },
] as const;

export function HowWeBuildTrust() {
  const t = useTranslations("mission.seeker.howWeWork");

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection animation="fade-up">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight mb-12 lg:mb-16 text-center text-foreground">
              {t("title")}
            </h2>
          </AnimatedSection>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const colorClasses = {
                trust: "bg-trust/10 text-trust",
                calm: "bg-calm/10 text-calm",
                hope: "bg-hope/10 text-hope",
              };

              return (
                <AnimatedSection
                  key={step.key}
                  animation="fade-up"
                  delay={index * 0.1}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Step number and line connector */}
                    <div className="relative mb-6">
                      {/* Line connector (hidden on mobile, visible on desktop) */}
                      {index < steps.length - 1 && (
                        <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent -translate-y-1/2" />
                      )}

                      {/* Icon circle */}
                      <div
                        className={`
                          w-20 h-20 rounded-full flex items-center justify-center
                          ${colorClasses[step.color]}
                          transition-transform duration-300 hover:scale-110
                        `}
                      >
                        <Icon className="w-10 h-10" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {t(`${step.key}.title`)}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t(`${step.key}.text`)}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
