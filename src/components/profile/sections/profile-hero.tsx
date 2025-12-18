"use client";

import Image from "next/image";
import { MapPin, Phone, Mail, Shield, Clock, Video, Building2 } from "lucide-react";
import type { TherapistProfileData } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

interface ProfileHeroProps {
  profile: TherapistProfileData;
  locale: string;
}

// Animated stat component with count-up effect
function AnimatedStat({
  value,
  suffix = "",
  label,
  icon,
  isVisible,
}: {
  value: number;
  suffix?: string;
  label: string;
  icon: React.ReactNode;
  isVisible: boolean;
}) {
  const count = useCountUp({ end: value, duration: 2000, enabled: isVisible });

  return (
    <div className="flex items-center gap-1.5 text-gray-600">
      <span style={{ color: "var(--profile-primary)" }}>{icon}</span>
      <span className="font-bold text-lg tabular-nums">{count}{suffix}</span>
      <span>{label}</span>
    </div>
  );
}

export function ProfileHero({ profile, locale }: ProfileHeroProps) {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });

  const t = {
    de: {
      verifiedBadge: "Verifiziert",
      experience: "Jahre Erfahrung",
      pricePerSession: "pro Sitzung",
      bookAppointment: "Termin anfragen",
      callNow: "Jetzt anrufen",
      online: "Online",
      inPerson: "Vor Ort",
      both: "Online & Vor Ort",
      immediately: "Sofort verfügbar",
      this_week: "Diese Woche verfügbar",
      flexible: "Flexible Termine",
    },
    en: {
      verifiedBadge: "Verified",
      experience: "Years Experience",
      pricePerSession: "per session",
      bookAppointment: "Book Appointment",
      callNow: "Call Now",
      online: "Online",
      inPerson: "In Person",
      both: "Online & In Person",
      immediately: "Available Now",
      this_week: "Available This Week",
      flexible: "Flexible Schedule",
    },
  }[locale] || {
    de: {
      verifiedBadge: "Verifiziert",
      experience: "Jahre Erfahrung",
      pricePerSession: "pro Sitzung",
      bookAppointment: "Termin anfragen",
      callNow: "Jetzt anrufen",
      online: "Online",
      inPerson: "Vor Ort",
      both: "Online & Vor Ort",
      immediately: "Sofort verfügbar",
      this_week: "Diese Woche verfügbar",
      flexible: "Flexible Termine",
    },
  };

  const sessionTypeText = {
    online: t.online,
    in_person: t.inPerson,
    both: t.both,
  }[profile.sessionType] || t.both;

  const availabilityText = {
    immediately: t.immediately,
    this_week: t.this_week,
    flexible: t.flexible,
  }[profile.availability] || t.flexible;

  return (
    <header ref={heroRef} className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* Floating Particles Background */}
      <FloatingParticles count={25} color="var(--profile-primary)" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Orb 1 - Top Right */}
        <div
          className="absolute -top-20 -right-20 w-72 h-72 lg:w-96 lg:h-96 rounded-full blur-3xl opacity-30 animate-float-slow"
          style={{
            background: `radial-gradient(circle, var(--profile-primary) 0%, transparent 70%)`,
          }}
        />
        {/* Orb 2 - Bottom Left */}
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 lg:w-[28rem] lg:h-[28rem] rounded-full blur-3xl opacity-20 animate-float-slow"
          style={{
            background: `radial-gradient(circle, var(--profile-accent) 0%, transparent 70%)`,
            animationDelay: "2s",
          }}
        />
        {/* Orb 3 - Center subtle */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-10 animate-scale-pulse"
          style={{
            background: `radial-gradient(circle, var(--profile-secondary) 0%, transparent 60%)`,
          }}
        />
      </div>

      {/* Animated Mesh Gradient Background */}
      <div
        className="absolute inset-0 opacity-[0.03] animate-gradient"
        style={{
          backgroundImage: `
            linear-gradient(45deg, var(--profile-primary) 0%, transparent 50%),
            linear-gradient(-45deg, var(--profile-accent) 0%, transparent 50%)
          `,
          backgroundSize: "200% 200%",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20 w-full">
        <div className="grid gap-8 lg:grid-cols-[1fr,auto] lg:gap-12 items-center">
          {/* Left Column - Info */}
          <div
            className={cn(
              "order-2 lg:order-1 text-center lg:text-left",
              "opacity-0",
              heroVisible && "animate-fade-in-up"
            )}
          >
            {/* Badges */}
            <div
              className={cn(
                "flex flex-wrap gap-2 justify-center lg:justify-start mb-4",
                "opacity-0",
                heroVisible && "animate-fade-in-up stagger-1"
              )}
              style={{ animationFillMode: "forwards" }}
            >
              {profile.isVerified && (
                <Badge
                  className="gap-1 shadow-lg animate-bounce-subtle"
                  style={{
                    backgroundColor: "var(--profile-primary)",
                    color: "white",
                    animationDuration: "3s",
                  }}
                >
                  <Shield className="h-3 w-3" />
                  {t.verifiedBadge}
                </Badge>
              )}
              {profile.availability === "immediately" && (
                <Badge
                  variant="outline"
                  className="gap-1 border-green-500 text-green-600 shadow-sm"
                >
                  <Clock className="h-3 w-3" />
                  {availabilityText}
                </Badge>
              )}
            </div>

            {/* Name & Title */}
            <h1
              className={cn(
                "text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl mb-2",
                "opacity-0",
                heroVisible && "animate-fade-in-up stagger-2"
              )}
              style={{
                color: "var(--profile-text)",
                animationFillMode: "forwards",
              }}
            >
              {profile.name}
            </h1>
            <p
              className={cn(
                "text-lg sm:text-xl lg:text-2xl mb-4 font-medium",
                "opacity-0",
                heroVisible && "animate-fade-in-up stagger-3"
              )}
              style={{
                color: "var(--profile-primary)",
                animationFillMode: "forwards",
              }}
            >
              {profile.title}
            </p>

            {/* Headline */}
            {profile.headline && (
              <p
                className={cn(
                  "text-lg sm:text-xl text-gray-600 mb-6 max-w-2xl mx-auto lg:mx-0",
                  "opacity-0",
                  heroVisible && "animate-fade-in-up stagger-4"
                )}
                style={{ animationFillMode: "forwards" }}
              >
                {profile.headline}
              </p>
            )}

            {/* Stats Row with Count-Up */}
            <div
              className={cn(
                "flex flex-wrap gap-6 justify-center lg:justify-start mb-8",
                "opacity-0",
                heroVisible && "animate-fade-in-up stagger-5"
              )}
              style={{ animationFillMode: "forwards" }}
            >
              {/* Location */}
              {profile.city && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin
                    className="h-5 w-5"
                    style={{ color: "var(--profile-primary)" }}
                  />
                  <span className="font-medium">{profile.city}</span>
                </div>
              )}

              {/* Experience with Count-Up */}
              {profile.experienceYears > 0 && (
                <AnimatedStat
                  value={profile.experienceYears}
                  suffix="+"
                  label={t.experience ?? "Jahre Erfahrung"}
                  icon={<Clock className="h-5 w-5" />}
                  isVisible={heroVisible}
                />
              )}

              {/* Session Type */}
              <div className="flex items-center gap-1.5 text-gray-600">
                {profile.sessionType === "online" ? (
                  <Video
                    className="h-5 w-5"
                    style={{ color: "var(--profile-primary)" }}
                  />
                ) : (
                  <Building2
                    className="h-5 w-5"
                    style={{ color: "var(--profile-primary)" }}
                  />
                )}
                <span className="font-medium">{sessionTypeText}</span>
              </div>
            </div>

            {/* Price with Glow */}
            {profile.pricePerSession > 0 && (
              <div
                className={cn(
                  "mb-8 inline-block",
                  "opacity-0",
                  heroVisible && "animate-fade-in-up stagger-6"
                )}
                style={{ animationFillMode: "forwards" }}
              >
                <span
                  className="text-4xl lg:text-5xl font-bold"
                  style={{ color: "var(--profile-primary)" }}
                >
                  {profile.pricePerSession} €
                </span>
                <span className="text-gray-500 ml-2 text-lg">
                  {t.pricePerSession}
                </span>
              </div>
            )}

            {/* CTA Buttons with Enhanced Hover */}
            <div
              className={cn(
                "flex flex-col sm:flex-row gap-4 justify-center lg:justify-start",
                "opacity-0",
                heroVisible && "animate-fade-in-up stagger-7"
              )}
              style={{ animationFillMode: "forwards" }}
            >
              <Button
                size="lg"
                className={cn(
                  "text-white shadow-lg",
                  "hover:shadow-xl hover:scale-105",
                  "transition-all duration-300",
                  "relative overflow-hidden group"
                )}
                style={{ backgroundColor: "var(--profile-primary)" }}
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {/* Shimmer effect on hover */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <Mail className="mr-2 h-4 w-4 relative z-10" />
                <span className="relative z-10">{t.bookAppointment}</span>
              </Button>
              {profile.phone && (
                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    "border-2",
                    "hover:scale-105 hover:shadow-lg",
                    "transition-all duration-300"
                  )}
                  style={{
                    borderColor: "var(--profile-primary)",
                    color: "var(--profile-primary)",
                  }}
                  asChild
                >
                  <a href={`tel:${profile.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    {t.callNow}
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Right Column - Animated Profile Image */}
          <div
            className={cn(
              "order-1 lg:order-2 flex justify-center",
              "opacity-0",
              heroVisible && "animate-fade-in-scale"
            )}
            style={{ animationFillMode: "forwards", animationDelay: "0.2s" }}
          >
            <div className="relative">
              {/* Animated rotating ring */}
              <div
                className="absolute -inset-3 rounded-full animate-spin-slow opacity-60"
                style={{
                  background: `conic-gradient(from 0deg, var(--profile-primary), var(--profile-accent), var(--profile-secondary), var(--profile-primary))`,
                  filter: "blur(2px)",
                }}
              />

              {/* Pulsing glow */}
              <div
                className="absolute -inset-4 rounded-full animate-pulse-glow opacity-50"
                style={{
                  "--glow-color": "var(--profile-primary)",
                } as React.CSSProperties}
              />

              {/* Image container */}
              <div
                className={cn(
                  "relative w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96",
                  "rounded-full overflow-hidden",
                  "shadow-2xl ring-4",
                  "transition-transform duration-500 hover:scale-105"
                )}
                style={{
                  "--tw-ring-color": "var(--profile-secondary)",
                } as React.CSSProperties}
              >
                <Image
                  src={profile.imageUrl || "/images/placeholder-avatar.jpg"}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 640px) 208px, (max-width: 1024px) 256px, (max-width: 1280px) 320px, 384px"
                />
              </div>

              {/* Floating verified badge */}
              {profile.isVerified && (
                <div
                  className="absolute -bottom-2 -right-2 lg:bottom-4 lg:right-0 animate-float"
                  style={{ animationDuration: "4s" }}
                >
                  <div
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full shadow-xl text-white text-sm font-medium"
                    style={{ backgroundColor: "var(--profile-primary)" }}
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.verifiedBadge}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
