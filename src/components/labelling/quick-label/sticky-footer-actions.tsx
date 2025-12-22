"use client";

import { Loader2, ChevronRight, Trash2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StickyFooterActionsProps {
  isUncertain: boolean;
  onUncertainChange: (value: boolean) => void;
  onSaveAndNext: () => void;
  onSaveOnly?: () => void;
  onDiscard?: () => void;
  isSaving: boolean;
  canSave: boolean;
  showDiscardButton?: boolean;
}

/**
 * Sticky footer with action buttons
 * Fixed at bottom with safe-area support for iOS
 */
export function StickyFooterActions({
  isUncertain,
  onUncertainChange,
  onSaveAndNext,
  onSaveOnly,
  onDiscard,
  isSaving,
  canSave,
  showDiscardButton = false,
}: StickyFooterActionsProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "px-4 py-3",
        // Safe area for iOS
        "pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      )}
      data-testid="sticky-footer"
    >
      <div className="mx-auto max-w-2xl">
        {/* Mobile: Stack vertically */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left side: Uncertain checkbox */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    checked={isUncertain}
                    onCheckedChange={(checked) =>
                      onUncertainChange(checked === true)
                    }
                    disabled={isSaving}
                  />
                  <span className="text-sm text-muted-foreground">
                    Unsicher
                  </span>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </label>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>
                  Markiere den Fall als unsicher, wenn du dir bei der
                  Klassifikation nicht sicher bist.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Right side: Action buttons */}
          <div className="flex items-center gap-2 justify-end">
            {/* Discard button (optional) */}
            {showDiscardButton && onDiscard && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDiscard}
                disabled={isSaving}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Verwerfen</span>
              </Button>
            )}

            {/* Save only button (optional) */}
            {onSaveOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSaveOnly}
                disabled={isSaving || !canSave}
              >
                Speichern
              </Button>
            )}

            {/* Primary: Save & Next */}
            <Button
              size="default"
              onClick={onSaveAndNext}
              disabled={isSaving || !canSave}
              className="gap-2 min-w-[140px] min-h-[44px]"
              data-testid="save-and-next-btn"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Speichern & Weiter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
