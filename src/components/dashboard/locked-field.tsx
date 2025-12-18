"use client";

import { useTranslations } from "next-intl";
import { Lock, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/types/therapist";
import { Link } from "@/i18n/navigation";

interface LockedFieldProps {
  /** The content to show (disabled/grayed out) */
  children: React.ReactNode;
  /** Whether this field is locked */
  isLocked: boolean;
  /** The minimum tier required to unlock */
  requiredTier: AccountType;
  /** Optional label for the field */
  fieldLabel?: string;
  /** Additional className */
  className?: string;
}

/**
 * Wrapper component that shows a lock overlay on fields that require upgrade
 */
export function LockedField({
  children,
  isLocked,
  requiredTier,
  fieldLabel,
  className,
}: LockedFieldProps) {
  const t = useTranslations("dashboard");

  if (!isLocked) {
    return <>{children}</>;
  }

  const tierLabel = requiredTier === "premium" ? "Premium" : "Basis";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("relative", className)}>
            {/* Grayed out content */}
            <div className="pointer-events-none select-none opacity-50 blur-[1px]">
              {children}
            </div>

            {/* Lock overlay */}
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-muted/80 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {t("lockedField.requiresTier", { tier: tierLabel })}
                </span>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">
              {fieldLabel
                ? t("lockedField.featureLockedWithLabel", { label: fieldLabel })
                : t("lockedField.featureLocked")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("lockedField.upgradeToUnlock", { tier: tierLabel })}
            </p>
            <Button asChild size="sm" className="mt-2 w-full gap-1.5">
              <Link href="/pricing">
                <Sparkles className="h-3.5 w-3.5" />
                {t("lockedField.upgradeNow")}
              </Link>
            </Button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Simple lock icon with tooltip for inline use
 */
export function LockIcon({
  requiredTier,
  className,
}: {
  requiredTier: AccountType;
  className?: string;
}) {
  const t = useTranslations("dashboard");
  const tierLabel = requiredTier === "premium" ? "Premium" : "Basis";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-muted p-1",
              className
            )}
          >
            <Lock className="h-3 w-3 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("lockedField.requiresTier", { tier: tierLabel })}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Premium feature badge
 */
export function PremiumFeatureBadge({ className }: { className?: string }) {
  const t = useTranslations("dashboard");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-600/20 px-2 py-0.5 text-xs font-medium text-amber-600",
        className
      )}
    >
      <Crown className="h-3 w-3" />
      {t("premiumFeature")}
    </span>
  );
}
