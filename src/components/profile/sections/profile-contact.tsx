"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Linkedin,
  Instagram,
  Send,
  Euro,
  CreditCard,
  Video,
  Building2,
  Gift,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { TherapistProfileData, WorkingHours } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import { submitContactInquiry } from "@/lib/actions/contact-inquiry";

interface ProfileContactProps {
  profile: TherapistProfileData;
  locale: string;
}

export function ProfileContact({ profile, locale }: ProfileContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ref: contactRef, isVisible: contactVisible } = useScrollAnimation();

  const t = {
    de: {
      contact: "Kontakt aufnehmen",
      contactInfo: "Kontaktdaten",
      location: "Adresse",
      phone: "Telefon",
      email: "E-Mail",
      website: "Website",
      workingHours: "Sprechzeiten",
      pricing: "Kosten & Abrechnung",
      pricePerSession: "Kosten pro Sitzung",
      insurance: "Versicherung",
      public: "Gesetzliche Krankenkasse",
      private: "Private Krankenversicherung",
      sessionType: "Sitzungsart",
      online: "Online-Therapie",
      in_person: "Vor-Ort-Therapie",
      both: "Online & Vor Ort",
      trialSession: "Erstgespräch",
      trialFree: "Kostenloses Erstgespräch",
      trialPrice: "Erstgespräch",
      // Form
      yourName: "Ihr Name",
      yourEmail: "Ihre E-Mail",
      yourPhone: "Ihre Telefonnummer (optional)",
      yourMessage: "Ihre Nachricht",
      messagePlaceholder: "Beschreiben Sie kurz Ihr Anliegen...",
      sendMessage: "Nachricht senden",
      messageSent: "Nachricht gesendet!",
      sendingMessage: "Wird gesendet...",
      errorMessage: "Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.",
      // Days
      monday: "Montag",
      tuesday: "Dienstag",
      wednesday: "Mittwoch",
      thursday: "Donnerstag",
      friday: "Freitag",
      saturday: "Samstag",
      sunday: "Sonntag",
      closed: "Geschlossen",
    },
    en: {
      contact: "Get in Touch",
      contactInfo: "Contact Information",
      location: "Address",
      phone: "Phone",
      email: "Email",
      website: "Website",
      workingHours: "Office Hours",
      pricing: "Pricing & Insurance",
      pricePerSession: "Price per session",
      insurance: "Insurance",
      public: "Public Health Insurance",
      private: "Private Insurance",
      sessionType: "Session Type",
      online: "Online Therapy",
      in_person: "In-Person Therapy",
      both: "Online & In Person",
      trialSession: "First Session",
      trialFree: "Free initial consultation",
      trialPrice: "Initial consultation",
      // Form
      yourName: "Your Name",
      yourEmail: "Your Email",
      yourPhone: "Your Phone (optional)",
      yourMessage: "Your Message",
      messagePlaceholder: "Briefly describe your concern...",
      sendMessage: "Send Message",
      messageSent: "Message sent!",
      sendingMessage: "Sending...",
      errorMessage: "Failed to send message. Please try again.",
      // Days
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
      closed: "Closed",
    },
  }[locale] || {
    de: {
      contact: "Kontakt aufnehmen",
      contactInfo: "Kontaktdaten",
      location: "Adresse",
      phone: "Telefon",
      email: "E-Mail",
      website: "Website",
      workingHours: "Sprechzeiten",
      pricing: "Kosten & Abrechnung",
      pricePerSession: "Kosten pro Sitzung",
      insurance: "Versicherung",
      public: "Gesetzliche Krankenkasse",
      private: "Private Krankenversicherung",
      sessionType: "Sitzungsart",
      online: "Online-Therapie",
      in_person: "Vor-Ort-Therapie",
      both: "Online & Vor Ort",
      trialSession: "Erstgespräch",
      trialFree: "Kostenloses Erstgespräch",
      trialPrice: "Erstgespräch",
      yourName: "Ihr Name",
      yourEmail: "Ihre E-Mail",
      yourPhone: "Ihre Telefonnummer (optional)",
      yourMessage: "Ihre Nachricht",
      messagePlaceholder: "Beschreiben Sie kurz Ihr Anliegen...",
      sendMessage: "Nachricht senden",
      messageSent: "Nachricht gesendet!",
      sendingMessage: "Wird gesendet...",
      errorMessage: "Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.",
      monday: "Montag",
      tuesday: "Dienstag",
      wednesday: "Mittwoch",
      thursday: "Donnerstag",
      friday: "Freitag",
      saturday: "Samstag",
      sunday: "Sonntag",
      closed: "Geschlossen",
    },
  };

  const sessionTypeText = {
    online: t.online,
    in_person: t.in_person,
    both: t.both,
  }[profile.sessionType] || t.both;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const result = await submitContactInquiry({
        therapistId: profile.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message,
        selectedTopics: [],
        selectedSubTopics: [],
      });

      if (result.success) {
        setSent(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
        // Reset success message after a few seconds
        setTimeout(() => setSent(false), 5000);
      } else {
        setError(result.error ?? t.errorMessage ?? "Failed to send message");
      }
    } catch {
      setError(t.errorMessage ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatWorkingHours = (hours: WorkingHours) => {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const dayLabels = [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday];

    return days.map((day, index) => {
      const dayHours = hours[day as keyof WorkingHours];
      let timeString = t.closed;

      if (dayHours && !dayHours.closed && dayHours.from && dayHours.to) {
        timeString = `${dayHours.from} - ${dayHours.to}`;
      }

      return { day: dayLabels[index], hours: timeString };
    });
  };

  const hasAddress = profile.city || profile.street;

  return (
    <div
      id="contact"
      className="py-16 sm:py-24 relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, var(--profile-bg) 0%, var(--profile-secondary) 50%, var(--profile-bg) 100%)`,
      }}
    >
      {/* Gradient top border */}
      <div
        className="absolute top-0 left-0 right-0 h-1 animate-gradient"
        style={{
          background: `linear-gradient(90deg, transparent, var(--profile-primary), var(--profile-accent), var(--profile-primary), transparent)`,
          backgroundSize: "200% 100%",
        }}
      />

      {/* Decorative background - enhanced */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated blob - Top Right */}
        <div
          className="absolute -top-32 -right-32 w-[35rem] h-[35rem] animate-aurora-1"
          style={{
            background: `radial-gradient(circle, var(--profile-primary) 0%, transparent 60%)`,
            opacity: 0.35,
            filter: "blur(60px)",
          }}
        />
        {/* Blob - Bottom Left */}
        <div
          className="absolute -bottom-40 -left-40 w-[40rem] h-[40rem] animate-aurora-2"
          style={{
            background: `radial-gradient(circle, var(--profile-accent) 0%, transparent 60%)`,
            opacity: 0.3,
            filter: "blur(70px)",
          }}
        />
        {/* Center glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[30rem] animate-glow-pulse"
          style={{
            background: `radial-gradient(ellipse, var(--profile-primary) 0%, transparent 70%)`,
            opacity: 0.15,
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div ref={contactRef} className="text-center mb-12">
          <h2
            className={cn(
              "text-3xl sm:text-4xl font-bold mb-4",
              "opacity-0",
              contactVisible && "animate-fade-in-up"
            )}
            style={{ color: "var(--profile-text)", animationFillMode: "forwards" }}
          >
            {t.contact}
          </h2>
          <div
            className={cn(
              "h-1 w-20 mx-auto rounded-full animate-gradient",
              "opacity-0",
              contactVisible && "animate-fade-in-up stagger-1"
            )}
            style={{
              background: `linear-gradient(90deg, var(--profile-primary), var(--profile-accent), var(--profile-primary))`,
              backgroundSize: "200% 100%",
              animationFillMode: "forwards",
            }}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div
            className={cn("opacity-0", contactVisible && "animate-slide-in-left")}
            style={{ animationFillMode: "forwards", animationDelay: "0.1s" }}
          >
            <GlassCard enableTilt={false} className="h-full">
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.yourName}</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="transition-all duration-200 focus:scale-[1.01]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.yourEmail}</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="transition-all duration-200 focus:scale-[1.01]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.yourPhone}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="transition-all duration-200 focus:scale-[1.01]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t.yourMessage}</Label>
                    <textarea
                      id="message"
                      required
                      rows={4}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 focus:scale-[1.01]"
                      placeholder={t.messagePlaceholder}
                      value={formData.message}
                      onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                  <Button
                    type="submit"
                    className={cn(
                      "w-full py-6 text-lg font-semibold text-white",
                      "transition-all duration-300",
                      "hover:scale-[1.02] hover:shadow-xl",
                      "relative overflow-hidden group"
                    )}
                    style={{
                      background: sent
                        ? "linear-gradient(135deg, #10B981, #059669)"
                        : `linear-gradient(135deg, var(--profile-primary), var(--profile-accent))`,
                    }}
                    disabled={sending}
                  >
                    {/* Shimmer effect */}
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    {sent ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4 relative z-10" />
                        <span className="relative z-10">{t.messageSent}</span>
                      </>
                    ) : sending ? (
                      <span className="relative z-10">{t.sendingMessage}</span>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4 relative z-10" />
                        <span className="relative z-10">{t.sendMessage}</span>
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </GlassCard>
          </div>

          {/* Contact Info */}
          <div
            className={cn(
              "space-y-6 opacity-0",
              contactVisible && "animate-slide-in-right"
            )}
            style={{ animationFillMode: "forwards", animationDelay: "0.2s" }}
          >
            {/* Contact Details Card */}
            <GlassCard enableTilt={true}>
              <div className="p-6">
                <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Mail className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                  {t.contactInfo}
                </div>
                <div className="space-y-4">
                  {/* Location */}
                  {hasAddress && (
                    <div className="flex items-start gap-3 group">
                      <MapPin
                        className="h-5 w-5 mt-0.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ color: "var(--profile-primary)" }}
                      />
                      <div>
                        <p className="font-medium">{t.location}</p>
                        <p className="text-gray-700">
                          {profile.practiceName && <span className="block">{profile.practiceName}</span>}
                          {profile.street && <span className="block">{profile.street}</span>}
                          {profile.postalCode} {profile.city}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {profile.phone && (
                    <div className="flex items-center gap-3 group">
                      <Phone
                        className="h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ color: "var(--profile-primary)" }}
                      />
                      <div>
                        <p className="font-medium">{t.phone}</p>
                        <a href={`tel:${profile.phone}`} className="text-gray-700 hover:underline">
                          {profile.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {profile.email && (
                    <div className="flex items-center gap-3 group">
                      <Mail
                        className="h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ color: "var(--profile-primary)" }}
                      />
                      <div>
                        <p className="font-medium">{t.email}</p>
                        <a href={`mailto:${profile.email}`} className="text-gray-700 hover:underline">
                          {profile.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {profile.website && (
                    <div className="flex items-center gap-3 group">
                      <Globe
                        className="h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ color: "var(--profile-primary)" }}
                      />
                      <div>
                        <p className="font-medium">{t.website}</p>
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:underline"
                        >
                          {profile.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  {(profile.linkedIn || profile.instagram) && (
                    <div className="flex gap-3 pt-2">
                      {profile.linkedIn && (
                        <a
                          href={profile.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110"
                        >
                          <Linkedin className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                        </a>
                      )}
                      {profile.instagram && (
                        <a
                          href={profile.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110"
                        >
                          <Instagram className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Working Hours Card */}
            {profile.workingHours && (
              <GlassCard enableTilt={true}>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Clock className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                    {t.workingHours}
                  </div>
                  <div className="space-y-2">
                    {formatWorkingHours(profile.workingHours).map(({ day, hours }) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-gray-600">{day}</span>
                        <span className={hours === t.closed ? "text-gray-400" : "font-medium"}>
                          {hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Pricing Card */}
            <GlassCard enableTilt={true}>
              <div className="p-6">
                <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Euro className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                  {t.pricing}
                </div>
                <div className="space-y-4">
                  {/* Price */}
                  {profile.pricePerSession > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t.pricePerSession}</span>
                      <span className="text-xl font-bold" style={{ color: "var(--profile-primary)" }}>
                        {profile.pricePerSession} €
                      </span>
                    </div>
                  )}

                  {/* Trial Session */}
                  {profile.offersTrialSession && (
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                      <span>
                        {profile.trialSessionPrice === 0
                          ? t.trialFree
                          : `${t.trialPrice}: ${profile.trialSessionPrice} €`}
                      </span>
                    </div>
                  )}

                  {/* Session Type */}
                  <div className="flex items-center gap-2">
                    {profile.sessionType === "online" ? (
                      <Video className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                    ) : (
                      <Building2 className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                    )}
                    <span>{sessionTypeText}</span>
                  </div>

                  {/* Insurance */}
                  {profile.insurance.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                        <span>{t.insurance}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.insurance.map((ins) => (
                          <Badge
                            key={ins}
                            variant="outline"
                            className="transition-all duration-200 hover:scale-105"
                          >
                            {ins === "public" ? t.public : t.private}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
