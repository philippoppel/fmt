"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Compass, ArrowRight, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

type CTAVariant = "inline" | "sidebar" | "footer" | "minimal";

interface MatchingCTAProps {
  /** The topic/category of the current article for context */
  topic?: string;
  /** Which variant to display */
  variant?: CTAVariant;
  /** Additional CSS classes */
  className?: string;
  /** Custom locale path prefix */
  localePath?: string;
}

// ============================================================================
// Topic-specific messaging
// ============================================================================

const topicMessages: Record<string, { title: string; description: string }> = {
  anxiety: {
    title: "Angst besser verstehen",
    description:
      "Wenn du merkst, dass dich das Thema Angst persönlich betrifft, kann ein erster Schritt helfen, Klarheit zu gewinnen.",
  },
  depression: {
    title: "Depression erkennen",
    description:
      "Falls du Anzeichen bei dir selbst erkennst, kann professionelle Unterstützung ein wichtiger Schritt sein.",
  },
  stress: {
    title: "Stress bewältigen",
    description:
      "Anhaltender Stress verdient Aufmerksamkeit. Manchmal hilft ein Gespräch mit Fachleuten.",
  },
  trauma: {
    title: "Trauma verarbeiten",
    description:
      "Traumatische Erfahrungen zu verarbeiten braucht Zeit und oft professionelle Begleitung.",
  },
  relationship: {
    title: "Beziehungen verstehen",
    description:
      "Wenn Beziehungsmuster dich belasten, kann therapeutische Unterstützung neue Wege eröffnen.",
  },
  default: {
    title: "Den passenden Weg finden",
    description:
      "Wenn dich das Thema persönlich betrifft, kann unser Matching dabei helfen, passende therapeutische Unterstützung zu finden.",
  },
};

// ============================================================================
// Main Component
// ============================================================================

export function MatchingCTA({
  topic,
  variant = "inline",
  className,
  localePath = "",
}: MatchingCTAProps) {
  const t = useTranslations("blog.matchingCta");

  const message = topic && topicMessages[topic.toLowerCase()]
    ? topicMessages[topic.toLowerCase()]
    : topicMessages.default;

  // Minimal variant - just a subtle link
  if (variant === "minimal") {
    return (
      <Link
        href={`${localePath}/therapists/matching`}
        className={cn(
          "inline-flex items-center gap-2",
          "text-sm text-muted-foreground hover:text-trust",
          "transition-colors duration-200",
          className
        )}
      >
        <Compass className="h-4 w-4" aria-hidden="true" />
        <span>{t("minimalLabel")}</span>
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    );
  }

  // Sidebar variant - compact card for sticky sidebar
  if (variant === "sidebar") {
    return (
      <aside
        className={cn(
          "rounded-xl border border-trust/20 bg-trust/5 p-4",
          "transition-all duration-300 hover:border-trust/30 hover:bg-trust/8",
          className
        )}
        role="complementary"
        aria-label={t("ariaLabel")}
      >
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-trust/15 text-trust shrink-0">
            <Compass className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground mb-1">
              {t("sidebarTitle")}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {t("sidebarDescription")}
            </p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full gap-1.5 border-trust/30 text-trust hover:bg-trust hover:text-white hover:border-trust"
            >
              <Link href={`${localePath}/therapists/matching`}>
                {t("buttonLabel")}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  // Footer variant - full-width section at article end
  if (variant === "footer") {
    return (
      <section
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "bg-gradient-to-br from-trust/8 via-trust/5 to-calm/8",
          "border border-trust/15",
          "p-6 md:p-8",
          className
        )}
        role="complementary"
        aria-label={t("ariaLabel")}
      >
        {/* Decorative elements */}
        <div
          className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-trust/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-calm/10 blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* Icon and content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-trust/15 text-trust">
                <Heart className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground">
                {message.title}
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-xl">
              {message.description}
            </p>
          </div>

          {/* CTA button */}
          <div className="shrink-0">
            <Button
              asChild
              className="gap-2 bg-trust hover:bg-trust/90 text-white px-6"
            >
              <Link href={`${localePath}/therapists/matching`}>
                <Compass className="h-4 w-4" aria-hidden="true" />
                {t("buttonLabel")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Trust note */}
        <footer className="relative mt-6 pt-4 border-t border-trust/10">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-trust" aria-hidden="true" />
            {t("trustNote")}
          </p>
        </footer>
      </section>
    );
  }

  // Default inline variant - subtle inline card
  return (
    <aside
      className={cn(
        "rounded-xl border border-border/50 bg-muted/30 p-5",
        "transition-all duration-300 hover:border-trust/30 hover:bg-trust/5",
        className
      )}
      role="complementary"
      aria-label={t("ariaLabel")}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-trust/10 text-trust shrink-0">
          <Compass className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground mb-1">
            {t("inlineTitle")}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {t("inlineDescription")}
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-1.5 border-trust/30 text-trust hover:bg-trust hover:text-white hover:border-trust"
          >
            <Link href={`${localePath}/therapists/matching`}>
              {t("buttonLabel")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}

// ============================================================================
// Contextual Inline CTA (for embedding within article content)
// ============================================================================

interface InlineMatchingHintProps {
  topic?: string;
  className?: string;
  localePath?: string;
}

export function InlineMatchingHint({
  topic,
  className,
  localePath = "",
}: InlineMatchingHintProps) {
  const t = useTranslations("blog.matchingCta");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-2.5 py-1 rounded-full",
        "bg-trust/10 text-trust text-sm",
        "transition-all duration-200 hover:bg-trust/15",
        className
      )}
    >
      <Link
        href={`${localePath}/therapists/matching`}
        className="inline-flex items-center gap-1.5 hover:underline underline-offset-2"
      >
        <Compass className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{t("inlineHint")}</span>
      </Link>
    </span>
  );
}
