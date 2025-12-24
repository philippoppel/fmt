"use client";

import {
  Brain, Heart, Users, Flame, Pill, Utensils, Zap, Battery,
  Frown, AlertTriangle, Target, Lightbulb, Moon, Gauge,
  Baby, UserRound, Sparkles, HeartHandshake, Home, Scale,
  Briefcase, Fingerprint, Rainbow, Globe, BedDouble, Activity,
  PersonStanding, GraduationCap, Puzzle
} from "lucide-react";
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
      primaryFocus: "#1",
      secondaryFocus: "#2",
      thirdFocus: "#3",
      // Mental Health (8)
      depression: "Depression",
      anxiety: "Angststörungen",
      trauma: "Trauma & PTBS",
      burnout: "Burnout",
      ocd: "Zwangsstörungen",
      phobias: "Phobien",
      panic: "Panikstörungen",
      bipolar: "Bipolare Störung",
      // Relationships (4)
      couples: "Paartherapie",
      family: "Familientherapie",
      divorce: "Trennung & Scheidung",
      parenting: "Elternberatung",
      // Life Transitions (5)
      grief: "Trauer & Verlust",
      career: "Beruf & Karriere",
      identity: "Identität & Selbstfindung",
      lgbtq: "LGBTQ+",
      migration: "Migration & Kultur",
      // Behavioral (5)
      eating_disorders: "Essstörungen",
      addiction: "Sucht",
      sleep: "Schlafstörungen",
      stress: "Stressbewältigung",
      psychosomatic: "Psychosomatik",
      // Special Groups (4)
      children: "Kinder & Jugendliche",
      elderly: "Ältere Menschen",
      adhd: "ADHS",
      autism: "Autismus-Spektrum",
      // Legacy
      relationships: "Beziehungen",
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
      primaryFocus: "#1",
      secondaryFocus: "#2",
      thirdFocus: "#3",
      // Mental Health (8)
      depression: "Depression",
      anxiety: "Anxiety",
      trauma: "Trauma & PTSD",
      burnout: "Burnout",
      ocd: "OCD",
      phobias: "Phobias",
      panic: "Panic Disorders",
      bipolar: "Bipolar Disorder",
      // Relationships (4)
      couples: "Couples Therapy",
      family: "Family Therapy",
      divorce: "Divorce & Separation",
      parenting: "Parenting Support",
      // Life Transitions (5)
      grief: "Grief & Loss",
      career: "Career & Work",
      identity: "Identity & Self-Discovery",
      lgbtq: "LGBTQ+",
      migration: "Migration & Culture",
      // Behavioral (5)
      eating_disorders: "Eating Disorders",
      addiction: "Addiction",
      sleep: "Sleep Disorders",
      stress: "Stress Management",
      psychosomatic: "Psychosomatic Issues",
      // Special Groups (4)
      children: "Children & Adolescents",
      elderly: "Elderly Care",
      adhd: "ADHD",
      autism: "Autism Spectrum",
      // Legacy
      relationships: "Relationships",
      // Therapy Types
      cbt: "Cognitive Behavioral Therapy",
      psychoanalysis: "Psychoanalysis",
      systemic: "Systemic Therapy",
      gestalt: "Gestalt Therapy",
      humanistic: "Humanistic Therapy",
    },
  }[locale] || {
    specializations: "Meine Schwerpunkte",
    therapyTypes: "Therapieverfahren",
    primaryFocus: "#1",
    secondaryFocus: "#2",
    thirdFocus: "#3",
    depression: "Depression",
    anxiety: "Angststörungen",
    trauma: "Trauma & PTBS",
    burnout: "Burnout",
    ocd: "Zwangsstörungen",
    phobias: "Phobien",
    panic: "Panikstörungen",
    bipolar: "Bipolare Störung",
    couples: "Paartherapie",
    family: "Familientherapie",
    divorce: "Trennung & Scheidung",
    parenting: "Elternberatung",
    grief: "Trauer & Verlust",
    career: "Beruf & Karriere",
    identity: "Identität & Selbstfindung",
    lgbtq: "LGBTQ+",
    migration: "Migration & Kultur",
    eating_disorders: "Essstörungen",
    addiction: "Sucht",
    sleep: "Schlafstörungen",
    stress: "Stressbewältigung",
    psychosomatic: "Psychosomatik",
    children: "Kinder & Jugendliche",
    elderly: "Ältere Menschen",
    adhd: "ADHS",
    autism: "Autismus-Spektrum",
    relationships: "Beziehungen",
    cbt: "Kognitive Verhaltenstherapie",
    psychoanalysis: "Psychoanalyse",
    systemic: "Systemische Therapie",
    gestalt: "Gestalttherapie",
    humanistic: "Humanistische Therapie",
  };

  const specialtyIcons: Record<Specialty, React.ReactNode> = {
    // Mental Health (8)
    depression: <Brain className="h-7 w-7" />,
    anxiety: <Zap className="h-7 w-7" />,
    trauma: <Heart className="h-7 w-7" />,
    burnout: <Battery className="h-7 w-7" />,
    ocd: <Target className="h-7 w-7" />,
    phobias: <AlertTriangle className="h-7 w-7" />,
    panic: <Gauge className="h-7 w-7" />,
    bipolar: <Lightbulb className="h-7 w-7" />,
    // Relationships (4)
    couples: <HeartHandshake className="h-7 w-7" />,
    family: <Home className="h-7 w-7" />,
    divorce: <Scale className="h-7 w-7" />,
    parenting: <Baby className="h-7 w-7" />,
    // Life Transitions (5)
    grief: <Frown className="h-7 w-7" />,
    career: <Briefcase className="h-7 w-7" />,
    identity: <Fingerprint className="h-7 w-7" />,
    lgbtq: <Rainbow className="h-7 w-7" />,
    migration: <Globe className="h-7 w-7" />,
    // Behavioral (5)
    eating_disorders: <Utensils className="h-7 w-7" />,
    addiction: <Pill className="h-7 w-7" />,
    sleep: <BedDouble className="h-7 w-7" />,
    stress: <Activity className="h-7 w-7" />,
    psychosomatic: <Sparkles className="h-7 w-7" />,
    // Special Groups (4)
    children: <GraduationCap className="h-7 w-7" />,
    elderly: <PersonStanding className="h-7 w-7" />,
    adhd: <Flame className="h-7 w-7" />,
    autism: <Puzzle className="h-7 w-7" />,
    // Legacy
    relationships: <Users className="h-7 w-7" />,
  };

  // Rank badge gradients
  const rankStyles: Record<number, { gradient: string; text: string }> = {
    1: { gradient: "linear-gradient(135deg, #F59E0B, #D97706)", text: "#1" },
    2: { gradient: "linear-gradient(135deg, #9CA3AF, #6B7280)", text: "#2" },
    3: { gradient: "linear-gradient(135deg, #CD7F32, #B8860B)", text: "#3" },
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
        background: `linear-gradient(180deg, var(--profile-bg) 0%, var(--profile-secondary) 50%, var(--profile-bg) 100%)`,
      }}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[40rem] h-[40rem] rounded-full animate-aurora-1"
          style={{
            background: `radial-gradient(circle, var(--profile-primary) 0%, transparent 60%)`,
            opacity: 0.2,
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[35rem] h-[35rem] rounded-full animate-aurora-2"
          style={{
            background: `radial-gradient(circle, var(--profile-accent) 0%, transparent 60%)`,
            opacity: 0.15,
            filter: "blur(70px)",
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div ref={sectionRef} className="text-center mb-12">
          <h2
            className={cn(
              "text-3xl sm:text-4xl font-bold mb-4",
              "opacity-0",
              sectionVisible && "animate-fade-in-up"
            )}
            style={{ color: "var(--profile-text)", animationFillMode: "forwards" }}
          >
            {t.specializations}
          </h2>
          <div
            className={cn(
              "h-1 w-20 mx-auto rounded-full animate-gradient",
              "opacity-0",
              sectionVisible && "animate-fade-in-up stagger-1"
            )}
            style={{
              background: `linear-gradient(90deg, var(--profile-primary), var(--profile-accent), var(--profile-primary))`,
              backgroundSize: "200% 100%",
              animationFillMode: "forwards",
            }}
          />
        </div>

        {/* Specialization Cards with gradient icons */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {sortedSpecializations.map((specialty, index) => {
            const rank = profile.specializationRanks[specialty];
            const isRanked = rank && rank <= 3;
            const rankStyle = isRanked ? rankStyles[rank] : null;

            return (
              <div
                key={specialty}
                className={cn(
                  "opacity-0",
                  sectionVisible && "animate-fade-in-up"
                )}
                style={{
                  animationDelay: `${0.1 + index * 0.08}s`,
                  animationFillMode: "forwards",
                }}
              >
                <GlassCard
                  className={cn(
                    "p-6 text-center group cursor-pointer",
                    "hover:scale-105 transition-all duration-300",
                    isRanked && "ring-2"
                  )}
                  style={{
                    ...(isRanked && { "--tw-ring-color": "var(--profile-primary)" }),
                  } as React.CSSProperties}
                  enableTilt={true}
                  glowOnHover={true}
                >
                  {/* Rank Badge with gradient */}
                  {isRanked && rankStyle && (
                    <div
                      className="absolute -top-3 -right-3 px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg z-20"
                      style={{ background: rankStyle.gradient }}
                    >
                      {rankStyle.text}
                    </div>
                  )}

                  {/* Icon with full gradient background */}
                  <div
                    className={cn(
                      "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4",
                      "transition-all duration-300",
                      "group-hover:scale-110 group-hover:shadow-xl"
                    )}
                    style={{
                      background: isRanked
                        ? `linear-gradient(135deg, var(--profile-primary), var(--profile-accent))`
                        : `linear-gradient(135deg, var(--profile-primary)90, var(--profile-accent)90)`,
                      boxShadow: isRanked
                        ? `0 8px 24px var(--profile-primary)40`
                        : undefined,
                    }}
                  >
                    <span className="text-white">
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
          <div ref={therapyRef}>
            {/* Section Header */}
            <div className="text-center mb-8">
              <h2
                className={cn(
                  "text-3xl sm:text-4xl font-bold mb-4",
                  "opacity-0",
                  therapyVisible && "animate-fade-in-up"
                )}
                style={{ color: "var(--profile-text)", animationFillMode: "forwards" }}
              >
                {t.therapyTypes}
              </h2>
              <div
                className={cn(
                  "h-1 w-20 mx-auto rounded-full animate-gradient",
                  "opacity-0",
                  therapyVisible && "animate-fade-in-up stagger-1"
                )}
                style={{
                  background: `linear-gradient(90deg, var(--profile-primary), var(--profile-accent), var(--profile-primary))`,
                  backgroundSize: "200% 100%",
                  animationFillMode: "forwards",
                }}
              />
            </div>

            {/* Colorful Badge Grid */}
            <div className="flex flex-wrap gap-3 justify-center">
              {profile.therapyTypes.map((type: TherapyType, index) => {
                // Alternate between primary and accent colors
                const isPrimary = index % 2 === 0;

                return (
                  <Badge
                    key={type}
                    className={cn(
                      "text-base px-5 py-2.5",
                      "transition-all duration-300",
                      "hover:scale-105 hover:shadow-lg",
                      "opacity-0",
                      therapyVisible && "animate-fade-in-scale"
                    )}
                    style={{
                      background: isPrimary
                        ? `linear-gradient(135deg, var(--profile-primary), var(--profile-accent))`
                        : `linear-gradient(135deg, var(--profile-accent), var(--profile-primary))`,
                      color: "white",
                      border: "none",
                      animationDelay: `${0.15 + index * 0.08}s`,
                      animationFillMode: "forwards",
                    }}
                  >
                    {(t as unknown as Record<string, string>)[type] || type}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
