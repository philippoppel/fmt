"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/types/therapist";

interface TierBadgeProps {
  tier: AccountType;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const tierConfig: Record<
  AccountType,
  {
    icon: typeof Crown;
    className: string;
    gradient: string;
  }
> = {
  gratis: {
    icon: User,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
    gradient: "",
  },
  mittel: {
    icon: Star,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    gradient: "from-blue-500 to-blue-600",
  },
  premium: {
    icon: Crown,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    gradient: "from-amber-400 to-amber-600",
  },
};

const sizeConfig = {
  sm: {
    badge: "px-2 py-0.5 text-xs",
    icon: "h-3 w-3",
  },
  md: {
    badge: "px-3 py-1 text-sm",
    icon: "h-4 w-4",
  },
  lg: {
    badge: "px-4 py-1.5 text-base",
    icon: "h-5 w-5",
  },
};

export function TierBadge({
  tier,
  size = "md",
  showIcon = true,
  className,
}: TierBadgeProps) {
  const t = useTranslations("pricing.tiers");

  const config = tierConfig[tier];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  const label = tier === "gratis" ? t("gratis") : tier === "mittel" ? t("mittel") : t("premium");

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        config.className,
        sizes.badge,
        className
      )}
    >
      {showIcon && <Icon className={sizes.icon} />}
      {label}
    </Badge>
  );
}

/**
 * Premium badge with gradient effect
 */
export function PremiumBadge({ className }: { className?: string }) {
  const t = useTranslations("pricing.tiers");

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0 font-semibold shadow-lg shadow-amber-500/25",
        className
      )}
    >
      <Crown className="h-4 w-4" />
      {t("premium")}
    </Badge>
  );
}
