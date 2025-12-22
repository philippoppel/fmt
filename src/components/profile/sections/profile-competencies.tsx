"use client";

import * as LucideIcons from "lucide-react";
import type { Competency } from "@/types/microsite";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

interface ProfileCompetenciesProps {
  competencies: Competency[];
  locale: string;
}

const t = {
  de: {
    title: "Meine Schwerpunkte",
    subtitle: "Spezialisierte Unterstützung für Ihre Anliegen",
  },
  en: {
    title: "My Specializations",
    subtitle: "Specialized support for your concerns",
  },
};

export function ProfileCompetencies({ competencies, locale }: ProfileCompetenciesProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const texts = t[locale as keyof typeof t] || t.de;

  // Filter visible competencies and sort by order
  const visibleCompetencies = competencies
    .filter((c) => c.visible)
    .sort((a, b) => a.order - b.order);

  if (visibleCompetencies.length === 0) {
    return null;
  }

  return (
    <section
      ref={ref}
      className="py-16 lg:py-24"
      style={{ backgroundColor: "var(--profile-bg)" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={cn(
            "text-center mb-12 lg:mb-16",
            "opacity-0",
            isVisible && "animate-fade-in-up"
          )}
          style={{ animationFillMode: "forwards" }}
        >
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: "var(--profile-text)" }}
          >
            {texts.title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "var(--profile-text)", opacity: 0.7 }}
          >
            {texts.subtitle}
          </p>
          {/* Decorative line */}
          <div
            className="mt-6 mx-auto w-24 h-1 rounded-full"
            style={{
              background: `linear-gradient(90deg, var(--profile-primary), var(--profile-accent))`,
            }}
          />
        </div>

        {/* Competency Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCompetencies.map((competency, index) => (
            <CompetencyCard
              key={competency.id}
              competency={competency}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CompetencyCardProps {
  competency: Competency;
  index: number;
  isVisible: boolean;
}

function CompetencyCard({ competency, index, isVisible }: CompetencyCardProps) {
  // Get the icon component from lucide-react
  const IconComponent = competency.icon
    ? (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[competency.icon]
    : null;

  return (
    <div
      className={cn(
        "group relative",
        "p-6 rounded-2xl",
        "border border-white/50",
        "backdrop-blur-sm",
        "transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        "opacity-0",
        isVisible && "animate-fade-in-up"
      )}
      style={{
        background: "var(--profile-secondary)",
        animationFillMode: "forwards",
        animationDelay: `${0.1 * index}s`,
      }}
    >
      {/* Icon */}
      {IconComponent && (
        <div
          className="mb-4 w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, var(--profile-primary), var(--profile-accent))`,
          }}
        >
          <IconComponent className="h-7 w-7 text-white" />
        </div>
      )}

      {/* Fallback if no icon */}
      {!IconComponent && (
        <div
          className="mb-4 w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, var(--profile-primary), var(--profile-accent))`,
          }}
        >
          <LucideIcons.Sparkles className="h-7 w-7 text-white" />
        </div>
      )}

      {/* Title */}
      <h3
        className="text-xl font-semibold mb-2"
        style={{ color: "var(--profile-text)" }}
      >
        {competency.title}
      </h3>

      {/* Description */}
      {competency.description && (
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--profile-text)", opacity: 0.75 }}
        >
          {competency.description}
        </p>
      )}

      {/* Hover accent line */}
      <div
        className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, var(--profile-primary), var(--profile-accent))`,
        }}
      />
    </div>
  );
}
