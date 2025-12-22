"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TherapistProfileData } from "@/types/profile";
import type { MicrositeConfig } from "@/types/microsite";
import type { AccountType } from "@/types/therapist";
import { getTierLimits } from "@/lib/microsite/tier-limits";
import { Lock } from "lucide-react";

interface ContentTabProps {
  config: MicrositeConfig;
  profile: TherapistProfileData;
  accountType: AccountType;
  onUpdate: (updates: Partial<MicrositeConfig>) => void;
}

export function ContentTab({ config, profile, accountType, onUpdate }: ContentTabProps) {
  const limits = getTierLimits(accountType);

  const updateHero = (updates: Partial<MicrositeConfig["hero"]>) => {
    onUpdate({
      hero: { ...config.hero, ...updates },
    });
  };

  const updateContact = (updates: Partial<MicrositeConfig["contact"]>) => {
    onUpdate({
      contact: { ...config.contact, ...updates },
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hero-Bereich</CardTitle>
          <CardDescription>
            Der erste Eindruck Ihrer Microsite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Brand Text */}
          <div className="space-y-2">
            <Label htmlFor="brandText">Name / Marke</Label>
            <Input
              id="brandText"
              value={config.hero.brandText}
              onChange={(e) => updateHero({ brandText: e.target.value })}
              placeholder={profile.name}
            />
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={config.hero.tagline}
              onChange={(e) => updateHero({ tagline: e.target.value })}
              placeholder="Ihre einfühlsame Begleitung..."
            />
            <p className="text-xs text-muted-foreground">
              Ein kurzer Satz, der Ihre Arbeit beschreibt
            </p>
          </div>

          {/* Location Badges */}
          <div className="space-y-2">
            <Label htmlFor="location">Standort</Label>
            <Input
              id="location"
              value={config.hero.locationBadges.join(", ")}
              onChange={(e) =>
                updateHero({
                  locationBadges: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Berlin, Online"
            />
            <p className="text-xs text-muted-foreground">
              Komma-getrennt für mehrere Standorte
            </p>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="coverImage">
              Titelbild
              {!limits.canUploadHeroImage && (
                <Lock className="h-3 w-3 inline ml-2 text-muted-foreground" />
              )}
            </Label>
            {limits.canUploadHeroImage ? (
              <Input
                id="coverImage"
                value={config.hero.coverImageUrl || ""}
                onChange={(e) => updateHero({ coverImageUrl: e.target.value || null })}
                placeholder="https://..."
              />
            ) : (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                Upgrade auf Mittel-Tier für eigenes Titelbild
              </div>
            )}
          </div>

          {/* Logo (Premium) */}
          <div className="space-y-2">
            <Label htmlFor="logo">
              Logo
              {!limits.canUploadLogo && (
                <Lock className="h-3 w-3 inline ml-2 text-muted-foreground" />
              )}
            </Label>
            {limits.canUploadLogo ? (
              <Input
                id="logo"
                value={config.hero.logoUrl || ""}
                onChange={(e) => updateHero({ logoUrl: e.target.value || null })}
                placeholder="https://..."
              />
            ) : (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                Upgrade auf Premium für eigenes Logo
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Call-to-Action</CardTitle>
          <CardDescription>
            Der Hauptbutton auf Ihrer Microsite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ctaText">Button-Text</Label>
            <Input
              id="ctaText"
              value={config.hero.ctaPrimary?.text || ""}
              onChange={(e) =>
                updateHero({
                  ctaPrimary: {
                    ...(config.hero.ctaPrimary || { link: "", style: "primary" }),
                    text: e.target.value,
                  },
                })
              }
              placeholder="Termin anfragen"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ctaLink">Link / Telefon / E-Mail</Label>
            <Input
              id="ctaLink"
              value={config.hero.ctaPrimary?.link || ""}
              onChange={(e) =>
                updateHero({
                  ctaPrimary: {
                    ...(config.hero.ctaPrimary || { text: "Termin anfragen", style: "primary" }),
                    link: e.target.value,
                  },
                })
              }
              placeholder="tel:+49... oder mailto:..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kontakt</CardTitle>
          <CardDescription>
            Kontaktinformationen und Button-Text
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactButton">Kontakt-Button Text</Label>
            <Input
              id="contactButton"
              value={config.contact.buttonText}
              onChange={(e) => updateContact({ buttonText: e.target.value })}
              placeholder="Kontakt aufnehmen"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.contact.showEmail}
                onChange={(e) => updateContact({ showEmail: e.target.checked })}
                className="rounded"
              />
              E-Mail anzeigen
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.contact.showPhone}
                onChange={(e) => updateContact({ showPhone: e.target.checked })}
                className="rounded"
              />
              Telefon anzeigen
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
