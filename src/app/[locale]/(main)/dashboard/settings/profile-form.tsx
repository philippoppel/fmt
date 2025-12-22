"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Loader2, Check, ChevronDown, ChevronUp, Crown, Star } from "lucide-react";
import { updateProfile, type ProfileData } from "@/lib/actions/profile";
import { updateSpecializationRanks } from "@/lib/actions/profile-update";
import {
  SPECIALTIES,
  THERAPY_TYPES,
  LANGUAGES,
  INSURANCE_TYPES,
  SESSION_TYPES,
  AVAILABILITY_OPTIONS,
  GENDER_OPTIONS,
  type SessionType,
  type Availability,
  type Gender,
  type AccountType,
} from "@/types/therapist";
import { useProfilePermissions } from "@/hooks/use-profile-permissions";
import { TierBadge } from "@/components/dashboard/tier-badge";
import { UpgradeBanner, GratisBlocker } from "@/components/dashboard/upgrade-banner";
import { cn } from "@/lib/utils";

type ProfileFormData = ProfileData & {
  specializationRanks?: Record<string, number>;
};

type Props = {
  initialData: ProfileFormData;
  accountType: AccountType;
};

export function ProfileForm({ initialData, accountType }: Props) {
  const t = useTranslations("dashboard.settings");
  const tFilters = useTranslations("therapists.filters");
  const permissions = useProfilePermissions(accountType);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState(initialData.name);
  const [title, setTitle] = useState(initialData.title);
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl);
  const [shortDescription, setShortDescription] = useState(initialData.shortDescription);
  const [city, setCity] = useState(initialData.city);
  const [postalCode, setPostalCode] = useState(initialData.postalCode);
  const [specializations, setSpecializations] = useState<string[]>(
    initialData.specializations.filter((s) => SPECIALTIES.includes(s as typeof SPECIALTIES[number]))
  );
  const [specializationRanks, setSpecializationRanks] = useState<Record<string, number>>(
    initialData.specializationRanks || {}
  );
  const [therapyTypes, setTherapyTypes] = useState<string[]>(initialData.therapyTypes);
  const [languages, setLanguages] = useState<string[]>(initialData.languages);
  const [insurance, setInsurance] = useState<string[]>(initialData.insurance);
  const [pricePerSession, setPricePerSession] = useState(initialData.pricePerSession);
  const [sessionType, setSessionType] = useState<SessionType>(initialData.sessionType);
  const [availability, setAvailability] = useState<Availability>(initialData.availability);
  const [gender, setGender] = useState<Gender | null>(initialData.gender);

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    location: true,
    specializations: true,
    therapyTypes: false,
    languages: false,
    pricing: false,
    availability: false,
  });

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleArrayValue(array: string[], value: string, setter: (arr: string[]) => void) {
    if (array.includes(value)) {
      setter(array.filter((v) => v !== value));
      // Also remove rank when specialty is deselected
      if (array === specializations && specializationRanks[value]) {
        const newRanks = { ...specializationRanks };
        delete newRanks[value];
        setSpecializationRanks(newRanks);
      }
    } else {
      setter([...array, value]);
    }
  }

  function handleRankChange(specialty: string, rank: number | null) {
    const newRanks = { ...specializationRanks };

    if (rank === null) {
      // Remove rank
      delete newRanks[specialty];
    } else {
      // Check if another specialty has this rank and remove it
      for (const key of Object.keys(newRanks)) {
        if (newRanks[key] === rank) {
          delete newRanks[key];
        }
      }
      newRanks[specialty] = rank;
    }

    setSpecializationRanks(newRanks);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateProfile({
        name,
        title,
        imageUrl,
        shortDescription,
        city,
        postalCode,
        specializations,
        therapyTypes,
        languages,
        insurance,
        pricePerSession,
        sessionType,
        availability,
        gender,
      });

      if (result.success) {
        // Also save specialization ranks for premium users
        if (permissions.isPremium && Object.keys(specializationRanks).length > 0) {
          await updateSpecializationRanks({ specializationRanks });
        }

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error);
      }
    });
  }

  // Show blocker for gratis accounts
  if (permissions.isGratis) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <TierBadge tier={accountType} />
          </div>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <GratisBlocker />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <TierBadge tier={accountType} />
        </div>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Upgrade banner for non-premium users */}
      {!permissions.isPremium && (
        <UpgradeBanner currentTier={accountType} variant="inline" />
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-500/10 p-4 text-sm text-green-600 flex items-center gap-2">
          <Check className="h-4 w-4" />
          {t("saved")}
        </div>
      )}

      {/* Basic Info Section */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection("basicInfo")}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t("sections.basicInfo.title")}</CardTitle>
              <CardDescription>{t("sections.basicInfo.description")}</CardDescription>
            </div>
            {openSections.basicInfo ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>
        {openSections.basicInfo && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" required>{t("sections.basicInfo.name")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("sections.basicInfo.namePlaceholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">{t("sections.basicInfo.professionalTitle")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("sections.basicInfo.titlePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">{t("sections.basicInfo.image")}</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDescription">{t("sections.basicInfo.description")}</Label>
              <textarea
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder={t("sections.basicInfo.descriptionPlaceholder")}
                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{(shortDescription || "").length}/500</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Location Section */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection("location")}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t("sections.location.title")}</CardTitle>
              <CardDescription>{t("sections.location.description")}</CardDescription>
            </div>
            {openSections.location ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>
        {openSections.location && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t("sections.location.city")}</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t("sections.location.cityPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">{t("sections.location.postalCode")}</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder={t("sections.location.postalCodePlaceholder")}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Specializations Section */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection("specializations")}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{tFilters("specialty.title")}</CardTitle>
              <CardDescription>{t("sections.specializations.description")}</CardDescription>
            </div>
            {openSections.specializations ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>
        {openSections.specializations && (
          <CardContent className="space-y-6">
            {/* Specialty Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SPECIALTIES.map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2 min-h-[44px]">
                  <Checkbox
                    id={`specialty-${specialty}`}
                    checked={specializations.includes(specialty)}
                    onCheckedChange={() => toggleArrayValue(specializations, specialty, setSpecializations)}
                  />
                  <Label htmlFor={`specialty-${specialty}`} className="font-normal cursor-pointer flex-1">
                    {tFilters(`specialty.${specialty}`)}
                  </Label>
                </div>
              ))}
            </div>

            {/* Ranking Section - Premium Only */}
            {specializations.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <Label className="font-medium">{t("sections.specializations.ranking.title")}</Label>
                  {!permissions.isPremium && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <Crown className="h-3 w-3 text-amber-500" />
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("sections.specializations.ranking.description")}
                </p>

                <div className="space-y-2">
                  {specializations
                    .filter((s) => SPECIALTIES.includes(s as typeof SPECIALTIES[number]))
                    .map((specialty) => {
                    const currentRank = specializationRanks[specialty];
                    return (
                      <div
                        key={specialty}
                        className={cn(
                          "flex items-center justify-between rounded-lg border p-3",
                          !permissions.isPremium && "opacity-60"
                        )}
                      >
                        <span className="text-sm">{tFilters(`specialty.${specialty}`)}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3].map((rank) => (
                            <button
                              key={rank}
                              type="button"
                              disabled={!permissions.isPremium}
                              onClick={() =>
                                handleRankChange(specialty, currentRank === rank ? null : rank)
                              }
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                                currentRank === rank
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted hover:bg-muted/80",
                                !permissions.isPremium && "cursor-not-allowed"
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
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Therapy Types Section */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection("therapyTypes")}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{tFilters("therapyType.title")}</CardTitle>
              <CardDescription>{t("sections.therapyTypes.description")}</CardDescription>
            </div>
            {openSections.therapyTypes ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>
        {openSections.therapyTypes && (
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THERAPY_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2 min-h-[44px]">
                  <Checkbox
                    id={`therapy-${type}`}
                    checked={therapyTypes.includes(type)}
                    onCheckedChange={() => toggleArrayValue(therapyTypes, type, setTherapyTypes)}
                  />
                  <Label htmlFor={`therapy-${type}`} className="font-normal cursor-pointer flex-1">
                    {tFilters(`therapyType.${type}`)}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Languages Section */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection("languages")}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{tFilters("language.title")}</CardTitle>
              <CardDescription>{t("sections.languages.description")}</CardDescription>
            </div>
            {openSections.languages ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>
        {openSections.languages && (
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => (
                <div key={lang} className="flex items-center space-x-2 min-h-[44px]">
                  <Checkbox
                    id={`lang-${lang}`}
                    checked={languages.includes(lang)}
                    onCheckedChange={() => toggleArrayValue(languages, lang, setLanguages)}
                  />
                  <Label htmlFor={`lang-${lang}`} className="font-normal cursor-pointer flex-1">
                    {tFilters(`language.${lang}`)}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Pricing & Insurance Section */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection("pricing")}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t("sections.pricing.title")}</CardTitle>
              <CardDescription>{t("sections.pricing.description")}</CardDescription>
            </div>
            {openSections.pricing ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>
        {openSections.pricing && (
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>{t("sections.pricing.pricePerSession")}</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[pricePerSession]}
                  onValueChange={(val) => setPricePerSession(val[0])}
                  max={300}
                  step={5}
                  className="flex-1"
                />
                <span className="w-20 text-right font-medium">{pricePerSession} €</span>
              </div>
            </div>
            <div className="space-y-3">
              <Label>{tFilters("insurance.title")}</Label>
              <div className="flex gap-4">
                {INSURANCE_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`insurance-${type}`}
                      checked={insurance.includes(type)}
                      onCheckedChange={() => toggleArrayValue(insurance, type, setInsurance)}
                    />
                    <Label htmlFor={`insurance-${type}`} className="font-normal cursor-pointer">
                      {tFilters(`insurance.${type}`)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Availability Section */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection("availability")}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t("sections.availability.title")}</CardTitle>
              <CardDescription>{t("sections.availability.description")}</CardDescription>
            </div>
            {openSections.availability ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>
        {openSections.availability && (
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>{tFilters("sessionType.title")}</Label>
              <RadioGroup
                value={sessionType}
                onValueChange={(val) => setSessionType(val as SessionType)}
                className="flex flex-wrap gap-4"
              >
                {SESSION_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={`session-${type}`} />
                    <Label htmlFor={`session-${type}`} className="font-normal cursor-pointer">
                      {tFilters(`sessionType.${type}`)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label>{tFilters("availability.title")}</Label>
              <RadioGroup
                value={availability}
                onValueChange={(val) => setAvailability(val as Availability)}
                className="flex flex-wrap gap-4"
              >
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt} id={`avail-${opt}`} />
                    <Label htmlFor={`avail-${opt}`} className="font-normal cursor-pointer">
                      {tFilters(`availability.${opt}`)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label>{tFilters("gender.title")}</Label>
              <RadioGroup
                value={gender || ""}
                onValueChange={(val) => setGender(val as Gender)}
                className="flex flex-wrap gap-4"
              >
                {GENDER_OPTIONS.map((g) => (
                  <div key={g} className="flex items-center space-x-2">
                    <RadioGroupItem value={g} id={`gender-${g}`} />
                    <Label htmlFor={`gender-${g}`} className="font-normal cursor-pointer">
                      {tFilters(`gender.${g}`)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isPending}>
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
    </form>
  );
}
