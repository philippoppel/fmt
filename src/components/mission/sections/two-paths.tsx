"use client";

import { useTranslations } from "next-intl";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Link } from "@/i18n/navigation";
import { Sliders, Compass, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const paths = [
  {
    key: "self",
    icon: Sliders,
    color: "hope",
    href: "/therapists",
  },
  {
    key: "guided",
    icon: Compass,
    color: "calm",
    href: "/therapists/matching",
  },
] as const;

export function TwoPaths() {
  const t = useTranslations("mission.seeker.paths");

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fade-up">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight mb-12 text-center text-foreground">
              {t("title")}
            </h2>
          </AnimatedSection>

          {/* Path cards */}
          <div className="grid sm:grid-cols-2 gap-6">
            {paths.map((path, index) => {
              const Icon = path.icon;
              const colorClasses = {
                hope: {
                  bg: "bg-hope/5 hover:bg-hope/10",
                  icon: "bg-hope/10 text-hope group-hover:bg-hope/20",
                  border: "border-hope/20 hover:border-hope/40",
                },
                calm: {
                  bg: "bg-calm/5 hover:bg-calm/10",
                  icon: "bg-calm/10 text-calm group-hover:bg-calm/20",
                  border: "border-calm/20 hover:border-calm/40",
                },
              };

              const colors = colorClasses[path.color];

              return (
                <AnimatedSection
                  key={path.key}
                  animation="fade-up"
                  delay={index * 0.1}
                >
                  <Link
                    href={path.href}
                    className={cn(
                      "group block p-8 rounded-2xl border transition-all duration-300",
                      "hover:-translate-y-1 hover:shadow-xl",
                      colors.bg,
                      colors.border
                    )}
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* Icon */}
                      <div
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300",
                          colors.icon
                        )}
                      >
                        <Icon className="w-8 h-8" />
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-semibold mb-3 text-foreground">
                        {t(`${path.key}.title`)}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {t(`${path.key}.text`)}
                      </p>

                      {/* Arrow indicator */}
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
