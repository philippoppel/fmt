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
  Star,
  GripVertical,
} from "lucide-react";
import { THEME_PRESETS, type ThemeName } from "@/types/profile";
import type { AccountType } from "@/types/therapist";
import { updateTheme, updateSpecializationRanks } from "@/lib/actions/profile-update";

interface CustomizeContentProps {
  hasAccess: boolean;
  accountType: AccountType;
  initialData: {
    themeName: ThemeName;
    themeColor: string;
    headline: string;
    galleryImages: string[];
    specializations: string[];
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
  const [specializationRanks, setSpecializationRanks] = useState<Record<string, number>>(
    initialData.specializationRanks
  );
  const [rankSuccess, setRankSuccess] = useState(false);
  const [rankError, setRankError] = useState<string | null>(null);
  const [isRankPending, startRankTransition] = useTransition();

  const isPremium = accountType === "premium";

  // Specialty labels for display
  const specialtyLabels: Record<string, string> = {
    depression: "Depression",
    anxiety: "Angststörungen",
    trauma: "Trauma & PTBS",
    relationships: "Beziehungen",
    addiction: "Sucht",
    eating_disorders: "Essstörungen",
    adhd: "ADHS",
    burnout: "Burnout",
  };

  // Get user's specializations with labels
  const userSpecializations = initialData.specializations.map((key) => ({
    key,
    label: specialtyLabels[key] || key,
  }));

  // Handle adding/removing a rank
  function handleRankChange(specKey: string, rank: number | null) {
    setSpecializationRanks((prev) => {
      const newRanks = { ...prev };
      if (rank === null) {
        delete newRanks[specKey];
      } else {
        // Remove any existing specialization with this rank
        Object.keys(newRanks).forEach((key) => {
          if (newRanks[key] === rank) {
            delete newRanks[key];
          }
        });
        newRanks[specKey] = rank;
      }
      return newRanks;
    });
  }

  // Save specialization ranks
  async function handleSaveRanks() {
    if (!isPremium) return;

    setRankError(null);
    setRankSuccess(false);

    startRankTransition(async () => {
      const result = await updateSpecializationRanks({ specializationRanks });

      if (result.success) {
        setRankSuccess(true);
        setTimeout(() => setRankSuccess(false), 3000);
      } else {
        setRankError(result.error || t("saveError"));
      }
    });
  }

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
          <Link href={`/p/${slug}`} target="_blank">
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

      {/* Specialization Ranking - Premium Only */}
      <Card className={cn(!isPremium && "opacity-60")}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              {t("ranking.title")}
            </CardTitle>
            <TierBadge tier="premium" size="sm" />
          </div>
          <CardDescription>{t("ranking.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isPremium ? (
            <div className="space-y-4">
              {/* Success/Error Messages */}
              {rankSuccess && (
                <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {t("saved")}
                </div>
              )}
              {rankError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {rankError}
                </div>
              )}

              {userSpecializations.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("ranking.noSpecializations")}</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("ranking.hint")}
                  </p>
                  <div className="space-y-2">
                    {userSpecializations.map((spec) => {
                      const currentRank = specializationRanks[spec.key];
                      return (
                        <div
                          key={spec.key}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 text-sm font-medium">{spec.label}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3].map((rank) => (
                              <button
                                key={rank}
                                onClick={() =>
                                  handleRankChange(spec.key, currentRank === rank ? null : rank)
                                }
                                className={cn(
                                  "w-8 h-8 rounded-full text-xs font-bold transition-all",
                                  currentRank === rank
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted-foreground/20 text-muted-foreground"
                                )}
                              >
                                {rank}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Show current ranking */}
                  {Object.keys(specializationRanks).length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">{t("ranking.current")}</p>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3].map((rank) => {
                          const specKey = Object.keys(specializationRanks).find(
                            (k) => specializationRanks[k] === rank
                          );
                          const spec = userSpecializations.find((s) => s.key === specKey);
                          if (!spec) return null;
                          return (
                            <div
                              key={rank}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                            >
                              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                                {rank}
                              </span>
                              {spec.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleSaveRanks}
                      variant="outline"
                      size="sm"
                      disabled={isRankPending}
                    >
                      {isRankPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("saving")}
                        </>
                      ) : (
                        t("ranking.save")
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Crown className="h-4 w-4 text-amber-500" />
              {t("ranking.premiumOnly")}
            </div>
          )}
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
