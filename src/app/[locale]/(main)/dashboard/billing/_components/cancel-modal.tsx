"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Check } from "lucide-react";
import { cancelCurrentSubscription, type SubscriptionStatusResult } from "@/lib/actions/subscription";

interface CancelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: SubscriptionStatusResult | null;
  onSuccess: () => void;
}

export function CancelModal({ open, onOpenChange, subscription, onSuccess }: CancelModalProps) {
  const t = useTranslations("dashboard.billing.cancel");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!subscription) return null;

  const handleCancel = () => {
    setResult(null);
    setError(null);

    startTransition(async () => {
      const response = await cancelCurrentSubscription();

      if (response.success) {
        setResult("success");
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          setResult(null);
        }, 2000);
      } else {
        setResult("error");
        setError(response.error || "Failed to cancel subscription");
      }
    });
  };

  const handleClose = (newOpen: boolean) => {
    if (!isPending) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setResult(null);
        setError(null);
      }
    }
  };

  // Calculate end date
  const endDate = subscription.nextBillingDate
    ? new Date(subscription.nextBillingDate).toLocaleDateString("de-AT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        {result === null && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <DialogTitle className="text-center">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="text-center">
                {t("description")}
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-3 rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("currentPlan")}</span>
                <span className="font-medium">{subscription.plan.name}</span>
              </div>
              {endDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("accessUntil")}</span>
                  <span className="font-medium">{endDate}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("afterCancellation")}</span>
                <span className="font-medium">{t("gratisTier")}</span>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {t("warning")}
            </div>

            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isPending}
              >
                {t("keepSubscription")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("canceling")}
                  </>
                ) : (
                  t("confirmCancel")
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {result === "success" && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-green-600">
              {t("successTitle")}
            </DialogTitle>
            <DialogDescription className="mt-2">
              {endDate ? t("successDescription", { date: endDate }) : t("successTitle")}
            </DialogDescription>
          </div>
        )}

        {result === "error" && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <DialogTitle className="text-destructive">
              {t("errorTitle")}
            </DialogTitle>
            <DialogDescription className="mt-2">
              {error}
            </DialogDescription>
            <Button onClick={() => setResult(null)} className="mt-4">
              {t("tryAgain")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
