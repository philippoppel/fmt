"use client";

import { useTranslations } from "next-intl";
import { Crown, Sparkles, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { AccountType } from "@/types/therapist";
import { TierBadge } from "./tier-badge";

interface UpgradeBannerProps {
  currentTier: AccountType;
  className?: string;
  variant?: "full" | "compact" | "inline";
}

/**
 * Banner encouraging users to upgrade their subscription
 */
export function UpgradeBanner({
  currentTier,
  className,
  variant = "full",
}: UpgradeBannerProps) {
  const t = useTranslations("dashboard.upgrade");

  // Don't show for premium users
  if (currentTier === "premium") {
    return null;
  }

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-4 rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-3",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <Crown className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium">
            {currentTier === "gratis"
              ? t("gratisMessage")
              : t("mittelMessage")}
          </span>
        </div>
        <Button asChild size="sm" className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
          <Link href="/pricing">
            {t("upgradeButton")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5",
          className
        )}
      >
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">{t("title")}</p>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>
          <Button asChild className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            <Link href="/pricing">
              {t("upgradeButton")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card
      className={cn(
        "overflow-hidden border-amber-500/30",
        className
      )}
    >
      {/* Gradient header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{t("title")}</h3>
            <p className="text-sm text-white/80">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Current tier */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("currentTier")}:</span>
          <TierBadge tier={currentTier} size="sm" />
        </div>

        {/* Benefits list */}
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium">{t("premiumIncludes")}:</p>
          <ul className="space-y-1.5">
            {[
              t("benefits.allFields"),
              t("benefits.threeSpecializations"),
              t("benefits.allThemes"),
              t("benefits.unlimitedImages"),
              t("benefits.videoIntro"),
              t("benefits.therapyStyle"),
              t("benefits.matchingBoost"),
            ].map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Button asChild className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
          <Link href="/pricing">
            <Sparkles className="h-4 w-4" />
            {t("viewPlans")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Gratis account full-page blocker
 */
export function GratisBlocker({ className }: { className?: string }) {
  const t = useTranslations("dashboard.upgrade");

  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-8 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <X className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-xl font-bold">{t("gratisBlockerTitle")}</h3>
      <p className="mb-6 max-w-md text-muted-foreground">
        {t("gratisBlockerDescription")}
      </p>
      <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
        <Link href="/pricing">
          <Crown className="h-5 w-5" />
          {t("choosePlan")}
        </Link>
      </Button>
    </div>
  );
}
