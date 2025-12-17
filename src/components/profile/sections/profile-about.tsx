"use client";

import { GraduationCap, Award, Users, BookOpen, Heart, Target, MessageCircle } from "lucide-react";
import type { TherapistProfileData } from "@/types/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileAboutProps {
  profile: TherapistProfileData;
  locale: string;
}

export function ProfileAbout({ profile, locale }: ProfileAboutProps) {
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
    <div className="py-16 sm:py-24" style={{ backgroundColor: "var(--profile-bg)" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* About Me Text */}
        {(profile.longDescription || profile.shortDescription) && (
          <div className="mb-16">
            <h2
              className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3"
              style={{ color: "var(--profile-text)" }}
            >
              <Heart className="h-7 w-7" style={{ color: "var(--profile-primary)" }} />
              {t.aboutMe}
            </h2>
            <div
              className="prose prose-lg max-w-none text-gray-600"
              style={{ whiteSpace: "pre-line" }}
            >
              {profile.longDescription || profile.shortDescription}
            </div>
          </div>
        )}

        {/* Qualifications Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {/* Education */}
          {profile.education.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                  {t.education}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profile.education.map((edu, index) => (
                    <li key={index} className="text-gray-600 flex items-start gap-2">
                      <span className="text-gray-300 mt-1.5">•</span>
                      <span>{edu}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {profile.certifications.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                  {t.certifications}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profile.certifications.map((cert, index) => (
                    <li key={index} className="text-gray-600 flex items-start gap-2">
                      <span className="text-gray-300 mt-1.5">•</span>
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Memberships */}
          {profile.memberships.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                  {t.memberships}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profile.memberships.map((membership, index) => (
                    <li key={index} className="text-gray-600 flex items-start gap-2">
                      <span className="text-gray-300 mt-1.5">•</span>
                      <span>{membership}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Therapy Approach */}
        <div className="mb-16">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-8 flex items-center gap-3"
            style={{ color: "var(--profile-text)" }}
          >
            <Target className="h-7 w-7" style={{ color: "var(--profile-primary)" }} />
            {t.therapyApproach}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Communication Style */}
            <div
              className="rounded-xl p-5 text-center"
              style={{ backgroundColor: "var(--profile-secondary)" }}
            >
              <MessageCircle
                className="h-8 w-8 mx-auto mb-3"
                style={{ color: "var(--profile-primary)" }}
              />
              <p className="text-sm text-gray-500 mb-1">{t.communicationStyle}</p>
              <p className="font-semibold" style={{ color: "var(--profile-text)" }}>
                {communicationStyleText}
              </p>
            </div>

            {/* Therapy Focus */}
            <div
              className="rounded-xl p-5 text-center"
              style={{ backgroundColor: "var(--profile-secondary)" }}
            >
              <Target
                className="h-8 w-8 mx-auto mb-3"
                style={{ color: "var(--profile-primary)" }}
              />
              <p className="text-sm text-gray-500 mb-1">{t.therapyFocus}</p>
              <p className="font-semibold" style={{ color: "var(--profile-text)" }}>
                {therapyFocusText}
              </p>
            </div>

            {/* Therapy Depth */}
            <div
              className="rounded-xl p-5 text-center"
              style={{ backgroundColor: "var(--profile-secondary)" }}
            >
              <BookOpen
                className="h-8 w-8 mx-auto mb-3"
                style={{ color: "var(--profile-primary)" }}
              />
              <p className="text-sm text-gray-500 mb-1">{t.therapyDepth}</p>
              <p className="font-semibold" style={{ color: "var(--profile-text)" }}>
                {therapyDepthText}
              </p>
            </div>

            {/* Homework */}
            <div
              className="rounded-xl p-5 text-center"
              style={{ backgroundColor: "var(--profile-secondary)" }}
            >
              <BookOpen
                className="h-8 w-8 mx-auto mb-3"
                style={{ color: "var(--profile-primary)" }}
              />
              <p className="text-sm text-gray-500 mb-1">{t.usesHomework}</p>
              <p className="font-semibold" style={{ color: "var(--profile-text)" }}>
                {profile.usesHomework ? t.yes : t.no}
              </p>
            </div>
          </div>

          {/* Talk Ratio Bar */}
          <div className="mt-6 p-5 rounded-xl" style={{ backgroundColor: "var(--profile-secondary)" }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">{t.talkRatio}</span>
              <span className="font-semibold" style={{ color: "var(--profile-text)" }}>
                {getTalkRatioText(profile.clientTalkRatio)}
              </span>
            </div>
            <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${profile.clientTalkRatio}%`,
                  backgroundColor: "var(--profile-primary)",
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t.moreGuiding}</span>
              <span>{t.moreListening}</span>
            </div>
          </div>
        </div>

        {/* First Session Info */}
        {(profile.consultationInfo || profile.firstSessionInfo) && (
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3"
              style={{ color: "var(--profile-text)" }}
            >
              <Heart className="h-7 w-7" style={{ color: "var(--profile-primary)" }} />
              {t.firstSession}
            </h2>
            <div
              className="rounded-xl p-6 text-gray-600"
              style={{ backgroundColor: "var(--profile-secondary)", whiteSpace: "pre-line" }}
            >
              {profile.consultationInfo || profile.firstSessionInfo}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
