"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, XCircle, RefreshCw, Receipt } from "lucide-react";
import type { PaymentHistoryItem } from "@/lib/actions/subscription";

interface PaymentHistoryProps {
  payments: PaymentHistoryItem[];
}

const ACTION_ICONS = {
  upgrade: ArrowUpCircle,
  downgrade: ArrowDownCircle,
  cancel: XCircle,
  renew: RefreshCw,
};

const ACTION_COLORS = {
  upgrade: "text-green-600",
  downgrade: "text-amber-600",
  cancel: "text-red-600",
  renew: "text-blue-600",
};

const STATUS_BADGES = {
  succeeded: { variant: "default" as const, className: "bg-green-100 text-green-700" },
  failed: { variant: "destructive" as const, className: "" },
  refunded: { variant: "secondary" as const, className: "" },
};

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const t = useTranslations("dashboard.billing.history");

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">{t("noPayments")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => {
        const ActionIcon = ACTION_ICONS[payment.action as keyof typeof ACTION_ICONS] || Receipt;
        const actionColor = ACTION_COLORS[payment.action as keyof typeof ACTION_COLORS] || "text-muted-foreground";
        const statusBadge = STATUS_BADGES[payment.status as keyof typeof STATUS_BADGES] || STATUS_BADGES.succeeded;

        return (
          <div
            key={payment.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-4">
              <div className={actionColor}>
                <ActionIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">
                  {t(`actions.${payment.action}`)}
                  {payment.tier && (
                    <span className="text-muted-foreground ml-1">
                      → {t(`tiers.${payment.tier}`)}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(payment.createdAt).toLocaleDateString("de-AT", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant={statusBadge.variant} className={statusBadge.className}>
                {t(`status.${payment.status}`)}
              </Badge>
              <span className="font-semibold tabular-nums">
                {payment.amount > 0
                  ? `${(payment.amount / 100).toFixed(2)}€`
                  : "-"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
