"use client";

import { useTranslations } from "next-intl";
import { MapPin, User, Video, Building2, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Gender, SessionType, Insurance } from "@/types/therapist";
import { useMatching } from "../matching-context";

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
        <p className="mt-2 text-muted-foreground text-balance">
          {t("matching.wizard.step2Subtitle")}
        </p>
      </div>

      <div className="mx-auto flex-1 max-w-2xl space-y-8">
        {/* Location */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {t("matching.criteria.location")}
          </Label>
          <Input
            type="text"
            placeholder={t("matching.criteria.locationPlaceholder")}
            value={state.criteria.location}
            onChange={(e) => actions.setLocation(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <User className="h-4 w-4 text-muted-foreground" />
            {t("matching.criteria.gender")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {(["female", "male", "diverse", null] as const).map((gender) => (
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

        {/* Session Type */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <Video className="h-4 w-4 text-muted-foreground" />
            {t("matching.criteria.sessionType")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {(["online", "in_person", "both", null] as const).map(
              (sessionType) => (
                <SessionTypeButton
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

        {/* Insurance */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <Shield className="h-4 w-4 text-muted-foreground" />
            {t("matching.criteria.insurance")}
          </Label>
          <div className="flex flex-wrap gap-4">
            {(["public", "private"] as Insurance[]).map((insurance) => (
              <label
                key={insurance}
                className="flex cursor-pointer items-center gap-2"
              >
                <Checkbox
                  checked={state.criteria.insurance.includes(insurance)}
                  onCheckedChange={() => actions.toggleInsurance(insurance)}
                />
                <span className="text-sm">
                  {t(`therapists.filters.insurance.${insurance}`)}
                </span>
              </label>
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
  gender,
  isSelected,
  onClick,
  label,
}: GenderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
      )}
      aria-pressed={isSelected}
    >
      {label}
    </button>
  );
}

interface SessionTypeButtonProps {
  sessionType: SessionType | null;
  isSelected: boolean;
  onClick: () => void;
  label: string;
}

function SessionTypeButton({
  sessionType,
  isSelected,
  onClick,
  label,
}: SessionTypeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
      )}
      aria-pressed={isSelected}
    >
      {sessionType === "online" && <Video className="h-4 w-4" />}
      {sessionType === "in_person" && <Building2 className="h-4 w-4" />}
      {label}
    </button>
  );
}
