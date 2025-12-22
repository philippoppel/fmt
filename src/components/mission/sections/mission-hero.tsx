"use client";

import { useTranslations } from "next-intl";
import { AnimatedSection } from "@/components/ui/animated-section";
import Image from "next/image";

export function MissionHero() {
  const t = useTranslations("mission.seeker.hero");

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-hope/10 via-calm/5 to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-trust/5 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-hope/5 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <AnimatedSection animation="fade-up">
                <h1 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tight mb-6 leading-[1.15] text-foreground">
                  {t("title")}
                </h1>
              </AnimatedSection>

              <AnimatedSection animation="fade-up" delay={0.1}>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {t("subtitle")}
                </p>
              </AnimatedSection>
            </div>

            {/* Visual - Warm photo scene */}
            <AnimatedSection animation="fade-up" delay={0.2}>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop&crop=faces"
                  alt="Two people having a trusting conversation"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Warm overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-hope/20 via-transparent to-transparent" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
