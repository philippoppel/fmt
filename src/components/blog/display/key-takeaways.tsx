"use client";

import { useTranslations } from "next-intl";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyTakeawaysProps {
  takeaways: string[];
  className?: string;
}

export function KeyTakeaways({ takeaways, className }: KeyTakeawaysProps) {
  const t = useTranslations("blog");

  if (!takeaways || takeaways.length === 0) {
    return null;
  }

  return (
    <aside
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-calm/8 via-calm/5 to-trust/8",
        "border border-calm/20",
        "p-6 md:p-8",
        className
      )}
      role="complementary"
      aria-labelledby="key-takeaways-heading"
    >
      {/* Subtle decorative element */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-calm/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-trust/10 blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Header */}
      <header className="relative flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-calm/20 text-calm">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2
            id="key-takeaways-heading"
            className="font-serif text-lg md:text-xl font-semibold text-foreground"
          >
            {t("keyTakeaways.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("keyTakeaways.subtitle")}
          </p>
        </div>
      </header>

      {/* Takeaways list */}
      <ul className="relative space-y-4" role="list">
        {takeaways.map((takeaway, index) => (
          <li
            key={index}
            className="flex items-start gap-3 group"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <span
              className={cn(
                "flex items-center justify-center shrink-0",
                "w-6 h-6 rounded-full mt-0.5",
                "bg-calm/20 text-calm",
                "transition-all duration-300",
                "group-hover:bg-calm group-hover:text-white group-hover:scale-110"
              )}
              aria-hidden="true"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className="text-foreground leading-relaxed">
              {takeaway}
            </span>
          </li>
        ))}
      </ul>

      {/* Optional footer note */}
      <footer className="relative mt-6 pt-4 border-t border-calm/15">
        <p className="text-xs text-muted-foreground italic">
          {t("keyTakeaways.note")}
        </p>
      </footer>
    </aside>
  );
}

// Compact variant for sidebar or mobile
export function KeyTakeawaysCompact({ takeaways, className }: KeyTakeawaysProps) {
  const t = useTranslations("blog");

  if (!takeaways || takeaways.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-calm/5 border border-calm/15 p-4",
        className
      )}
      role="complementary"
      aria-label={t("keyTakeaways.title")}
    >
      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-calm">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        {t("keyTakeaways.title")}
      </div>
      <ul className="space-y-2 text-sm" role="list">
        {takeaways.slice(0, 3).map((takeaway, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check
              className="h-4 w-4 text-calm mt-0.5 shrink-0"
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <span className="text-muted-foreground line-clamp-2">{takeaway}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
