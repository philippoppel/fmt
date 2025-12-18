"use client";

import Image from "next/image";
import { MapPin, Phone, Mail, Shield, Clock, Video, Building2 } from "lucide-react";
import type { TherapistProfileData } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

interface ProfileHeroProps {
  profile: TherapistProfileData;
  locale: string;
}

export function ProfileHero({ profile, locale }: ProfileHeroProps) {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });

  const t = {
    de: {
      verifiedBadge: "Verifiziert",
      experience: "Jahre",
      pricePerSession: "pro Sitzung",
      bookAppointment: "Termin anfragen",
      callNow: "Jetzt anrufen",
      online: "Online",
      inPerson: "Vor Ort",
      both: "Online & Vor Ort",
      immediately: "Sofort verfügbar",
      this_week: "Diese Woche",
      flexible: "Flexibel",
    },
    en: {
      verifiedBadge: "Verified",
      experience: "Years",
      pricePerSession: "per session",
      bookAppointment: "Book Appointment",
      callNow: "Call Now",
      online: "Online",
      inPerson: "In Person",
      both: "Online & In Person",
      immediately: "Available Now",
      this_week: "This Week",
      flexible: "Flexible",
    },
  }[locale] || {
    de: {
      verifiedBadge: "Verifiziert",
      experience: "Jahre",
      pricePerSession: "pro Sitzung",
      bookAppointment: "Termin anfragen",
      callNow: "Jetzt anrufen",
      online: "Online",
      inPerson: "Vor Ort",
      both: "Online & Vor Ort",
      immediately: "Sofort verfügbar",
      this_week: "Diese Woche",
      flexible: "Flexibel",
    },
  };

  const sessionTypeText = {
    online: t.online,
    in_person: t.inPerson,
    both: t.both,
  }[profile.sessionType] || t.both;

  // Get background image from office images or gallery
  const backgroundImage = profile.officeImages?.[0] || profile.galleryImages?.[0];

  // Count up for experience years
  const experienceCount = useCountUp({
    end: profile.experienceYears,
    duration: 2000,
    enabled: heroVisible
  });

  return (
    <header ref={heroRef} className="relative min-h-screen overflow-hidden">
      {/* Background Layer */}
      {backgroundImage ? (
        <>
          {/* Full-width background image */}
          <div className="absolute inset-0">
            <Image
              src={backgroundImage}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Dark gradient overlay for readability */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(
                  180deg,
                  rgba(0,0,0,0.4) 0%,
                  rgba(0,0,0,0.5) 40%,
                  rgba(0,0,0,0.7) 70%,
                  var(--profile-bg) 100%
                )`,
              }}
            />
            {/* Color tint overlay */}
            <div
              className="absolute inset-0 mix-blend-soft-light"
              style={{
                background: `linear-gradient(
                  135deg,
                  var(--profile-primary) 0%,
                  transparent 50%,
                  var(--profile-accent) 100%
                )`,
                opacity: 0.4,
              }}
            />
          </div>
        </>
      ) : (
        <>
          {/* Fallback: Vibrant gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                135deg,
                var(--profile-bg) 0%,
                var(--profile-secondary) 50%,
                var(--profile-bg) 100%
              )`,
            }}
          />
          {/* Animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-32 -right-32 w-[40rem] h-[40rem] rounded-full animate-aurora-1"
              style={{
                background: `radial-gradient(circle, var(--profile-primary) 0%, transparent 60%)`,
                opacity: 0.6,
                filter: "blur(60px)",
              }}
            />
            <div
              className="absolute -bottom-48 -left-48 w-[50rem] h-[50rem] rounded-full animate-aurora-2"
              style={{
                background: `radial-gradient(circle, var(--profile-accent) 0%, transparent 60%)`,
                opacity: 0.5,
                filter: "blur(80px)",
              }}
            />
            <div
              className="absolute top-1/3 left-1/3 w-[30rem] h-[30rem] rounded-full animate-glow-pulse"
              style={{
                background: `radial-gradient(circle, var(--profile-primary) 0%, transparent 70%)`,
                opacity: 0.3,
                filter: "blur(50px)",
              }}
            />
          </div>
        </>
      )}

      {/* Gradient line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1 z-20 animate-gradient"
        style={{
          background: `linear-gradient(90deg, var(--profile-primary), var(--profile-accent), var(--profile-primary))`,
          backgroundSize: "200% 100%",
        }}
      />

      {/* Content positioned at bottom */}
      <div className="relative z-10 min-h-screen flex items-end pb-16 lg:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full">
          {/* Glassmorphism Card */}
          <div
            className={cn(
              "backdrop-blur-xl rounded-3xl",
              "p-6 sm:p-8 lg:p-12",
              "shadow-2xl",
              "border border-white/30",
              "opacity-0",
              heroVisible && "animate-fade-in-up"
            )}
            style={{
              background: backgroundImage
                ? "rgba(255,255,255,0.92)"
                : "rgba(255,255,255,0.85)",
              animationFillMode: "forwards",
            }}
          >
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Profile Image - Modern rounded rectangle */}
              <div
                className={cn(
                  "relative shrink-0",
                  "opacity-0",
                  heroVisible && "animate-fade-in-scale"
                )}
                style={{ animationFillMode: "forwards", animationDelay: "0.2s" }}
              >
                {/* Gradient border ring */}
                <div
                  className="absolute -inset-1 rounded-2xl animate-gradient"
                  style={{
                    background: `linear-gradient(
                      135deg,
                      var(--profile-primary),
                      var(--profile-accent),
                      var(--profile-primary)
                    )`,
                    backgroundSize: "200% 200%",
                  }}
                />
                {/* Image container */}
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={profile.imageUrl || "/images/placeholder-avatar.jpg"}
                    alt={profile.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 640px) 144px, (max-width: 1024px) 176px, 208px"
                  />
                </div>
                {/* Verified badge - floating pill */}
                {profile.isVerified && (
                  <div
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg whitespace-nowrap"
                    style={{
                      background: `linear-gradient(135deg, var(--profile-primary), var(--profile-accent))`,
                    }}
                  >
                    <Shield className="h-4 w-4" />
                    {t.verifiedBadge}
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center lg:text-left">
                {/* Name */}
                <h1
                  className={cn(
                    "text-3xl sm:text-4xl lg:text-5xl font-bold mb-2",
                    "opacity-0",
                    heroVisible && "animate-fade-in-up stagger-1"
                  )}
                  style={{
                    color: "var(--profile-text)",
                    animationFillMode: "forwards",
                  }}
                >
                  {profile.name}
                </h1>

                {/* Title with gradient text */}
                <p
                  className={cn(
                    "text-xl sm:text-2xl font-semibold mb-4",
                    "opacity-0",
                    heroVisible && "animate-fade-in-up stagger-2"
                  )}
                  style={{
                    background: `linear-gradient(135deg, var(--profile-primary), var(--profile-accent))`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animationFillMode: "forwards",
                  }}
                >
                  {profile.title}
                </p>

                {/* Headline */}
                {profile.headline && (
                  <p
                    className={cn(
                      "text-gray-600 text-lg mb-6 max-w-2xl mx-auto lg:mx-0",
                      "opacity-0",
                      heroVisible && "animate-fade-in-up stagger-3"
                    )}
                    style={{ animationFillMode: "forwards" }}
                  >
                    {profile.headline}
                  </p>
                )}

                {/* Stats as pill badges */}
                <div
                  className={cn(
                    "flex flex-wrap gap-3 justify-center lg:justify-start mb-6",
                    "opacity-0",
                    heroVisible && "animate-fade-in-up stagger-4"
                  )}
                  style={{ animationFillMode: "forwards" }}
                >
                  {profile.city && (
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: "var(--profile-secondary)",
                        color: "var(--profile-text)",
                      }}
                    >
                      <MapPin className="h-4 w-4" style={{ color: "var(--profile-primary)" }} />
                      {profile.city}
                    </div>
                  )}
                  {profile.experienceYears > 0 && (
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: "var(--profile-secondary)",
                        color: "var(--profile-text)",
                      }}
                    >
                      <Clock className="h-4 w-4" style={{ color: "var(--profile-primary)" }} />
                      <span className="tabular-nums">{experienceCount}+</span> {t.experience}
                    </div>
                  )}
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: "var(--profile-secondary)",
                      color: "var(--profile-text)",
                    }}
                  >
                    {profile.sessionType === "online" ? (
                      <Video className="h-4 w-4" style={{ color: "var(--profile-primary)" }} />
                    ) : (
                      <Building2 className="h-4 w-4" style={{ color: "var(--profile-primary)" }} />
                    )}
                    {sessionTypeText}
                  </div>
                </div>

                {/* Price */}
                {profile.pricePerSession > 0 && (
                  <div
                    className={cn(
                      "mb-8",
                      "opacity-0",
                      heroVisible && "animate-fade-in-up stagger-5"
                    )}
                    style={{ animationFillMode: "forwards" }}
                  >
                    <span
                      className="text-4xl lg:text-5xl font-bold"
                      style={{ color: "var(--profile-primary)" }}
                    >
                      {profile.pricePerSession}€
                    </span>
                    <span className="text-gray-500 ml-2 text-lg">
                      {t.pricePerSession}
                    </span>
                  </div>
                )}

                {/* CTA Buttons with Gradient */}
                <div
                  className={cn(
                    "flex flex-col sm:flex-row gap-4 justify-center lg:justify-start",
                    "opacity-0",
                    heroVisible && "animate-fade-in-up stagger-6"
                  )}
                  style={{ animationFillMode: "forwards" }}
                >
                  <Button
                    size="lg"
                    className={cn(
                      "text-white font-semibold",
                      "shadow-lg hover:shadow-xl",
                      "hover:scale-105 transition-all duration-300",
                      "relative overflow-hidden group"
                    )}
                    style={{
                      background: `linear-gradient(135deg, var(--profile-primary), var(--profile-accent))`,
                    }}
                    onClick={() =>
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    {/* Shimmer effect */}
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full"
                      style={{ transition: "transform 0.6s ease" }}
                    />
                    <Mail className="mr-2 h-5 w-5 relative z-10" />
                    <span className="relative z-10">{t.bookAppointment}</span>
                  </Button>
                  {profile.phone && (
                    <Button
                      size="lg"
                      variant="outline"
                      className={cn(
                        "font-semibold border-2",
                        "hover:scale-105 transition-all duration-300",
                        "hover:shadow-lg"
                      )}
                      style={{
                        borderColor: "var(--profile-primary)",
                        color: "var(--profile-primary)",
                      }}
                      asChild
                    >
                      <a href={`tel:${profile.phone}`}>
                        <Phone className="mr-2 h-5 w-5" />
                        {t.callNow}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
