"use client";

import { type ReactNode } from "react";
import {
  ReaderModeProvider,
  ReaderModeSettings,
  ReaderModeContent,
  ReaderModeToggle,
} from "@/components/blog/a11y/reader-mode";
import { ReadingPreferences } from "@/components/blog/a11y/reading-preferences";
import { cn } from "@/lib/utils";

interface ArticleReaderWrapperProps {
  children: ReactNode;
  plainText: string;
  className?: string;
}

/**
 * Client-side wrapper that provides reader mode functionality for article content.
 * Includes the reader mode provider, settings panel, and styled content wrapper.
 */
export function ArticleReaderWrapper({
  children,
  plainText,
  className,
}: ArticleReaderWrapperProps) {
  return (
    <ReaderModeProvider>
      {/* Reader Mode Settings Panel (fixed position) */}
      <ReaderModeSettings />

      {/* Reading Controls (Desktop) */}
      <div className="hidden lg:flex items-center gap-3 mb-6">
        <ReaderModeToggle />
        <ReadingPreferences text={plainText} />
      </div>

      {/* Article Content with Reader Mode Styles */}
      <ReaderModeContent className={cn("transition-all duration-300", className)}>
        {children}
      </ReaderModeContent>
    </ReaderModeProvider>
  );
}

/**
 * Standalone reader controls for mobile/responsive layouts
 */
export function ArticleReaderControls({ plainText }: { plainText: string }) {
  return (
    <div className="flex items-center gap-3">
      <ReaderModeToggle />
      <ReadingPreferences text={plainText} />
    </div>
  );
}
