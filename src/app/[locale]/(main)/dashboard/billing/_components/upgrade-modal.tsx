"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Loader2, CreditCard, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountType } from "@prisma/client";
import { changeTier } from "@/lib/actions/subscription";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe/types";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: AccountType;
  onSuccess: () => void;
}

type Step = "select" | "payment" | "processing" | "success" | "error";

export function UpgradeModal({ open, onOpenChange, currentTier, onSuccess }: UpgradeModalProps) {
  const t = useTranslations("dashboard.billing.upgrade");
  const [step, setStep] = useState<Step>("select");
  const [selectedTier, setSelectedTier] = useState<AccountType | null>(null);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/26");
  const [cvc, setCvc] = useState("123");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableTiers = Object.values(SUBSCRIPTION_PLANS).filter(
    (plan) => plan.price > SUBSCRIPTION_PLANS[currentTier].price
  );

  const handleSelectTier = (tier: AccountType) => {
    setSelectedTier(tier);
    setStep("payment");
  };

  const handlePayment = () => {
    if (!selectedTier) return;

    setStep("processing");
    setError(null);

    startTransition(async () => {
      const result = await changeTier(selectedTier);

      if (result.success) {
        setStep("success");
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          // Reset for next time
          setStep("select");
          setSelectedTier(null);
        }, 2000);
      } else {
        setError(result.error || "Payment failed");
        setStep("error");
      }
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => {
      setStep("select");
      setSelectedTier(null);
      setError(null);
    }, 200);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s/g, "").replace(/\D/g, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "select" && t("title")}
            {step === "payment" && t("paymentTitle")}
            {step === "processing" && t("processingTitle")}
            {step === "success" && t("successTitle")}
            {step === "error" && t("errorTitle")}
          </DialogTitle>
          <DialogDescription>
            {step === "select" && t("description")}
            {step === "payment" && t("paymentDescription")}
          </DialogDescription>
        </DialogHeader>

        {/* Tier Selection */}
        {step === "select" && (
          <div className="space-y-4 py-4">
            {availableTiers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t("alreadyPremium")}
              </p>
            ) : (
              <RadioGroup className="space-y-3">
                {availableTiers.map((plan) => (
                  <div
                    key={plan.tier}
                    className={cn(
                      "relative flex cursor-pointer rounded-lg border p-4 transition-all hover:border-primary",
                      selectedTier === plan.tier && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedTier(plan.tier)}
                  >
                    <RadioGroupItem
                      value={plan.tier}
                      id={plan.tier}
                      checked={selectedTier === plan.tier}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {plan.tier === "premium" ? (
                            <Crown className="h-5 w-5 text-amber-500" />
                          ) : (
                            <Star className="h-5 w-5 text-blue-500" />
                          )}
                          <Label htmlFor={plan.tier} className="font-semibold cursor-pointer">
                            {plan.name}
                          </Label>
                          {plan.tier === "mittel" && (
                            <Badge variant="secondary" className="text-xs">
                              {t("popular")}
                            </Badge>
                          )}
                        </div>
                        <span className="font-bold">
                          {(plan.price / 100).toFixed(0)}€
                          <span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </span>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {plan.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-green-600" />
                            {feature}
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-sm text-muted-foreground">
                            +{plan.features.length - 3} {t("moreFeatures")}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}

            {availableTiers.length > 0 && (
              <Button
                className="w-full"
                disabled={!selectedTier}
                onClick={() => selectedTier && handleSelectTier(selectedTier)}
              >
                {t("continue")}
              </Button>
            )}
          </div>
        )}

        {/* Payment Form */}
        {step === "payment" && selectedTier && (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{SUBSCRIPTION_PLANS[selectedTier].name}</span>
                <span className="font-bold">
                  {(SUBSCRIPTION_PLANS[selectedTier].price / 100).toFixed(0)}€/mo
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card">{t("cardNumber")}</Label>
                <div className="relative">
                  <Input
                    id="card"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">{t("expiry")}</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>{t("securePayment")}</span>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              🔧 {t("testMode")}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("select")} className="flex-1">
                {t("back")}
              </Button>
              <Button onClick={handlePayment} className="flex-1">
                {t("pay", { amount: (SUBSCRIPTION_PLANS[selectedTier].price / 100).toFixed(0) })}
              </Button>
            </div>
          </div>
        )}

        {/* Processing */}
        {step === "processing" && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t("processing")}</p>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-600">{t("successMessage")}</h3>
            <p className="text-sm text-muted-foreground mt-2">{t("successDescription")}</p>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <CreditCard className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-destructive">{t("errorMessage")}</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button onClick={() => setStep("payment")} className="mt-4">
              {t("tryAgain")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
