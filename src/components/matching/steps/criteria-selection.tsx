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
    <div className="flex h-full flex-col">
      {/* Header - compact */}
      <div className="mb-3">
        <h2 className="text-base font-semibold sm:text-lg">
          {t("matching.wizard.step2Title")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("matching.wizard.allOptional")}
        </p>
      </div>

      {/* 2x2 Grid on mobile, 2 columns on larger */}
      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Location - full width on mobile */}
        <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <MapPinned className="h-3.5 w-3.5 text-primary" />
            {t("matching.criteria.location")}
          </Label>
          <LocationInput
            value={state.criteria.location}
            onChange={actions.setLocation}
            placeholder={t("matching.criteria.locationPlaceholder")}
          />
        </div>

        {/* Session Type */}
        <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <Video className="h-3.5 w-3.5 text-muted-foreground" />
            {t("matching.criteria.sessionType")}
          </Label>
          <div className="grid grid-cols-2 gap-1.5">
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

        {/* Gender */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            {t("matching.criteria.gender")}
          </Label>
          <div className="flex flex-wrap gap-1">
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

        {/* Insurance */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            {t("matching.criteria.insurance")}
          </Label>
          <div className="grid grid-cols-2 gap-1.5">
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
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background hover:border-primary/50"
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
        "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-input bg-background hover:border-primary/50"
      )}
      aria-pressed={isSelected}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span className="text-xs font-medium">{label}</span>
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
  isSelected,
  onClick,
  label,
}: InsuranceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-input bg-background hover:border-primary/50"
      )}
      aria-pressed={isSelected}
    >
      <div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30"
        )}
      >
        {isSelected && (
          <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none">
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
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
