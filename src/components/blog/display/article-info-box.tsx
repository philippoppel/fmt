"use client";

import { Users, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ArticleInfoBoxProps {
  targetAudience?: string | null;
  learningOutcome?: string | null;
  className?: string;
}

export function ArticleInfoBox({
  targetAudience,
  learningOutcome,
  className,
}: ArticleInfoBoxProps) {
  const t = useTranslations("blog.article");

  // Don't render if both fields are empty
  if (!targetAudience && !learningOutcome) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-trust/20 bg-gradient-to-br from-trust/5 to-calm/5 p-6",
        "grid gap-6 md:grid-cols-2",
        className
      )}
      role="complementary"
      aria-label="Artikelübersicht"
    >
      {targetAudience && (
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-trust/15 text-trust">
            <Users className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              {t("targetAudience")}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {targetAudience}
            </p>
          </div>
        </div>
      )}

      {learningOutcome && (
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hope/15 text-hope">
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              {t("learningOutcome")}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {learningOutcome}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
