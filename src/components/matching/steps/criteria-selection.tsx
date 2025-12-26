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
  Users2,
  Sparkles,
  CreditCard,
  Wallet,
  Globe,
  BookOpen,
  Check,
  Clock,
  Calendar,
  CalendarCheck,
  Euro,
  Briefcase,
  UserCircle,
  Scale,
  Pencil,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Gender, SessionType, Insurance, TherapyType, TherapySetting, Availability } from "@/types/therapist";
import { THERAPY_TYPES, THERAPY_SETTINGS, AVAILABILITY_OPTIONS } from "@/types/therapist";
import { useMatching, type WizardStep } from "../matching-context";
import { LocationHero } from "./location-hero";
import { MATCHING_TOPICS, getSubTopicsForTopics } from "@/lib/matching/topics";
import { AvailableLanguageSelect } from "@/components/ui/available-language-select";

interface CriteriaSelectionProps {
  onNavigateToStep?: (step: WizardStep) => void;
}

export function CriteriaSelection({ onNavigateToStep }: CriteriaSelectionProps) {
  const t = useTranslations();
  const { state, actions } = useMatching();

  // Get selected topic and subtopic details
  const selectedTopicDetails = MATCHING_TOPICS.filter((topic) =>
    state.selectedTopics.includes(topic.id)
  );
  const allSubTopics = getSubTopicsForTopics(state.selectedTopics);
  const selectedSubTopicDetails = allSubTopics.filter((st) =>
    state.selectedSubTopics.includes(st.id)
  );

  const handleEditStep = (step: WizardStep) => {
    if (onNavigateToStep) {
      onNavigateToStep(step);
    } else {
      actions.setStep(step);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold sm:text-2xl">
          {t("matching.wizard.step2Title")}
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-6">
        {/* Your Selections Summary - Editable */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Topics Card */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{t("matching.summary.yourTopics")}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditStep(1)}
                className="h-7 gap-1 px-2"
              >
                <Pencil className="h-3 w-3" />
                {t("matching.summary.edit")}
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedTopicDetails.map((topic) => (
                <span
                  key={topic.id}
                  className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {t(`matching.topics.${topic.id}`)}
                </span>
              ))}
              {selectedTopicDetails.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  {t("matching.summary.noTopicsSelected")}
                </span>
              )}
            </div>
          </div>

          {/* SubTopics Card */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{t("matching.summary.yourDetails")}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditStep(1.25)}
                className="h-7 gap-1 px-2"
                disabled={allSubTopics.length === 0}
              >
                <Pencil className="h-3 w-3" />
                {t("matching.summary.edit")}
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedSubTopicDetails.length > 0 ? (
                selectedSubTopicDetails.map((st) => (
                  <span
                    key={st.id}
                    className="rounded-full bg-accent/50 px-2.5 py-0.5 text-xs font-medium"
                  >
                    {t(`matching.subtopics.${st.id}`)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  {allSubTopics.length > 0
                    ? t("matching.summary.noDetailsSelected")
                    : t("matching.summary.noDetailsAvailable")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-sm text-muted-foreground">
              {t("matching.criteria.yourPreferences")}
            </span>
          </div>
        </div>
        {/* Location Hero - Prominent */}
        <LocationHero
          location={state.criteria.location}
          onLocationChange={actions.setLocation}
          selectedTopics={state.selectedTopics}
          selectedSubTopics={state.selectedSubTopics}
        />

        {/* Divider - Additional Preferences */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-sm text-muted-foreground">
              {t("matching.criteria.additionalPreferences")}
            </span>
          </div>
        </div>

        {/* Session Type */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue-muted">
              <Video className="h-4 w-4 text-accent-blue" />
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-pink-muted">
              <Users className="h-4 w-4 text-accent-pink" />
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

        {/* Therapy Setting (Individual, Group, Couples, Corporate) */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-pink-muted">
              <Users2 className="h-4 w-4 text-accent-pink" />
            </div>
            {t("matching.criteria.therapySetting")}
          </Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {THERAPY_SETTINGS.map((setting) => (
              <TherapySettingCard
                key={setting}
                setting={setting}
                isSelected={state.criteria.therapySettings.includes(setting)}
                onClick={() => actions.toggleTherapySetting(setting)}
                label={t(`matching.criteria.therapySettings.${setting}`)}
              />
            ))}
          </div>
        </div>

        {/* Insurance */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-emerald-muted">
              <Shield className="h-4 w-4 text-accent-emerald" />
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-violet-muted">
              <Globe className="h-4 w-4 text-accent-violet" />
            </div>
            {t("matching.criteria.language")}
          </Label>
          <AvailableLanguageSelect
            selected={state.criteria.languages}
            onChange={actions.setLanguages}
            placeholder={t("matching.criteria.selectLanguages")}
          />
        </div>

        {/* Therapy Type */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-orange-muted">
              <BookOpen className="h-4 w-4 text-accent-orange" />
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

        {/* Availability */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-teal-muted">
              <Clock className="h-4 w-4 text-accent-teal" />
            </div>
            {t("matching.criteria.availability")}
          </Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([null, ...AVAILABILITY_OPTIONS] as const).map((availability) => (
              <AvailabilityCard
                key={availability ?? "any"}
                availability={availability}
                isSelected={state.criteria.availability === availability}
                onClick={() => actions.setAvailability(availability)}
                label={
                  availability
                    ? t(`therapists.availability.${availability}`)
                    : t("matching.criteria.anyAvailability")
                }
              />
            ))}
          </div>
        </div>

        {/* Max Price */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-amber-muted">
              <Euro className="h-4 w-4 text-accent-amber" />
            </div>
            {t("matching.criteria.maxPrice")}
          </Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([null, 80, 120, 150] as const).map((price) => (
              <PriceCard
                key={price ?? "any"}
                price={price}
                isSelected={state.criteria.maxPrice === price}
                onClick={() => actions.setMaxPrice(price)}
                label={
                  price
                    ? t("matching.criteria.upToPrice", { price })
                    : t("matching.criteria.anyPrice")
                }
              />
            ))}
          </div>
        </div>

        {/* Transparency Section */}
        <div className="space-y-3 mt-2">
          {/* Sorting Explanation */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Scale className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-primary">
                  {t("matching.summary.howWeSort")}
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("matching.summary.sortingExplanation")}
                </p>
              </div>
            </div>
          </div>

          {/* Fairness Note */}
          <div className="rounded-lg border border-accent-emerald/30 bg-accent-emerald/5 p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-accent-emerald mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-accent-emerald">
                  {t("matching.summary.fairnessTitle")}
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("matching.summary.fairnessNote")}
                </p>
              </div>
            </div>
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
    ? "bg-accent-blue"
    : sessionType === "in_person"
      ? "bg-accent-amber"
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
          ? "border-accent-emerald bg-accent-emerald-muted shadow-md"
          : "border-input bg-background hover:border-accent-emerald/50 hover:bg-muted/50"
      )}
      aria-pressed={isSelected}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
          isSelected
            ? "bg-accent-emerald text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <span className={cn(
        "text-sm font-medium",
        isSelected ? "text-accent-emerald-foreground" : "text-foreground"
      )}>
        {label}
      </span>
      {isSelected && (
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-emerald text-white">
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
          ? "border-accent-orange bg-accent-orange-muted text-accent-orange-foreground"
          : "border-input bg-background text-foreground hover:border-accent-orange/50 hover:bg-muted/50"
      )}
      aria-pressed={isSelected}
    >
      {isSelected && <Check className="h-4 w-4" />}
      {label}
    </button>
  );
}

interface AvailabilityCardProps {
  availability: Availability | null;
  isSelected: boolean;
  onClick: () => void;
  label: string;
}

function AvailabilityCard({
  availability,
  isSelected,
  onClick,
  label,
}: AvailabilityCardProps) {
  const Icon = availability === "immediately"
    ? Clock
    : availability === "this_week"
      ? Calendar
      : availability === "flexible"
        ? CalendarCheck
        : Sparkles;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-accent-teal bg-accent-teal/15 shadow-md"
          : "border-input bg-background hover:border-accent-teal/50 hover:bg-muted/50"
      )}
      aria-pressed={isSelected}
    >
      {isSelected && (
        <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-teal text-white shadow-sm">
          <Check className="h-3 w-3" strokeWidth={3} />
        </div>
      )}
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          isSelected
            ? "bg-accent-teal text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className={cn(
        "text-xs font-medium text-center",
        isSelected ? "text-accent-teal-foreground font-semibold" : "text-foreground"
      )}>
        {label}
      </span>
    </button>
  );
}

