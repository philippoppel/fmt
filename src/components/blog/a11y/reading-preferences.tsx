"use client";

import { useTranslations } from "next-intl";
import { TextToSpeech } from "./text-to-speech";
import { FontSizeControl } from "./font-size-control";
import { cn } from "@/lib/utils";
import { Accessibility } from "lucide-react";

interface ReadingPreferencesProps {
  text: string;
  className?: string;
}

export function ReadingPreferences({ text, className }: ReadingPreferencesProps) {
  const t = useTranslations("blog.a11y");

  return (
    <div
      className={cn(
        "rounded-lg border bg-card/50 p-4 space-y-3",
        className
      )}
      role="region"
      aria-label="Leseoptionen"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Accessibility className="h-4 w-4" aria-hidden="true" />
        Leseoptionen
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <TextToSpeech text={text} className="flex-1" />
        <FontSizeControl />
      </div>
    </div>
  );
}

// Compact version for sticky sidebar
export function ReadingPreferencesCompact({
  text,
  className,
}: ReadingPreferencesProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <TextToSpeech text={text} />
      <FontSizeControl />
    </div>
  );
}
