"use client";

import { GraduationCap, Award, Users, BookOpen, Heart, Target, MessageCircle, Sparkles } from "lucide-react";
import type { TherapistProfileData } from "@/types/profile";
import { GlassCard } from "@/components/ui/glass-card";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

interface ProfileAboutProps {
  profile: TherapistProfileData;
  locale: string;
}

export function ProfileAbout({ profile, locale }: ProfileAboutProps) {
  const { ref: aboutRef, isVisible: aboutVisible } = useScrollAnimation();
  const { ref: qualRef, isVisible: qualVisible } = useScrollAnimation();
  const { ref: approachRef, isVisible: approachVisible } = useScrollAnimation();

  const t = {
    de: {
      aboutMe: "Über mich",
      education: "Ausbildung",
      certifications: "Zertifizierungen",
      memberships: "Mitgliedschaften",
      therapyApproach: "Mein Therapieansatz",
      firstSession: "Das erste Gespräch",
      communicationStyle: "Kommunikationsstil",
      directive: "Klar & strukturiert",
      empathetic: "Einfühlsam & begleitend",
      balanced: "Ausgewogen",
      therapyFocus: "Therapiefokus",
      past: "Vergangenheit verstehen",
      present: "Gegenwart bewältigen",
      future: "Zukunft gestalten",
      holistic: "Ganzheitlich",
      therapyDepth: "Therapieziel",
      symptom_relief: "Symptomlinderung",
      deep_change: "Tiefgreifende Veränderung",
      flexible: "Flexibel",
      usesHomework: "Übungen",
      yes: "Ja, regelmäßig",
      no: "Nein",
      talkRatio: "Gesprächsanteil",
      moreListening: "Ich höre mehr zu",
      moreGuiding: "Ich gebe mehr Anleitung",
      balanced2: "Ausgeglichen",
    },
    en: {
      aboutMe: "About Me",
      education: "Education",
      certifications: "Certifications",
      memberships: "Memberships",
      therapyApproach: "My Therapy Approach",
      firstSession: "The First Session",
      communicationStyle: "Communication Style",
      directive: "Clear & structured",
      empathetic: "Empathetic & supportive",
      balanced: "Balanced",
      therapyFocus: "Therapy Focus",
      past: "Understanding the past",
      present: "Managing the present",
      future: "Shaping the future",
      holistic: "Holistic",
      therapyDepth: "Therapy Goal",
      symptom_relief: "Symptom relief",
      deep_change: "Deep change",
      flexible: "Flexible",
      usesHomework: "Homework",
      yes: "Yes, regularly",
      no: "No",
      talkRatio: "Talk Ratio",
      moreListening: "I listen more",
      moreGuiding: "I guide more",
      balanced2: "Balanced",
    },
  }[locale] || {
    de: {
      aboutMe: "Über mich",
      education: "Ausbildung",
      certifications: "Zertifizierungen",
      memberships: "Mitgliedschaften",
      therapyApproach: "Mein Therapieansatz",
      firstSession: "Das erste Gespräch",
      communicationStyle: "Kommunikationsstil",
      directive: "Klar & strukturiert",
      empathetic: "Einfühlsam & begleitend",
      balanced: "Ausgewogen",
      therapyFocus: "Therapiefokus",
      past: "Vergangenheit verstehen",
      present: "Gegenwart bewältigen",
      future: "Zukunft gestalten",
      holistic: "Ganzheitlich",
      therapyDepth: "Therapieziel",
      symptom_relief: "Symptomlinderung",
      deep_change: "Tiefgreifende Veränderung",
      flexible: "Flexibel",
      usesHomework: "Übungen",
      yes: "Ja, regelmäßig",
      no: "Nein",
      talkRatio: "Gesprächsanteil",
      moreListening: "Ich höre mehr zu",
      moreGuiding: "Ich gebe mehr Anleitung",
      balanced2: "Ausgeglichen",
    },
  };

  const communicationStyleText = {
    directive: t.directive,
    empathetic: t.empathetic,
    balanced: t.balanced,
  }[profile.communicationStyle] || t.balanced;

  const therapyFocusText = {
    past: t.past,
    present: t.present,
    future: t.future,
    holistic: t.holistic,
  }[profile.therapyFocus] || t.holistic;

  const therapyDepthText = {
    symptom_relief: t.symptom_relief,
    deep_change: t.deep_change,
    flexible: t.flexible,
  }[profile.therapyDepth] || t.flexible;

  const getTalkRatioText = (ratio: number) => {
    if (ratio < 40) return t.moreGuiding;
    if (ratio > 60) return t.moreListening;
    return t.balanced2;
  };

  return (
    <div className="py-16 sm:py-24 relative overflow-hidden" style={{ backgroundColor: "var(--profile-bg)" }}>
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-48 -left-48 w-[35rem] h-[35rem] rounded-full animate-aurora-2"
          style={{
            background: `radial-gradient(circle, var(--profile-primary) 0%, transparent 60%)`,
            opacity: 0.15,
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] rounded-full animate-aurora-1"
          style={{
            background: `radial-gradient(circle, var(--profile-accent) 0%, transparent 60%)`,
            opacity: 0.12,
            filter: "blur(70px)",
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
        {/* About Me Text */}
        {(profile.longDescription || profile.shortDescription) && (
          <div ref={aboutRef} className="mb-16">
            {/* Section Header with animated gradient underline */}
            <div className="relative mb-8">
              <h2
                className={cn(
                  "text-3xl sm:text-4xl font-bold",
                  "opacity-0",
                  aboutVisible && "animate-fade-in-up"
                )}
                style={{ color: "var(--profile-text)", animationFillMode: "forwards" }}
              >
                {t.aboutMe}
              </h2>
              <div
                className={cn(
                  "h-1 w-20 mt-4 rounded-full animate-gradient",
                  "opacity-0",
                  aboutVisible && "animate-fade-in-up stagger-1"
                )}
                style={{
                  background: `linear-gradient(90deg, var(--profile-primary), var(--profile-accent), var(--profile-primary))`,
                  backgroundSize: "200% 100%",
                  animationFillMode: "forwards",
                }}
              />
            </div>
            <div
              className={cn(
                "prose prose-lg max-w-none text-gray-700 leading-relaxed",
                "opacity-0",
                aboutVisible && "animate-fade-in-up stagger-2"
              )}
              style={{ whiteSpace: "pre-line", animationFillMode: "forwards" }}
            >
              {profile.longDescription || profile.shortDescription}
            </div>
          </div>
        )}

        {/* Qualifications Grid - Cards with colored left border */}
        <div ref={qualRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {/* Education */}
          {profile.education.length > 0 && (
            <div
              className={cn("opacity-0", qualVisible && "animate-fade-in-up")}
              style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
            >
              <GlassCard
                className="h-full border-l-4 hover:border-l-8 transition-all duration-300"
                style={{ borderLeftColor: "var(--profile-primary)" }}
                enableTilt={true}
              >
                <div className="p-6">
                  {/* Icon with gradient background */}
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                    style={{
                      background: `linear-gradient(135deg, var(--profile-primary)20, var(--profile-accent)20)`,
                    }}
                  >
                    <GraduationCap className="h-6 w-6" style={{ color: "var(--profile-primary)" }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--profile-text)" }}>
                    {t.education}
                  </h3>
                  <ul className="space-y-2">
                    {profile.education.map((edu, index) => (
                      <li key={index} className="text-gray-600 flex items-start gap-2">
                        <span style={{ color: "var(--profile-primary)" }}>•</span>
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Certifications */}
          {profile.certifications.length > 0 && (
            <div
              className={cn("opacity-0", qualVisible && "animate-fade-in-up")}
              style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
            >
              <GlassCard
                className="h-full border-l-4 hover:border-l-8 transition-all duration-300"
                style={{ borderLeftColor: "var(--profile-accent)" }}
                enableTilt={true}
              >
                <div className="p-6">
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                    style={{
                      background: `linear-gradient(135deg, var(--profile-accent)20, var(--profile-primary)20)`,
                    }}
                  >
                    <Award className="h-6 w-6" style={{ color: "var(--profile-accent)" }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--profile-text)" }}>
                    {t.certifications}
                  </h3>
                  <ul className="space-y-2">
                    {profile.certifications.map((cert, index) => (
                      <li key={index} className="text-gray-600 flex items-start gap-2">
                        <span style={{ color: "var(--profile-accent)" }}>•</span>
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Memberships */}
          {profile.memberships.length > 0 && (
            <div
              className={cn("opacity-0", qualVisible && "animate-fade-in-up")}
              style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
            >
              <GlassCard
                className="h-full border-l-4 hover:border-l-8 transition-all duration-300"
                style={{ borderLeftColor: "var(--profile-primary)" }}
                enableTilt={true}
              >
                <div className="p-6">
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                    style={{
                      background: `linear-gradient(135deg, var(--profile-primary)20, var(--profile-accent)20)`,
                    }}
                  >
                    <Users className="h-6 w-6" style={{ color: "var(--profile-primary)" }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--profile-text)" }}>
                    {t.memberships}
                  </h3>
                  <ul className="space-y-2">
                    {profile.memberships.map((membership, index) => (
                      <li key={index} className="text-gray-600 flex items-start gap-2">
                        <span style={{ color: "var(--profile-primary)" }}>•</span>
                        <span>{membership}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>
            </div>
          )}
        </div>

        {/* Therapy Approach */}
        <div ref={approachRef} className="mb-16">
          {/* Section Header */}
          <div className="relative mb-8">
            <h2
              className={cn(
                "text-3xl sm:text-4xl font-bold",
                "opacity-0",
                approachVisible && "animate-fade-in-up"
              )}
              style={{ color: "var(--profile-text)", animationFillMode: "forwards" }}
            >
              {t.therapyApproach}
            </h2>
            <div
              className={cn(
                "h-1 w-20 mt-4 rounded-full animate-gradient",
                "opacity-0",
                approachVisible && "animate-fade-in-up stagger-1"
              )}
              style={{
                background: `linear-gradient(90deg, var(--profile-primary), var(--profile-accent), var(--profile-primary))`,
                backgroundSize: "200% 100%",
                animationFillMode: "forwards",
              }}
            />
          </div>

          {/* Approach Cards with gradient icons */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Communication Style */}
            <div
              className={cn("opacity-0", approachVisible && "animate-fade-in-scale")}
              style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
            >
              <GlassCard className="group" enableTilt={true}>
                <div className="p-6 text-center">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, var(--profile-primary), var(--profile-accent))`,
                    }}
                  >
                    <MessageCircle className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{t.communicationStyle}</p>
                  <p className="font-semibold" style={{ color: "var(--profile-text)" }}>
                    {communicationStyleText}
                  </p>
                </div>
              </GlassCard>
            </div>

            {/* Therapy Focus */}
            <div
              className={cn("opacity-0", approachVisible && "animate-fade-in-scale")}
              style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
            >
              <GlassCard className="group" enableTilt={true}>
                <div className="p-6 text-center">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, var(--profile-accent), var(--profile-primary))`,
                    }}
                  >
                    <Target className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{t.therapyFocus}</p>
                  <p className="font-semibold" style={{ color: "var(--profile-text)" }}>
                    {therapyFocusText}
                  </p>
                </div>
              </GlassCard>
            </div>

            {/* Therapy Depth */}
            <div
              className={cn("opacity-0", approachVisible && "animate-fade-in-scale")}
              style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
            >
              <GlassCard className="group" enableTilt={true}>
                <div className="p-6 text-center">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, var(--profile-primary), var(--profile-accent))`,
                    }}
                  >
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{t.therapyDepth}</p>
                  <p className="font-semibold" style={{ color: "var(--profile-text)" }}>
                    {therapyDepthText}
                  </p>
                </div>
              </GlassCard>
            </div>

            {/* Homework */}
            <div
              className={cn("opacity-0", approachVisible && "animate-fade-in-scale")}
              style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
            >
              <GlassCard className="group" enableTilt={true}>
                <div className="p-6 text-center">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, var(--profile-accent), var(--profile-primary))`,
                    }}
                  >
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{t.usesHomework}</p>
                  <p className="font-semibold" style={{ color: "var(--profile-text)" }}>
                    {profile.usesHomework ? t.yes : t.no}
                  </p>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Talk Ratio Bar with gradient */}
          <div
            className={cn(
              "mt-8 opacity-0",
              approachVisible && "animate-fade-in-up stagger-5"
            )}
            style={{ animationFillMode: "forwards" }}
          >
            <GlassCard enableTilt={false}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-500">{t.talkRatio}</span>
                  <span className="font-semibold" style={{ color: "var(--profile-primary)" }}>
                    {getTalkRatioText(profile.clientTalkRatio)}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: approachVisible ? `${profile.clientTalkRatio}%` : "0%",
                      background: `linear-gradient(90deg, var(--profile-primary), var(--profile-accent))`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{t.moreGuiding}</span>
                  <span>{t.moreListening}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* First Session Info */}
        {(profile.consultationInfo || profile.firstSessionInfo) && (
          <div
            className={cn("opacity-0", approachVisible && "animate-fade-in-up stagger-6")}
            style={{ animationFillMode: "forwards" }}
          >
            <div className="relative mb-8">
              <h2
                className="text-3xl sm:text-4xl font-bold"
                style={{ color: "var(--profile-text)" }}
              >
                {t.firstSession}
              </h2>
              <div
                className="h-1 w-20 mt-4 rounded-full animate-gradient"
                style={{
                  background: `linear-gradient(90deg, var(--profile-primary), var(--profile-accent), var(--profile-primary))`,
                  backgroundSize: "200% 100%",
                }}
              />
            </div>
            <GlassCard
              className="border-l-4"
              style={{ borderLeftColor: "var(--profile-primary)" }}
              enableTilt={false}
            >
              <div
                className="p-6 text-gray-600 leading-relaxed"
                style={{ whiteSpace: "pre-line" }}
              >
                {profile.consultationInfo || profile.firstSessionInfo}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
