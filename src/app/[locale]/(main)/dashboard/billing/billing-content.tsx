"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, History, AlertCircle } from "lucide-react";
import { getCurrentSubscription, getPaymentHistory, type SubscriptionStatusResult, type PaymentHistoryItem } from "@/lib/actions/subscription";
import { PlanCard } from "./_components/plan-card";
import { UpgradeModal } from "./_components/upgrade-modal";
import { PaymentHistory } from "./_components/payment-history";
import { CancelModal } from "./_components/cancel-modal";

export function BillingContent() {
  const t = useTranslations("dashboard.billing");
  const [isPending, startTransition] = useTransition();
  const [subscription, setSubscription] = useState<SubscriptionStatusResult | null>(null);
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadData = () => {
    startTransition(async () => {
      const [subResult, paymentResult] = await Promise.all([
        getCurrentSubscription(),
        getPaymentHistory(),
      ]);
      setSubscription(subResult);
      setPayments(paymentResult);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isPending && !subscription) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <CardTitle>{t("currentPlan")}</CardTitle>
            </div>
            {subscription?.isCanceled && subscription.subscriptionEndsAt && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {t("canceledBadge")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {subscription && (
            <PlanCard
              subscription={subscription}
              onUpgrade={() => setShowUpgradeModal(true)}
              onCancel={() => setShowCancelModal(true)}
              onReload={loadData}
            />
          )}
        </CardContent>
      </Card>

      {/* Cancellation Warning */}
      {subscription?.isCanceled && subscription.subscriptionEndsAt && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-4 pt-6">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">
                {t("cancellationWarning")}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                {t("accessUntil", {
                  date: new Date(subscription.subscriptionEndsAt).toLocaleDateString("de-AT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{t("paymentHistory")}</CardTitle>
          </div>
          <CardDescription>{t("paymentHistoryDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentHistory payments={payments} />
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        currentTier={subscription?.accountType || "gratis"}
        onSuccess={loadData}
      />

      {/* Cancel Modal */}
      <CancelModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        subscription={subscription}
        onSuccess={loadData}
      />
    </div>
  );
}
