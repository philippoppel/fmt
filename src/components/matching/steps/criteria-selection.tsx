"use client";

import { useTranslations } from "next-intl";
import {
  User,
  Video,
  Building2,
  Shield,
  Laptop,
  MapPinned,
  Heart,
  Users,
  Sparkles,
  CreditCard,
  Wallet,
  Globe,
  BookOpen,
  Check,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Gender, SessionType, Insurance, Language, TherapyType } from "@/types/therapist";
import { LANGUAGES, THERAPY_TYPES } from "@/types/therapist";
import { useMatching } from "../matching-context";
import { LocationInput } from "./location-input";

export function CriteriaSelection() {
  const t = useTranslations();
  const { state, actions } = useMatching();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold sm:text-2xl">
          {t("matching.wizard.step2Title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("matching.wizard.allOptional")}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-8">
        {/* Location */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <MapPinned className="h-4 w-4 text-primary" />
            </div>
            {t("matching.criteria.location")}
          </Label>
          <LocationInput
            value={state.criteria.location}
            onChange={actions.setLocation}
            placeholder={t("matching.criteria.locationPlaceholder")}
          />
        </div>

        {/* Session Type */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
              <Video className="h-4 w-4 text-blue-600" />
            </div>
            {t("matching.criteria.sessionType")}
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {(["online", "in_person", null] as const).map(
              (sessionType) => (
                <SessionTypeCard
                  key={sessionType ?? "any"}
                  sessionType={sessionType}
                  isSelected={state.criteria.sessionType === sessionType}
                  onClick={() => actions.setSessionType(sessionType)}
                  label={
                    sessionType
                      ? t(`therapists.filters.sessionType.${sessionType}`)
                      : t("matching.criteria.anySessionType")
                  }
                />
              )
            )}
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/10">
              <Users className="h-4 w-4 text-pink-600" />
            </div>
            {t("matching.criteria.gender")}
          </Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([null, "female", "male", "diverse"] as const).map((gender) => (
              <GenderCard
                key={gender ?? "any"}
                gender={gender}
                isSelected={state.criteria.gender === gender}
                onClick={() => actions.setGender(gender)}
                label={
                  gender
                    ? t(`therapists.filters.gender.${gender}`)
                    : t("matching.criteria.anyGender")
                }
              />
            ))}
          </div>
        </div>

        {/* Insurance */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
              <Shield className="h-4 w-4 text-emerald-600" />
            </div>
            {t("matching.criteria.insurance")}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {(["public", "private"] as Insurance[]).map((insurance) => (
              <InsuranceCard
                key={insurance}
                insurance={insurance}
                isSelected={state.criteria.insurance.includes(insurance)}
                onClick={() => actions.toggleInsurance(insurance)}
                label={t(`therapists.filters.insurance.${insurance}`)}
              />
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10">
              <Globe className="h-4 w-4 text-violet-600" />
            </div>
            {t("matching.criteria.language")}
          </Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LANGUAGES.map((language) => (
              <LanguageCard
                key={language}
                language={language}
                isSelected={state.criteria.languages.includes(language)}
                onClick={() => actions.toggleLanguage(language)}
                label={t(`therapists.languages.${language}`)}
              />
            ))}
          </div>
        </div>

        {/* Therapy Type */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10">
              <BookOpen className="h-4 w-4 text-orange-600" />
            </div>
            {t("matching.criteria.therapyType")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {THERAPY_TYPES.map((type) => (
              <TherapyTypeChip
                key={type}
                type={type}
                isSelected={state.criteria.therapyTypes.includes(type)}
                onClick={() => actions.toggleTherapyType(type)}
                label={t(`therapists.therapyTypes.${type}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface GenderCardProps {
  gender: Gender | null;
  isSelected: boolean;
  onClick: () => void;
  label: string;
}

function GenderCard({
  gender,
  isSelected,
  onClick,
  label,
}: GenderCardProps) {
  const Icon = gender === "female"
    ? Heart
    : gender === "male"
      ? User
      : gender === "diverse"
        ? Sparkles
        : Users;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/10 shadow-md"
          : "border-input bg-background hover:border-primary/50 hover:bg-muted/50"
      )}
      aria-pressed={isSelected}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className={cn(
        "text-sm font-medium",
        isSelected ? "text-primary" : "text-foreground"
      )}>
        {label}
      </span>
    </button>
  );
}

interface SessionTypeCardProps {
  sessionType: SessionType | null;
  isSelected: boolean;
  onClick: () => void;
  label: string;
}

function SessionTypeCard({
  sessionType,
  isSelected,
  onClick,
  label,
}: SessionTypeCardProps) {
  const Icon = sessionType === "online"
    ? Laptop
    : sessionType === "in_person"
      ? Building2
      : Sparkles;

  const iconBgColor = sessionType === "online"
    ? "bg-blue-500"
    : sessionType === "in_person"
      ? "bg-amber-500"
      : "bg-primary";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/10 shadow-md"
          : "border-input bg-background hover:border-primary/50 hover:bg-muted/50"
      )}
      aria-pressed={isSelected}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
          isSelected
            ? `${iconBgColor} text-white`
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <span className={cn(
        "text-sm font-medium",
        isSelected ? "text-primary" : "text-foreground"
      )}>
        {label}
      </span>
    </button>
  );
}

interface InsuranceCardProps {
  insurance: Insurance;
  isSelected: boolean;
  onClick: () => void;
  label: string;
}

function InsuranceCard({
  insurance,
  isSelected,
  onClick,
  label,
}: InsuranceCardProps) {
  const Icon = insurance === "public" ? Wallet : CreditCard;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-emerald-500 bg-emerald-500/10 shadow-md"
          : "border-input bg-background hover:border-emerald-500/50 hover:bg-muted/50"
      )}
      aria-pressed={isSelected}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
          isSelected
            ? "bg-emerald-500 text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <span className={cn(
        "text-sm font-medium",
        isSelected ? "text-emerald-600" : "text-foreground"
      )}>
        {label}
      </span>
      {isSelected && (
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6L5 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
}

interface LanguageCardProps {
  language: Language;
  isSelected: boolean;
  onClick: () => void;
  label: string;
}

function LanguageCard({
  language,
  isSelected,
  onClick,
  label,
}: LanguageCardProps) {
  // Language flag emojis
  const flagEmoji: Record<Language, string> = {
    de: "🇩🇪",
    en: "🇬🇧",
    tr: "🇹🇷",
    ar: "🇸🇦",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-violet-500 bg-violet-500/10 shadow-md"
          : "border-input bg-background hover:border-violet-500/50 hover:bg-muted/50"
      )}
      aria-pressed={isSelected}
    >
      <span className="text-2xl">{flagEmoji[language]}</span>
      <span className={cn(
        "text-sm font-medium",
        isSelected ? "text-violet-600" : "text-foreground"
      )}>
        {label}
      </span>
      {isSelected && (
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white">
          <Check className="h-3 w-3" />
        </div>
      )}
    </button>
  );
}

interface TherapyTypeChipProps {
  type: TherapyType;
  isSelected: boolean;
  onClick: () => void;
  label: string;
}

function TherapyTypeChip({
  type,
  isSelected,
  onClick,
  label,
}: TherapyTypeChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-orange-500 bg-orange-500/10 text-orange-600"
          : "border-input bg-background text-foreground hover:border-orange-500/50 hover:bg-muted/50"
      )}
      aria-pressed={isSelected}
    >
      {isSelected && <Check className="h-4 w-4" />}
      {label}
    </button>
  );
}
