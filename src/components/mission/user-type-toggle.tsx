"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Users, Heart } from "lucide-react";

export type UserType = "seeker" | "therapist";

interface UserTypeToggleProps {
  value: UserType;
  onChange: (value: UserType) => void;
}

export function UserTypeToggle({ value, onChange }: UserTypeToggleProps) {
  const t = useTranslations("mission.seeker.toggle");

  return (
    <div className="flex justify-center">
      <div className="relative inline-flex items-center bg-muted/50 backdrop-blur-sm rounded-full p-1 border border-border/50">
        {/* Active indicator */}
        <div
          className={cn(
            "absolute h-[calc(100%-8px)] rounded-full bg-background shadow-lg transition-all duration-300 ease-out",
            value === "seeker"
              ? "left-1 w-[calc(50%-2px)]"
              : "left-[calc(50%+2px)] w-[calc(50%-2px)]"
          )}
        />

        {/* Seeker button */}
        <button
          onClick={() => onChange("seeker")}
          className={cn(
            "relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors duration-200",
            value === "seeker"
              ? "text-trust"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              value === "seeker" && "scale-110"
            )}
          />
          <span className="hidden sm:inline">{t("seeker")}</span>
          <span className="sm:hidden">Therapie suchen</span>
        </button>

        {/* Therapist button */}
        <button
          onClick={() => onChange("therapist")}
          className={cn(
            "relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors duration-200",
            value === "therapist"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              value === "therapist" && "scale-110"
            )}
          />
          <span className="hidden sm:inline">{t("therapist")}</span>
          <span className="sm:hidden">Therapeut:in</span>
        </button>
      </div>
    </div>
  );
}
