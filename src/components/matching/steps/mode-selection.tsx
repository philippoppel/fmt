"use client";

import { useTranslations } from "next-intl";
import { Zap, Sparkles, Clock, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMatching, type MatchingMode } from "../matching-context";

export function ModeSelection() {
  const t = useTranslations();
  const { actions } = useMatching();

  const handleSelectMode = (mode: MatchingMode) => {
    actions.setMode(mode);
    if (mode === "quick") {
      // Quick mode goes directly to a simplified flow (handled by parent)
      actions.setStep(1);
    } else {
      // Full mode goes to freetext analysis
      actions.setStep(0.75);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t("matching.modeSelection.title")}</h2>
        <p className="mt-2 text-muted-foreground">
          {t("matching.modeSelection.subtitle")}
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {/* Quick Mode */}
        <Card
          className={cn(
            "group cursor-pointer border-2 p-6 transition-all hover:border-amber-500 hover:shadow-lg"
          )}
          onClick={() => handleSelectMode("quick")}
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 transition-transform group-hover:scale-110">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">{t("matching.modeSelection.quick.title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("matching.modeSelection.quick.description")}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{t("matching.modeSelection.quick.time")}</span>
            </div>
          </div>
        </Card>

        {/* Full Mode */}
        <Card
          className={cn(
            "group cursor-pointer border-2 p-6 transition-all hover:border-primary hover:shadow-lg"
          )}
          onClick={() => handleSelectMode("full")}
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <Target className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">{t("matching.modeSelection.full.title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("matching.modeSelection.full.description")}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>{t("matching.modeSelection.full.benefit")}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