interface PriceCardProps {
  price: number | null;
  isSelected: boolean;
  onClick: () => void;
  label: string;
}

function PriceCard({
  price,
  isSelected,
  onClick,
  label,
}: PriceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-accent-amber bg-accent-amber/15 shadow-md"
          : "border-input bg-background hover:border-accent-amber/50 hover:bg-muted/50"
      )}
      aria-pressed={isSelected}
    >
      {isSelected && (
        <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-amber text-white shadow-sm">
          <Check className="h-3 w-3" strokeWidth={3} />
        </div>
      )}
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          isSelected
            ? "bg-accent-amber text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        {price ? (
          <span className="text-xs font-bold">{price}€</span>
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>
      <span className={cn(
        "text-xs font-medium text-center",
        isSelected ? "text-accent-amber-foreground font-semibold" : "text-foreground"
      )}>
        {label}
      </span>
    </button>
  );
}

interface TherapySettingCardProps {
  setting: TherapySetting;
  isSelected: boolean;
  onClick: () => void;
  label: string;
}

function TherapySettingCard({
  setting,
  isSelected,
  onClick,
  label,
}: TherapySettingCardProps) {
  const Icon = setting === "individual"
    ? UserCircle
    : setting === "group"
      ? Users2
      : setting === "couples"
        ? Heart
        : Briefcase;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-accent-pink bg-accent-pink/15 shadow-md"
          : "border-input bg-background hover:border-accent-pink/50 hover:bg-muted/50"
      )}
      aria-pressed={isSelected}
    >
      {isSelected && (
        <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-pink text-white shadow-sm">
          <Check className="h-3 w-3" strokeWidth={3} />
        </div>
      )}
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          isSelected
            ? "bg-accent-pink text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className={cn(
        "text-xs font-medium text-center",
        isSelected ? "text-accent-pink-foreground font-semibold" : "text-foreground"
      )}>
        {label}
      </span>
    </button>
  );
}
