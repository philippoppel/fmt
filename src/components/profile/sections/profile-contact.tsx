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
} from "lucide-react";
import type { TherapistProfileData, WorkingHours } from "@/types/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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

    // Simulate sending - in production, this would call an API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSending(false);
    setSent(true);
    setFormData({ name: "", email: "", phone: "", message: "" });

    // Reset success message after a few seconds
    setTimeout(() => setSent(false), 5000);
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
      className="py-16 sm:py-24"
      style={{
        background: `linear-gradient(180deg, var(--profile-bg) 0%, var(--profile-secondary) 100%)`,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          className="text-2xl sm:text-3xl font-bold mb-12 text-center"
          style={{ color: "var(--profile-text)" }}
        >
          {t.contact}
        </h2>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.yourName}</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.yourPhone}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t.yourMessage}</Label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder={t.messagePlaceholder}
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full text-white"
                  style={{ backgroundColor: "var(--profile-primary)" }}
                  disabled={sending || sent}
                >
                  {sent ? (
                    t.messageSent
                  ) : sending ? (
                    t.sendingMessage
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t.sendMessage}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Contact Details Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                  {t.contactInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location */}
                {hasAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--profile-primary)" }} />
                    <div>
                      <p className="font-medium">{t.location}</p>
                      <p className="text-gray-600">
                        {profile.practiceName && <span className="block">{profile.practiceName}</span>}
                        {profile.street && <span className="block">{profile.street}</span>}
                        {profile.postalCode} {profile.city}
                      </p>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 flex-shrink-0" style={{ color: "var(--profile-primary)" }} />
                    <div>
                      <p className="font-medium">{t.phone}</p>
                      <a href={`tel:${profile.phone}`} className="text-gray-600 hover:underline">
                        {profile.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {profile.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 flex-shrink-0" style={{ color: "var(--profile-primary)" }} />
                    <div>
                      <p className="font-medium">{t.email}</p>
                      <a href={`mailto:${profile.email}`} className="text-gray-600 hover:underline">
                        {profile.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Website */}
                {profile.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 flex-shrink-0" style={{ color: "var(--profile-primary)" }} />
                    <div>
                      <p className="font-medium">{t.website}</p>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:underline"
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
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                      </a>
                    )}
                    {profile.instagram && (
                      <a
                        href={profile.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Instagram className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Working Hours Card */}
            {profile.workingHours && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                    {t.workingHours}
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}

            {/* Pricing Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Euro className="h-5 w-5" style={{ color: "var(--profile-primary)" }} />
                  {t.pricing}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        <Badge key={ins} variant="outline">
                          {ins === "public" ? t.public : t.private}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
