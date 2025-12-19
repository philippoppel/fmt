"use client";

import { type ReactNode } from "react";
import {
  Info,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Heart,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

type CalloutVariant =
  | "info"         // Kurz erklärt - neutral information
  | "important"    // Wichtig - critical information
  | "tip"          // Tipp - helpful suggestion
  | "note"         // Hinweis - general note
  | "context"      // Einordnung - scientific context
  | "selfcare"     // Selbstfürsorge - emotional safety
  | "evidence";    // Evidenz - scientific backing

interface CalloutConfig {
  icon: LucideIcon;
  title: string;
  className: string;
  iconClassName: string;
}

const calloutConfigs: Record<CalloutVariant, CalloutConfig> = {
  info: {
    icon: Info,
    title: "Kurz erklärt",
    className: "bg-trust/5 border-trust/20",
    iconClassName: "text-trust bg-trust/15",
  },
  important: {
    icon: AlertTriangle,
    title: "Wichtig",
    className: "bg-hope/5 border-hope/30",
    iconClassName: "text-hope bg-hope/15",
  },
  tip: {
    icon: Lightbulb,
    title: "Tipp",
    className: "bg-calm/5 border-calm/20",
    iconClassName: "text-calm bg-calm/15",
  },
  note: {
    icon: BookOpen,
    title: "Hinweis",
    className: "bg-muted/50 border-border",
    iconClassName: "text-muted-foreground bg-muted",
  },
  context: {
    icon: BookOpen,
    title: "Einordnung",
    className: "bg-accent-violet/5 border-accent-violet/20",
    iconClassName: "text-accent-violet bg-accent-violet/15",
  },
  selfcare: {
    icon: Heart,
    title: "Selbstfürsorge",
    className: "bg-accent-pink/5 border-accent-pink/20",
    iconClassName: "text-accent-pink bg-accent-pink/15",
  },
  evidence: {
    icon: Shield,
    title: "Wissenschaftliche Einordnung",
    className: "bg-accent-emerald/5 border-accent-emerald/20",
    iconClassName: "text-accent-emerald bg-accent-emerald/15",
  },
};

// ============================================================================
// Main Callout Component
// ============================================================================

interface ArticleCalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function ArticleCallout({
  variant = "note",
  title,
  children,
  className,
  collapsible = false,
  defaultOpen = true,
}: ArticleCalloutProps) {
  const config = calloutConfigs[variant];
  const Icon = config.icon;
  const displayTitle = title || config.title;

  const content = (
    <>
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center shrink-0",
          "w-9 h-9 rounded-xl",
          config.iconClassName
        )}
        aria-hidden="true"
      >
        <Icon className="h-4.5 w-4.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm mb-1">
          {displayTitle}
        </p>
        <div className="text-sm text-muted-foreground leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </>
  );

  if (collapsible) {
    return (
      <details
        className={cn(
          "group rounded-xl border p-4",
          "transition-all duration-200",
          config.className,
          className
        )}
        open={defaultOpen}
      >
        <summary className="flex items-start gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          {content}
          <span
            className={cn(
              "shrink-0 mt-1 text-muted-foreground transition-transform duration-200",
              "group-open:rotate-180"
            )}
            aria-hidden="true"
          >
            ▾
          </span>
        </summary>
      </details>
    );
  }

  return (
    <aside
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        "transition-all duration-200",
        config.className,
        className
      )}
      role="note"
    >
      {content}
    </aside>
  );
}

// ============================================================================
// Specialized Callout Shortcuts
// ============================================================================

interface SimpleCalloutProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function InfoCallout({ title, children, className }: SimpleCalloutProps) {
  return (
    <ArticleCallout variant="info" title={title} className={className}>
      {children}
    </ArticleCallout>
  );
}

export function ImportantCallout({ title, children, className }: SimpleCalloutProps) {
  return (
    <ArticleCallout variant="important" title={title} className={className}>
      {children}
    </ArticleCallout>
  );
}

export function TipCallout({ title, children, className }: SimpleCalloutProps) {
  return (
    <ArticleCallout variant="tip" title={title} className={className}>
      {children}
    </ArticleCallout>
  );
}

export function ContextCallout({ title, children, className }: SimpleCalloutProps) {
  return (
    <ArticleCallout variant="context" title={title} className={className}>
      {children}
    </ArticleCallout>
  );
}

export function SelfcareCallout({ title, children, className }: SimpleCalloutProps) {
  return (
    <ArticleCallout variant="selfcare" title={title} className={className}>
      {children}
    </ArticleCallout>
  );
}

export function EvidenceCallout({ title, children, className }: SimpleCalloutProps) {
  return (
    <ArticleCallout variant="evidence" title={title} className={className}>
      {children}
    </ArticleCallout>
  );
}

// ============================================================================
// Evidence Level Badge (for scientific articles)
// ============================================================================

type EvidenceLevel = "high" | "moderate" | "limited" | "emerging";

const evidenceLevelConfig: Record<EvidenceLevel, { label: string; className: string }> = {
  high: {
    label: "Hohe Evidenz",
    className: "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30",
  },
  moderate: {
    label: "Moderate Evidenz",
    className: "bg-trust/10 text-trust border-trust/30",
  },
  limited: {
    label: "Begrenzte Evidenz",
    className: "bg-hope/10 text-hope border-hope/30",
  },
  emerging: {
    label: "Neue Forschung",
    className: "bg-accent-violet/10 text-accent-violet border-accent-violet/30",
  },
};

interface EvidenceBadgeProps {
  level: EvidenceLevel;
  className?: string;
}

export function EvidenceBadge({ level, className }: EvidenceBadgeProps) {
  const config = evidenceLevelConfig[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "text-xs font-medium border",
        config.className,
        className
      )}
    >
      <Shield className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}
