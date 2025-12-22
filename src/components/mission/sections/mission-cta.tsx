"use client";

import { useTranslations } from "next-intl";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Link } from "@/i18n/navigation";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MissionCta() {
  const t = useTranslations("mission.seeker.cta");

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden bg-slate-900">
      {/* Decorative blur circles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-trust/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-hope/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-calm/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Heart icon */}
          <AnimatedSection animation="fade-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-trust/20 mb-8">
              <Heart className="w-10 h-10 text-trust" />
            </div>
          </AnimatedSection>

          {/* Statement */}
          <AnimatedSection animation="fade-up" delay={0.1}>
            <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight mb-10 text-white">
              {t("statement")}
            </h2>
          </AnimatedSection>

          {/* CTA Button */}
          <AnimatedSection animation="fade-up" delay={0.2}>
            <Button
              asChild
              size="lg"
              className="rounded-full px-10 h-14 text-lg shadow-xl bg-trust hover:bg-trust/90 text-white animate-hero-cta-pulse"
            >
              <Link href="/therapists/matching">
                {t("button")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
