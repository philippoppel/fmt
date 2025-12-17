"use client";

import { Brain, Heart, Users, Flame, Pill, Utensils, Zap, Battery, Crown, Medal, Award } from "lucide-react";
import type { TherapistProfileData } from "@/types/profile";
import type { Specialty, TherapyType } from "@/types/therapist";
import { Badge } from "@/components/ui/badge";

interface ProfileSpecializationsProps {
  profile: TherapistProfileData;
  locale: string;
}

export function ProfileSpecializations({ profile, locale }: ProfileSpecializationsProps) {
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
      className="py-16 sm:py-24"
      style={{
        background: `linear-gradient(180deg, var(--profile-secondary) 0%, var(--profile-bg) 100%)`,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Specializations */}
        <h2
          className="text-2xl sm:text-3xl font-bold mb-8 text-center"
          style={{ color: "var(--profile-text)" }}
        >
          {t.specializations}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {sortedSpecializations.map((specialty) => {
            const rank = profile.specializationRanks[specialty];
            const isRanked = rank && rank <= 3;

            return (
              <div
                key={specialty}
                className={`
                  relative rounded-xl p-6 text-center transition-transform hover:scale-105
                  ${isRanked ? "ring-2 shadow-lg" : "shadow-md"}
                `}
                style={{
                  backgroundColor: "white",
                  ...(isRanked && { "--tw-ring-color": "var(--profile-primary)" }),
                } as React.CSSProperties}
              >
                {/* Rank Badge */}
                {isRanked && (
                  <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-md">
                    {rankIcons[rank]}
                    <span className="text-xs font-medium">
                      {rank === 1 ? t.primaryFocus : t.secondaryFocus}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
                  style={{ backgroundColor: "var(--profile-secondary)" }}
                >
                  <span style={{ color: "var(--profile-primary)" }}>
                    {specialtyIcons[specialty]}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-semibold text-lg" style={{ color: "var(--profile-text)" }}>
                  {(t as unknown as Record<string, string>)[specialty] || specialty}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Therapy Types */}
        {profile.therapyTypes.length > 0 && (
          <>
            <h2
              className="text-2xl sm:text-3xl font-bold mb-8 text-center"
              style={{ color: "var(--profile-text)" }}
            >
              {t.therapyTypes}
            </h2>

            <div className="flex flex-wrap gap-3 justify-center">
              {profile.therapyTypes.map((type: TherapyType) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="text-base px-4 py-2 border-2"
                  style={{
                    borderColor: "var(--profile-primary)",
                    color: "var(--profile-primary)",
                    backgroundColor: "white",
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
