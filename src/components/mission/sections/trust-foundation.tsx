"use client";

import { useTranslations } from "next-intl";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Handshake, Compass, Heart } from "lucide-react";

const pillars = [
  { key: "trust", icon: Handshake, color: "trust" },
  { key: "orientation", icon: Compass, color: "calm" },
  { key: "safety", icon: Heart, color: "hope" },
] as const;

export function TrustFoundation() {
  const t = useTranslations("mission.seeker.trust");

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection animation="fade-up">
            <p className="text-lg sm:text-xl lg:text-2xl text-foreground leading-relaxed mb-10">
              {t("text")}
            </p>
          </AnimatedSection>

          {/* Pillars */}
          <AnimatedSection animation="fade-up" delay={0.1}>
            <div className="flex flex-wrap justify-center gap-4">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                const colorClasses = {
                  trust: "bg-trust/10 text-trust border-trust/20",
                  calm: "bg-calm/10 text-calm border-calm/20",
                  hope: "bg-hope/10 text-hope border-hope/20",
                };

                return (
                  <div
                    key={pillar.key}
                    className={`
                      flex items-center gap-2 px-5 py-2.5 rounded-full border
                      ${colorClasses[pillar.color]}
                      transition-transform duration-200 hover:scale-105
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">
                      {t(`pillars.${pillar.key}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
