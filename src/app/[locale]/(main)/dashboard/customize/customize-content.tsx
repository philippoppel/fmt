"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TierBadge } from "@/components/dashboard/tier-badge";
import { cn } from "@/lib/utils";
import {
  Crown,
  ExternalLink,
  Palette,
  Check,
  Loader2,
  Lock,
} from "lucide-react";
import { THEME_PRESETS, type ThemeName } from "@/types/profile";
import type { AccountType } from "@/types/therapist";
import { updateTheme } from "@/lib/actions/profile-update";

interface CustomizeContentProps {
  hasAccess: boolean;
  accountType: AccountType;
  initialData: {
    themeName: ThemeName;
    themeColor: string;
    headline: string;
    galleryImages: string[];
    specializationRanks: Record<string, number>;
  };
  slug?: string | null;
}

export function CustomizeContent({
  hasAccess,
  accountType,
  initialData,
  slug,
}: CustomizeContentProps) {
  const t = useTranslations("dashboard.customize");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(initialData.themeName);
  const [customColor, setCustomColor] = useState(initialData.themeColor);
  const [headline, setHeadline] = useState(initialData.headline);

  const isPremium = accountType === "premium";

  async function handleSave() {
    if (!hasAccess) return;

    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateTheme({
        themeName: selectedTheme,
        themeColor: customColor,
        headline,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || t("saveError"));
      }
    });
  }

  // Show upgrade prompt for users without access
  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <TierBadge tier={accountType} />
          </div>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4 py-8">
              <div className="p-4 rounded-full bg-amber-100">
                <Lock className="h-8 w-8 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t("locked.title")}</h3>
                <p className="text-muted-foreground max-w-md">
                  {t("locked.description")}
                </p>
              </div>
              <Link href="/dashboard/billing">
                <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  <Crown className="h-4 w-4" />
                  {t("locked.upgrade")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <TierBadge tier={accountType} />
          </div>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        {slug && (
          <Link href={`/therapeuten/${slug}`} target="_blank">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              {t("viewMicrosite")}
            </Button>
          </Link>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-md bg-green-500/10 p-4 text-sm text-green-600 flex items-center gap-2">
          <Check className="h-4 w-4" />
          {t("saved")}
        </div>
      )}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t("theme.title")}
          </CardTitle>
          <CardDescription>{t("theme.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(THEME_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedTheme(key as ThemeName);
                  setCustomColor(preset.primaryColor);
                }}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all hover:scale-105",
                  selectedTheme === key
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/30"
                )}
              >
                {selectedTheme === key && (
                  <div className="absolute -top-2 -right-2 p-1 rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div
                  className="w-full h-12 rounded-md mb-2"
                  style={{
                    background: `linear-gradient(135deg, ${preset.primaryColor} 0%, ${preset.accentColor} 100%)`,
                  }}
                />
                <p className="text-xs font-medium text-center truncate">
                  {preset.label}
                </p>
              </button>
            ))}
          </div>

          {/* Custom Color (Premium only) */}
          {isPremium && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Label htmlFor="customColor">{t("theme.customColor")}</Label>
                <TierBadge tier="premium" size="sm" />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="customColor"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="h-10 w-16 rounded-md border cursor-pointer"
                />
                <Input
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#F97316"
                  className="max-w-32 font-mono text-sm"
                />
                <div
                  className="h-10 w-10 rounded-md border"
                  style={{ backgroundColor: customColor }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Headline */}
      <Card>
        <CardHeader>
          <CardTitle>{t("headline.title")}</CardTitle>
          <CardDescription>{t("headline.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="headline">{t("headline.label")}</Label>
            <Input
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder={t("headline.placeholder")}
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground">
              {headline.length}/120 {t("headline.characters")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("saving")}
            </>
          ) : (
            t("saveChanges")
          )}
        </Button>
      </div>
    </div>
  );
}
