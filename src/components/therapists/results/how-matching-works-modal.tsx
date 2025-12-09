"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  MessageCircle,
  Heart,
  Search,
  Puzzle,
  Sparkles,
  Shield,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HowMatchingWorksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Step {
  icon: LucideIcon;
  key: string;
}

const steps: Step[] = [
  { icon: MessageCircle, key: "step1" },
  { icon: Heart, key: "step2" },
  { icon: Search, key: "step3" },
  { icon: Puzzle, key: "step4" },
  { icon: Sparkles, key: "step5" },
];

export function HowMatchingWorksModal({
  open,
  onOpenChange,
}: HowMatchingWorksModalProps) {
  const t = useTranslations("matching.howItWorks");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>

        {/* Steps */}
        <div className="space-y-4 py-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.key}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl bg-muted/50",
                  "animate-in fade-in slide-in-from-bottom-2"
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "both",
                }}
              >
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base">
                    {t(`${step.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(`${step.key}.description`)}
                  </p>
                </div>
                <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary text-sm font-medium">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 py-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-green-600" />
            {t("badges.privacy")}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            {t("badges.verified")}
          </div>
        </div>

        {/* Closing Message */}
        <div className="text-center pt-2 pb-4">
          <p className="text-sm text-muted-foreground italic">{t("closing")}</p>
        </div>

        <Button onClick={() => onOpenChange(false)} className="w-full">
          {t("understood")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// Trigger Button Component
export function HowMatchingWorksTrigger({
  onClick,
}: {
  onClick: () => void;
}) {
  const t = useTranslations("matching.howItWorks");

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
    >
      <HelpCircle className="h-4 w-4" />
      {t("trigger")}
    </button>
  );
}
