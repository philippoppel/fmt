"use client";

import { useTranslations } from "next-intl";
import { User, Video, Building2, Shield, Laptop, MapPinned } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Gender, SessionType, Insurance } from "@/types/therapist";
import { useMatching } from "../matching-context";
import { LocationInput } from "./location-input";

export function CriteriaSelection() {
  const t = useTranslations();
  const { state, actions } = useMatching();

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("matching.wizard.step2Title")}
        </h2>
        <p className="mt-2 text-balance text-muted-foreground">
          {t("matching.wizard.step2Subtitle")}
        </p>
      </div>

      <div className="mx-auto max-w-2xl flex-1 space-y-8">
        {/* Location - Primary with smart input */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <MapPinned className="h-4 w-4 text-primary" />
            {t("matching.criteria.location")}
          </Label>
          <LocationInput
            value={state.criteria.location}
            onChange={actions.setLocation}
            placeholder={t("matching.criteria.locationPlaceholder")}
          />
          <p className="text-xs text-muted-foreground">
            {t("matching.location.hint")}
          </p>
        </div>

        {/* Session Type - Visual cards */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <Video className="h-4 w-4 text-muted-foreground" />
            {t("matching.criteria.sessionType")}
          </Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["online", "in_person", "both", null] as const).map(
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

        {/* Gender - Pill buttons */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <User className="h-4 w-4 text-muted-foreground" />
            {t("matching.criteria.gender")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {([null, "female", "male", "diverse"] as const).map((gender) => (
              <GenderButton
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

        {/* Insurance - Checkbox cards */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <Shield className="h-4 w-4 text-muted-foreground" />
            {t("matching.criteria.insurance")}
          </Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
      </div>

      {/* Optional hint */}
      <p className="mt-auto text-center text-sm text-muted-foreground">
        {t("matching.wizard.allOptional")}
      </p>
    </div>
  );
}

interface GenderButtonProps {
  gender: Gender | null;
  isSelected: boolean;
  onClick: () => void;
  label: string;
}

function GenderButton({
  isSelected,
  onClick,
  label,
}: GenderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-input bg-background hover:border-primary/50 hover:bg-accent"
      )}
      aria-pressed={isSelected}
    >
      {label}
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
      : sessionType === "both"
        ? Video
        : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
          : "border-input bg-background hover:border-primary/50 hover:bg-muted/50"
      )}
      aria-pressed={isSelected}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-5 w-5 transition-colors",
            isSelected ? "text-primary" : "text-muted-foreground"
          )}
        />
      )}
      <span className={cn("text-sm font-medium", isSelected && "text-primary")}>
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
          : "border-input bg-background hover:border-primary/50 hover:bg-muted/50"
      )}
      aria-pressed={isSelected}
    >
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30"
        )}
      >
        {isSelected && (
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6L5 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <span className={cn("font-medium", isSelected && "text-primary")}>
          {label}
        </span>
      </div>
    </button>
  );
}
