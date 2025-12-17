"use client";

import Image from "next/image";
import { MapPin, Phone, Mail, Shield, Star, Clock, Video, Building2 } from "lucide-react";
import type { TherapistProfileData } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProfileHeroProps {
  profile: TherapistProfileData;
  locale: string;
}

export function ProfileHero({ profile, locale }: ProfileHeroProps) {
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
    <header className="relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, var(--profile-primary) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, var(--profile-accent) 0%, transparent 50%)`,
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr,auto] lg:gap-12 items-center">
          {/* Left Column - Info */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-4">
              {profile.isVerified && (
                <Badge
                  className="gap-1"
                  style={{ backgroundColor: "var(--profile-primary)", color: "white" }}
                >
                  <Shield className="h-3 w-3" />
                  {t.verifiedBadge}
                </Badge>
              )}
              {profile.availability === "immediately" && (
                <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
                  <Clock className="h-3 w-3" />
                  {availabilityText}
                </Badge>
              )}
            </div>

            {/* Name & Title */}
            <h1
              className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-2"
              style={{ color: "var(--profile-text)" }}
            >
              {profile.name}
            </h1>
            <p
              className="text-lg sm:text-xl mb-4"
              style={{ color: "var(--profile-primary)" }}
            >
              {profile.title}
            </p>

            {/* Headline */}
            {profile.headline && (
              <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-2xl mx-auto lg:mx-0">
                {profile.headline}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
              {/* Location */}
              {profile.city && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin className="h-4 w-4" style={{ color: "var(--profile-primary)" }} />
                  <span>{profile.city}</span>
                </div>
              )}

              {/* Rating */}
              {profile.rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{profile.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({profile.reviewCount})</span>
                </div>
              )}

              {/* Experience */}
              {profile.experienceYears > 0 && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span className="font-medium">{profile.experienceYears}+</span>
                  <span>{t.experience}</span>
                </div>
              )}

              {/* Session Type */}
              <div className="flex items-center gap-1.5 text-gray-600">
                {profile.sessionType === "online" ? (
                  <Video className="h-4 w-4" style={{ color: "var(--profile-primary)" }} />
                ) : (
                  <Building2 className="h-4 w-4" style={{ color: "var(--profile-primary)" }} />
                )}
                <span>{sessionTypeText}</span>
              </div>
            </div>

            {/* Price */}
            {profile.pricePerSession > 0 && (
              <div className="mb-8">
                <span className="text-3xl font-bold" style={{ color: "var(--profile-primary)" }}>
                  {profile.pricePerSession} €
                </span>
                <span className="text-gray-500 ml-2">{t.pricePerSession}</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button
                size="lg"
                className="text-white shadow-lg hover:shadow-xl transition-shadow"
                style={{ backgroundColor: "var(--profile-primary)" }}
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Mail className="mr-2 h-4 w-4" />
                {t.bookAppointment}
              </Button>
              {profile.phone && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2"
                  style={{ borderColor: "var(--profile-primary)", color: "var(--profile-primary)" }}
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

          {/* Right Column - Image */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div
              className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden shadow-2xl ring-4"
              style={{ "--tw-ring-color": "var(--profile-secondary)" } as React.CSSProperties}
            >
              <Image
                src={profile.imageUrl || "/images/placeholder-avatar.jpg"}
                alt={profile.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 640px) 192px, (max-width: 1024px) 256px, 320px"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
