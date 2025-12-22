"use client";

import { useTranslations } from "next-intl";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Link } from "@/i18n/navigation";
import { BookOpen, PenLine, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: BookOpen, label: "Fundiertes Wissen" },
  { icon: PenLine, label: "Von Therapeut:innen" },
  { icon: Gift, label: "Kostenlos" },
] as const;

export function KnowledgeSection() {
  const t = useTranslations("mission.seeker.knowledge");

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-calm/5 rounded-3xl p-8 lg:p-12 border border-calm/20">
            <AnimatedSection animation="fade-up">
              <h2 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight mb-6 text-center text-foreground">
                {t("title")}
              </h2>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={0.1}>
              <p className="text-lg text-muted-foreground leading-relaxed text-center mb-8 max-w-2xl mx-auto">
                {t("text")}
              </p>
            </AnimatedSection>

            {/* Features */}
            <AnimatedSection animation="fade-up" delay={0.2}>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/70 border border-border/50"
                    >
                      <Icon className="w-4 h-4 text-calm" />
                      <span className="text-sm font-medium text-foreground">
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </AnimatedSection>

            {/* CTA */}
            <AnimatedSection animation="fade-up" delay={0.3}>
              <div className="text-center">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-calm/30 hover:bg-calm/10"
                >
                  <Link href="/blog">
                    Wissen entdecken
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
