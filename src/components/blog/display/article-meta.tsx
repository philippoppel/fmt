"use client";

import { useTranslations } from "next-intl";
import { Users, Target, Clock, CheckCircle, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface ArticleMetaProps {
  /** Who is this article for? */
  audience?: string;
  /** What will the reader gain? */
  benefit?: string;
  /** Reading time in minutes */
  readingTime: number;
  /** Is this reviewed by a professional? */
  reviewedBy?: string;
  /** Difficulty level */
  difficulty?: "beginner" | "intermediate" | "advanced";
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Difficulty Configuration
// ============================================================================

const difficultyConfig = {
  beginner: {
    label: "Einsteiger",
    className: "bg-calm/10 text-calm border-calm/20",
  },
  intermediate: {
    label: "Fortgeschritten",
    className: "bg-trust/10 text-trust border-trust/20",
  },
  advanced: {
    label: "Vertiefend",
    className: "bg-accent-violet/10 text-accent-violet border-accent-violet/20",
  },
};

// ============================================================================
// Main Component
// ============================================================================

export function ArticleMeta({
  audience,
  benefit,
  readingTime,
  reviewedBy,
  difficulty,
  className,
}: ArticleMetaProps) {
  const t = useTranslations("blog.articleMeta");

  return (
    <aside
      className={cn(
        "rounded-xl border border-border/50 bg-muted/20 p-5",
        className
      )}
      role="complementary"
      aria-label={t("ariaLabel")}
    >
      <div className="space-y-4">
        {/* Quick Info Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Reading Time */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{t("readingTime", { minutes: readingTime })}</span>
          </div>

          {/* Difficulty */}
          {difficulty && (
            <Badge
              variant="outline"
              className={cn("text-xs", difficultyConfig[difficulty].className)}
            >
              {difficultyConfig[difficulty].label}
            </Badge>
          )}

          {/* Reviewed Badge */}
          {reviewedBy && (
            <Badge
              variant="outline"
              className="text-xs bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20"
            >
              <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
              {t("reviewed")}
            </Badge>
          )}
        </div>

        {/* Audience and Benefit */}
        {(audience || benefit) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {/* For whom */}
            {audience && (
              <div className="flex items-start gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-trust/10 text-trust shrink-0 mt-0.5">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                    {t("forWhom")}
                  </p>
                  <p className="text-sm text-foreground">{audience}</p>
                </div>
              </div>
            )}

            {/* What you'll learn */}
            {benefit && (
              <div className="flex items-start gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-calm/10 text-calm shrink-0 mt-0.5">
                  <Target className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                    {t("whatYouLearn")}
                  </p>
                  <p className="text-sm text-foreground">{benefit}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviewed by note */}
        {reviewedBy && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {t("reviewedBy")}{" "}
                <span className="font-medium text-foreground">{reviewedBy}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ============================================================================
// Compact Variant (for card previews)
// ============================================================================

interface ArticleMetaCompactProps {
  readingTime: number;
  reviewedBy?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  className?: string;
}

export function ArticleMetaCompact({
  readingTime,
  reviewedBy,
  difficulty,
  className,
}: ArticleMetaCompactProps) {
  const t = useTranslations("blog.articleMeta");

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" aria-hidden="true" />
        {readingTime} min
      </span>

      {difficulty && (
        <Badge
          variant="outline"
          className={cn("text-[10px] px-1.5 py-0", difficultyConfig[difficulty].className)}
        >
          {difficultyConfig[difficulty].label}
        </Badge>
      )}

      {reviewedBy && (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20"
        >
          <CheckCircle className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />
          Geprüft
        </Badge>
      )}
    </div>
  );
}
