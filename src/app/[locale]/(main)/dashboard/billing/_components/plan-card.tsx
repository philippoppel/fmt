"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, User, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscriptionStatusResult } from "@/lib/actions/subscription";
import { reactivateCurrentSubscription } from "@/lib/actions/subscription";

interface PlanCardProps {
  subscription: SubscriptionStatusResult;
  onUpgrade: () => void;
  onCancel: () => void;
  onReload: () => void;
}

const TIER_ICONS = {
  gratis: User,
  mittel: Star,
  premium: Crown,
};

const TIER_COLORS = {
  gratis: "bg-muted text-muted-foreground",
  mittel: "bg-blue-100 text-blue-700",
  premium: "bg-amber-100 text-amber-700",
};

export function PlanCard({ subscription, onUpgrade, onCancel, onReload }: PlanCardProps) {
  const t = useTranslations("dashboard.billing");
  const [isPending, startTransition] = useTransition();

  const Icon = TIER_ICONS[subscription.accountType];
  const colorClass = TIER_COLORS[subscription.accountType];

  const handleReactivate = () => {
    startTransition(async () => {
      const result = await reactivateCurrentSubscription();
      if (result.success) {
        onReload();
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
      {/* Plan Info */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("p-3 rounded-full", colorClass)}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{subscription.plan.name}</h3>
            <p className="text-2xl font-bold">
              {subscription.plan.price === 0
                ? t("free")
                : `${(subscription.plan.price / 100).toFixed(0)}€`}
              <span className="text-sm font-normal text-muted-foreground">
                {subscription.plan.price > 0 && `/${t("perMonth")}`}
              </span>
            </p>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-2">
          {subscription.plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Billing Info */}
        {subscription.nextBillingDate && !subscription.isCanceled && (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("nextBilling", {
              date: new Date(subscription.nextBillingDate).toLocaleDateString("de-AT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            })}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 lg:w-48">
        {subscription.accountType !== "premium" && (
          <Button onClick={onUpgrade} className="w-full">
            {subscription.accountType === "gratis" ? t("upgrade") : t("upgradeToPremium")}
          </Button>
        )}

        {subscription.isCanceled && subscription.subscriptionEndsAt && (
          <Button
            variant="outline"
            onClick={handleReactivate}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {t("reactivate")}
          </Button>
        )}

        {subscription.accountType !== "gratis" && !subscription.isCanceled && (
          <Button variant="ghost" onClick={onCancel} className="w-full text-muted-foreground">
            {t("cancelSubscription")}
          </Button>
        )}
      </div>
    </div>
  );
}
