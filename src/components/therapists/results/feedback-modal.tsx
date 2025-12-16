"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { MessageSquare, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitMatchFeedback } from "@/lib/actions/tracking";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (feedback: FeedbackData) => void;
  sessionId?: string;
}

export interface FeedbackData {
  foundMatch: boolean | null;
  relevanceRating: number | null;
}

export function FeedbackModal({
  open,
  onOpenChange,
  onSubmit,
}: FeedbackModalProps) {
  const t = useTranslations("feedback");
  const [foundMatch, setFoundMatch] = useState<boolean | null>(null);
  const [relevanceRating, setRelevanceRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setFoundMatch(null);
      setRelevanceRating(null);
      setSubmitted(false);
    }
  }, [open]);

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit({ foundMatch, relevanceRating });
    }
    setSubmitted(true);
    // Close after showing success
    setTimeout(() => {
      onOpenChange(false);
    }, 1500);
  }, [foundMatch, relevanceRating, onSubmit, onOpenChange]);

  // Can submit if at least one question is answered
  const canSubmit = foundMatch !== null || relevanceRating !== null;

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm text-center">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              {t("thankYou")}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t("thankYouMessage")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle className="text-lg font-semibold">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Question 1: Did you find a match? */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t("foundMatch")}</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFoundMatch(true)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  foundMatch === true
                    ? "border-success bg-success-muted text-success-foreground"
                    : "border-input hover:bg-accent"
                )}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm font-medium">{t("yes")}</span>
              </button>
              <button
                type="button"
                onClick={() => setFoundMatch(false)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  foundMatch === false
                    ? "border-accent-orange bg-accent-orange-muted text-accent-orange-foreground"
                    : "border-input hover:bg-accent"
                )}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="text-sm font-medium">{t("no")}</span>
              </button>
            </div>
          </div>

          {/* Question 2: How relevant were the suggestions? */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t("relevance")}</label>
            <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
              <StarRating
                rating={relevanceRating ?? 0}
                size="lg"
                interactive
                onRatingChange={setRelevanceRating}
              />
              <span className="text-xs text-muted-foreground">
                {relevanceRating
                  ? t(`rating.${relevanceRating}`)
                  : t("rating.placeholder")}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            {t("skip")}
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {t("submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage feedback modal with auto-trigger
 */
export function useFeedbackModal(options?: {
  autoShowDelay?: number; // ms delay before auto-showing (null = disabled)
  showOnLeave?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);

  const { autoShowDelay = null, showOnLeave = false } = options ?? {};

  // Auto-show after delay
  useEffect(() => {
    if (autoShowDelay === null || hasShown) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasShown(true);
    }, autoShowDelay);

    return () => clearTimeout(timer);
  }, [autoShowDelay, hasShown]);

  // Show on page leave (beforeunload)
  useEffect(() => {
    if (!showOnLeave || hasShown) return;

    const handleBeforeUnload = () => {
      // Can't show modal on beforeunload, but we can track intent
      // This would need to be handled differently (e.g., localStorage)
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [showOnLeave, hasShown]);

  const showFeedback = useCallback(() => {
    if (!hasShown) {
      setIsOpen(true);
      setHasShown(true);
    }
  }, [hasShown]);

  const handleSubmit = useCallback(async (data: FeedbackData) => {
    setFeedbackData(data);
    // Submit to server for ML tracking
    await submitMatchFeedback({
      foundMatch: data.foundMatch,
      relevanceRating: data.relevanceRating,
    });
  }, []);

  return {
    isOpen,
    setIsOpen,
    hasShown,
    showFeedback,
    handleSubmit,
    feedbackData,
  };
}
