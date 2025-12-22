"use client";

import { ChevronRight, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TOPIC_LABELS } from "@/components/labelling/quick-label/category-card";
import type { CaseStatus } from "@prisma/client";

interface CaseListItemProps {
  id: string;
  text: string;
  status: CaseStatus;
  createdAt: Date;
  labeledCategories?: string[];
  isCalibration?: boolean;
  onClick: () => void;
}

const STATUS_CONFIG = {
  NEW: {
    icon: Clock,
    label: "Neu",
    color: "text-blue-600 bg-blue-50",
  },
  LABELED: {
    icon: CheckCircle,
    label: "Gelabelt",
    color: "text-green-600 bg-green-50",
  },
  REVIEW: {
    icon: AlertCircle,
    label: "Review",
    color: "text-amber-600 bg-amber-50",
  },
};

/**
 * Single case item in the inbox list
 */
export function CaseListItem({
  id,
  text,
  status,
  createdAt,
  labeledCategories = [],
  isCalibration = false,
  onClick,
}: CaseListItemProps) {
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  // Truncate text for preview
  const previewText =
    text.length > 100 ? text.slice(0, 100).trim() + "..." : text;

  // Format date
  const dateStr = new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(createdAt);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg border border-border bg-card transition-colors",
        "min-h-[80px] touch-manipulation",
        "hover:bg-muted/50 hover:border-primary/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Text preview */}
          <p className="text-sm text-foreground line-clamp-2">{previewText}</p>

          {/* Meta info */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status badge */}
            <Badge variant="secondary" className={cn("text-xs", config.color)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>

            {/* Calibration badge */}
            {isCalibration && (
              <Badge variant="outline" className="text-xs">
                Calibration
              </Badge>
            )}

            {/* Labeled categories */}
            {labeledCategories.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {TOPIC_LABELS[cat] || cat}
              </Badge>
            ))}
            {labeledCategories.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{labeledCategories.length - 2}
              </span>
            )}

            {/* Date */}
            <span className="text-xs text-muted-foreground ml-auto">
              {dateStr}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
      </div>
    </button>
  );
}
