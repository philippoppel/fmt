"use client";

import { useTranslations } from "next-intl";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface TLDRBoxProps {
  summaryShort: string;
  summaryMedium?: string | null;
  className?: string;
}

export function TLDRBox({ summaryShort, summaryMedium, className }: TLDRBoxProps) {
  const t = useTranslations("blog");

  return (
    <aside
      className={cn(
        "rounded-lg border-l-4 border-l-primary bg-primary/5 p-4 md:p-6",
        className
      )}
      role="complementary"
      aria-label={t("tldr")}
    >
      <div className="flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
        <div className="space-y-2">
          <h2 className="font-semibold text-primary text-sm uppercase tracking-wide">
            {t("tldr")}
          </h2>
          <p className="text-foreground leading-relaxed">
            {summaryShort}
          </p>
          {summaryMedium && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                Mehr Details anzeigen
              </summary>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {summaryMedium}
              </p>
            </details>
          )}
        </div>
      </div>
    </aside>
  );
}
