"use client";

import { useTranslations } from "next-intl";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Search, BarChart3, Brain, CheckCircle2 } from "lucide-react";

const points = [
  { key: "point1", icon: Search },
  { key: "point2", icon: BarChart3 },
  { key: "point3", icon: Brain },
] as const;

export function Transparency() {
  const t = useTranslations("mission.seeker.transparency");

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fade-up">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight mb-10 text-center text-foreground">
              {t("title")}
            </h2>
          </AnimatedSection>

          {/* Points */}
          <div className="grid sm:grid-cols-3 gap-4 lg:gap-6">
            {points.map((point, index) => {
              const Icon = point.icon;

              return (
                <AnimatedSection
                  key={point.key}
                  animation="fade-up"
                  delay={index * 0.1}
                >
                  <div className="flex items-center gap-4 bg-background/70 backdrop-blur-sm rounded-xl p-5 border border-border/50 transition-all duration-200 hover:shadow-md">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-trust" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground font-medium">
                        {t(point.key)}
                      </span>
                    </div>
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
