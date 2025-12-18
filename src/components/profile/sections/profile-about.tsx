"use client";

import { GraduationCap, Award, Users, BookOpen, Heart, Target, MessageCircle } from "lucide-react";
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
      education: "Ausbildung & Qualifikationen",
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
      usesHomework: "Übungen zwischen den Sitzungen",
      yes: "Ja, regelmäßige Übungen",
      no: "Nein, nur Sitzungen",
      talkRatio: "Gesprächsanteil",
      moreListening: "Ich höre mehr zu",
      moreGuiding: "Ich gebe mehr Anleitung",
      balanced2: "Ausgeglichen",
    },
    en: {
      aboutMe: "About Me",
      education: "Education & Qualifications",
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
      usesHomework: "Exercises between sessions",
      yes: "Yes, regular exercises",
      no: "No, sessions only",
      talkRatio: "Talk Ratio",
      moreListening: "I listen more",
      moreGuiding: "I guide more",
      balanced2: "Balanced",
    },
  }[locale] || {
    de: {
      aboutMe: "Über mich",
      education: "Ausbildung & Qualifikationen",
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
      usesHomework: "Übungen zwischen den Sitzungen",
      yes: "Ja, regelmäßige Übungen",
      no: "Nein, nur Sitzungen",
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
      {/* Gradient top border */}
      <div
        className="absolute top-0 left-0 right-0 h-1 animate-gradient"
        style={{
          background: `linear-gradient(90deg, transparent, var(--profile-accent), var(--profile-primary), var(--profile-accent), transparent)`,
          backgroundSize: "200% 100%",
        }}
      />

      {/* Decorative background - enhanced */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated blob - Top Left */}
        <div
          className="absolute -top-48 -left-48 w-[35rem] h-[35rem] animate-aurora-2"
          style={{
            background: `radial-gradient(circle, var(--profile-primary) 0%, transparent 60%)`,
            opacity: 0.25,
            filter: "blur(60px)",
          }}
        />
        {/* Blob - Bottom Right */}
        <div
          className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] animate-aurora-1"
          style={{
            background: `radial-gradient(circle, var(--profile-accent) 0%, transparent 60%)`,
            opacity: 0.2,
            filter: "blur(50px)",
          }}
        />
        {/* Mesh gradient overlay */}
        <div
          className="absolute inset-0 animate-mesh-gradient"
          style={{
            backgroundImage: `
              radial-gradient(at 0% 0%, var(--profile-primary) 0px, transparent 50%),
              radial-gradient(at 100% 100%, var(--profile-accent) 0px, transparent 50%)
            `,
            backgroundSize: "200% 200%",
            opacity: 0.1,
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
        {/* About Me Text */}
        {(profile.longDescription || profile.shortDescription) && (
          <div ref={aboutRef} className="mb-16">
            <h2
              className={cn(
                "text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3",
                "opacity-0",
                aboutVisible && "animate-fade-in-up"
              )}
              style={{ color: "var(--profile-text)", animationFillMode: "forwards" }}
            >
              <Heart className="h-7 w-7" style={{ color: "var(--profile-primary)" }} />
              {t.aboutMe}
            </h2>
            <div
              className={cn(
                "prose prose-lg max-w-none text-gray-600",
                "opacity-0",
                aboutVisible && "animate-fade-in-up stagger-1"
              )}
              style={{ whiteSpace: "pre-line", animationFillMode: "forwards" }}
            >
              {profile.longDescription || profile.shortDescription}
            </div>
          </div>
        )}

        {/* Qualifications Grid with GlassCard */}
        <div ref={qualRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {/* Education */}
          {profile.education.length > 0 && (
            <div
              className={cn("opacity-0", qualVisible && "animate-fade-in-up")}
              style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
            >
              <GlassCard className="h-full" enableTilt={true}>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <GraduationCap className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                    {t.education}
                  </div>
                  <ul className="space-y-2">
                    {profile.education.map((edu, index) => (
                      <li key={index} className="text-gray-600 flex items-start gap-2">
                        <span className="text-gray-300 mt-1.5">•</span>
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
              <GlassCard className="h-full" enableTilt={true}>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Award className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                    {t.certifications}
                  </div>
                  <ul className="space-y-2">
                    {profile.certifications.map((cert, index) => (
                      <li key={index} className="text-gray-600 flex items-start gap-2">
                        <span className="text-gray-300 mt-1.5">•</span>
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
              <GlassCard className="h-full" enableTilt={true}>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Users className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                    {t.memberships}
                  </div>
                  <ul className="space-y-2">
                    {profile.memberships.map((membership, index) => (
                      <li key={index} className="text-gray-600 flex items-start gap-2">
                        <span className="text-gray-300 mt-1.5">•</span>
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
          <h2
            className={cn(
              "text-2xl sm:text-3xl font-bold mb-8 flex items-center gap-3",
              "opacity-0",
              approachVisible && "animate-fade-in-up"
            )}
            style={{ color: "var(--profile-text)", animationFillMode: "forwards" }}
          >
            <Target className="h-7 w-7" style={{ color: "var(--profile-primary)" }} />
            {t.therapyApproach}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Communication Style */}
            <div
              className={cn("opacity-0", approachVisible && "animate-fade-in-scale")}
              style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
            >
              <GlassCard enableTilt={true}>
                <div className="rounded-xl p-5 text-center">
                  <MessageCircle
                    className="h-8 w-8 mx-auto mb-3 transition-transform duration-300 hover:scale-110"
                    style={{ color: "var(--profile-primary)" }}
                  />
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
              <GlassCard enableTilt={true}>
                <div className="rounded-xl p-5 text-center">
                  <Target
                    className="h-8 w-8 mx-auto mb-3 transition-transform duration-300 hover:scale-110"
                    style={{ color: "var(--profile-primary)" }}
                  />
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
              <GlassCard enableTilt={true}>
                <div className="rounded-xl p-5 text-center">
                  <BookOpen
                    className="h-8 w-8 mx-auto mb-3 transition-transform duration-300 hover:scale-110"
                    style={{ color: "var(--profile-primary)" }}
                  />
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
              <GlassCard enableTilt={true}>
                <div className="rounded-xl p-5 text-center">
                  <BookOpen
                    className="h-8 w-8 mx-auto mb-3 transition-transform duration-300 hover:scale-110"
                    style={{ color: "var(--profile-primary)" }}
                  />
                  <p className="text-sm text-gray-500 mb-1">{t.usesHomework}</p>
                  <p className="font-semibold" style={{ color: "var(--profile-text)" }}>
                    {profile.usesHomework ? t.yes : t.no}
                  </p>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Talk Ratio Bar with animation */}
          <div
            className={cn(
              "mt-6 opacity-0",
              approachVisible && "animate-fade-in-up stagger-5"
            )}
            style={{ animationFillMode: "forwards" }}
          >
            <GlassCard enableTilt={false}>
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">{t.talkRatio}</span>
                  <span className="font-semibold" style={{ color: "var(--profile-text)" }}>
                    {getTalkRatioText(profile.clientTalkRatio)}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: approachVisible ? `${profile.clientTalkRatio}%` : "0%",
                      backgroundColor: "var(--profile-primary)",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
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
            <h2
              className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3"
              style={{ color: "var(--profile-text)" }}
            >
              <Heart className="h-7 w-7" style={{ color: "var(--profile-primary)" }} />
              {t.firstSession}
            </h2>
            <GlassCard enableTilt={false}>
              <div
                className="p-6 text-gray-600"
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
