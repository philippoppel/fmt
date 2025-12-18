"use client";

import { Brain, Heart, Users, Flame, Pill, Utensils, Zap, Battery, Crown, Medal, Award } from "lucide-react";
import type { TherapistProfileData } from "@/types/profile";
import type { Specialty, TherapyType } from "@/types/therapist";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

interface ProfileSpecializationsProps {
  profile: TherapistProfileData;
  locale: string;
}

export function ProfileSpecializations({ profile, locale }: ProfileSpecializationsProps) {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();
  const { ref: therapyRef, isVisible: therapyVisible } = useScrollAnimation();

  const t = {
    de: {
      specializations: "Meine Schwerpunkte",
      therapyTypes: "Therapieverfahren",
      primaryFocus: "Hauptschwerpunkt",
      secondaryFocus: "Weiterer Schwerpunkt",
      // Specializations
      depression: "Depression",
      anxiety: "Angststörungen",
      trauma: "Trauma & PTBS",
      relationships: "Beziehungen & Partnerschaft",
      addiction: "Sucht & Abhängigkeit",
      eating_disorders: "Essstörungen",
      adhd: "ADHS",
      burnout: "Burnout & Stress",
      // Therapy Types
      cbt: "Kognitive Verhaltenstherapie",
      psychoanalysis: "Psychoanalyse",
      systemic: "Systemische Therapie",
      gestalt: "Gestalttherapie",
      humanistic: "Humanistische Therapie",
    },
    en: {
      specializations: "My Specializations",
      therapyTypes: "Therapy Methods",
      primaryFocus: "Primary Focus",
      secondaryFocus: "Secondary Focus",
      // Specializations
      depression: "Depression",
      anxiety: "Anxiety Disorders",
      trauma: "Trauma & PTSD",
      relationships: "Relationships & Partnerships",
      addiction: "Addiction",
      eating_disorders: "Eating Disorders",
      adhd: "ADHD",
      burnout: "Burnout & Stress",
      // Therapy Types
      cbt: "Cognitive Behavioral Therapy",
      psychoanalysis: "Psychoanalysis",
      systemic: "Systemic Therapy",
      gestalt: "Gestalt Therapy",
      humanistic: "Humanistic Therapy",
    },
  }[locale] || {
    de: {
      specializations: "Meine Schwerpunkte",
      therapyTypes: "Therapieverfahren",
      primaryFocus: "Hauptschwerpunkt",
      secondaryFocus: "Weiterer Schwerpunkt",
      depression: "Depression",
      anxiety: "Angststörungen",
      trauma: "Trauma & PTBS",
      relationships: "Beziehungen & Partnerschaft",
      addiction: "Sucht & Abhängigkeit",
      eating_disorders: "Essstörungen",
      adhd: "ADHS",
      burnout: "Burnout & Stress",
      cbt: "Kognitive Verhaltenstherapie",
      psychoanalysis: "Psychoanalyse",
      systemic: "Systemische Therapie",
      gestalt: "Gestalttherapie",
      humanistic: "Humanistische Therapie",
    },
  };

  const specialtyIcons: Record<Specialty, React.ReactNode> = {
    depression: <Brain className="h-6 w-6" />,
    anxiety: <Zap className="h-6 w-6" />,
    trauma: <Heart className="h-6 w-6" />,
    relationships: <Users className="h-6 w-6" />,
    addiction: <Pill className="h-6 w-6" />,
    eating_disorders: <Utensils className="h-6 w-6" />,
    adhd: <Flame className="h-6 w-6" />,
    burnout: <Battery className="h-6 w-6" />,
  };

  const rankIcons: Record<number, React.ReactNode> = {
    1: <Crown className="h-4 w-4 text-yellow-500" />,
    2: <Medal className="h-4 w-4 text-gray-400" />,
    3: <Award className="h-4 w-4 text-amber-600" />,
  };

  // Sort specializations by rank
  const sortedSpecializations = [...profile.specializations].sort((a, b) => {
    const rankA = profile.specializationRanks[a] || 99;
    const rankB = profile.specializationRanks[b] || 99;
    return rankA - rankB;
  });

  return (
    <div
      className="py-16 sm:py-24 relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, var(--profile-secondary) 0%, var(--profile-bg) 100%)`,
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 animate-float-slow"
          style={{
            background: `radial-gradient(circle, var(--profile-primary) 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{
            background: `radial-gradient(circle, var(--profile-accent) 0%, transparent 70%)`,
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
        {/* Specializations */}
        <h2
          ref={sectionRef}
          className={cn(
            "text-2xl sm:text-3xl font-bold mb-8 text-center",
            "opacity-0",
            sectionVisible && "animate-fade-in-up"
          )}
          style={{ color: "var(--profile-text)", animationFillMode: "forwards" }}
        >
          {t.specializations}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {sortedSpecializations.map((specialty, index) => {
            const rank = profile.specializationRanks[specialty];
            const isRanked = rank && rank <= 3;

            return (
              <div
                key={specialty}
                className={cn(
                  "opacity-0",
                  sectionVisible && "animate-fade-in-up"
                )}
                style={{
                  animationDelay: `${0.1 + index * 0.1}s`,
                  animationFillMode: "forwards",
                }}
              >
                <GlassCard
                  className={cn(
                    "p-6 text-center group",
                    isRanked && "ring-2"
                  )}
                  style={{
                    ...(isRanked && { "--tw-ring-color": "var(--profile-primary)" }),
                  } as React.CSSProperties}
                  enableTilt={true}
                  glowOnHover={true}
                >
                  {/* Rank Badge */}
                  {isRanked && (
                    <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-lg z-20">
                      {rankIcons[rank]}
                      <span className="text-xs font-medium">
                        {rank === 1 ? t.primaryFocus : t.secondaryFocus}
                      </span>
                    </div>
                  )}

                  {/* Icon with glow effect */}
                  <div
                    className={cn(
                      "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
                      "transition-all duration-300",
                      "group-hover:scale-110 group-hover:shadow-lg"
                    )}
                    style={{
                      backgroundColor: "var(--profile-secondary)",
                      boxShadow: isRanked
                        ? `0 0 20px var(--profile-primary)`
                        : undefined,
                    }}
                  >
                    <span
                      className="transition-transform duration-300 group-hover:scale-110"
                      style={{ color: "var(--profile-primary)" }}
                    >
                      {specialtyIcons[specialty]}
                    </span>
                  </div>

                  {/* Name */}
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: "var(--profile-text)" }}
                  >
                    {(t as unknown as Record<string, string>)[specialty] || specialty}
                  </h3>
                </GlassCard>
              </div>
            );
          })}
        </div>

        {/* Therapy Types */}
        {profile.therapyTypes.length > 0 && (
          <>
            <h2
              ref={therapyRef}
              className={cn(
                "text-2xl sm:text-3xl font-bold mb-8 text-center",
                "opacity-0",
                therapyVisible && "animate-fade-in-up"
              )}
              style={{ color: "var(--profile-text)", animationFillMode: "forwards" }}
            >
              {t.therapyTypes}
            </h2>

            <div className="flex flex-wrap gap-3 justify-center">
              {profile.therapyTypes.map((type: TherapyType, index) => (
                <Badge
                  key={type}
                  variant="outline"
                  className={cn(
                    "text-base px-5 py-2.5 border-2",
                    "transition-all duration-300",
                    "hover:scale-105 hover:shadow-lg",
                    "opacity-0",
                    therapyVisible && "animate-fade-in-scale"
                  )}
                  style={{
                    borderColor: "var(--profile-primary)",
                    color: "var(--profile-primary)",
                    backgroundColor: "white",
                    animationDelay: `${0.1 + index * 0.1}s`,
                    animationFillMode: "forwards",
                  }}
                >
                  {(t as unknown as Record<string, string>)[type] || type}
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
