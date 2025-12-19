"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  ExternalLink,
  FileText,
  Scale,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

type SourceType = "study" | "guideline" | "book" | "website" | "other";

interface Source {
  id: string;
  type: SourceType;
  doi?: string | null;
  title: string;
  authors: string[];
  inlineKey: string;
  formattedAPA?: string | null;
  year?: number | null;
  journal?: string | null;
  url?: string | null;
}

interface SourcesSectionProps {
  sources: Source[];
  className?: string;
  showCategories?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// ============================================================================
// Source Type Configuration
// ============================================================================

const sourceTypeConfig: Record<
  SourceType,
  { icon: typeof BookOpen; label: string; labelPlural: string }
> = {
  study: {
    icon: GraduationCap,
    label: "Studie",
    labelPlural: "Studien",
  },
  guideline: {
    icon: Scale,
    label: "Leitlinie",
    labelPlural: "Leitlinien",
  },
  book: {
    icon: BookOpen,
    label: "Fachbuch",
    labelPlural: "Fachbücher",
  },
  website: {
    icon: LinkIcon,
    label: "Webressource",
    labelPlural: "Webressourcen",
  },
  other: {
    icon: FileText,
    label: "Weitere Quelle",
    labelPlural: "Weitere Quellen",
  },
};

// ============================================================================
// Main Component
// ============================================================================

export function SourcesSection({
  sources,
  className,
  showCategories = true,
  collapsible = true,
  defaultExpanded = false,
}: SourcesSectionProps) {
  const t = useTranslations("blog.sources");
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (sources.length === 0) {
    return null;
  }

  // Group sources by type
  const groupedSources = sources.reduce(
    (acc, source) => {
      const type = source.type || "other";
      if (!acc[type]) acc[type] = [];
      acc[type].push(source);
      return acc;
    },
    {} as Record<SourceType, Source[]>
  );

  // Order of types to display
  const typeOrder: SourceType[] = ["study", "guideline", "book", "website", "other"];
  const orderedTypes = typeOrder.filter((type) => groupedSources[type]?.length > 0);

  const headerContent = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-trust/10 text-trust">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("subtitle", { count: sources.length })}
          </p>
        </div>
      </div>
      {collapsible && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-1.5 text-muted-foreground"
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <>
              {t("collapse")}
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              {t("expand")}
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );

  const sourcesContent = (
    <div className={cn("mt-6 space-y-8", !isExpanded && collapsible && "hidden")}>
      {showCategories && orderedTypes.length > 1 ? (
        // Categorized view
        orderedTypes.map((type) => {
          const config = sourceTypeConfig[type];
          const Icon = config.icon;
          const typeSources = groupedSources[type];

          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-4">
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {typeSources.length === 1 ? config.label : config.labelPlural}
                </h3>
                <span className="text-xs text-muted-foreground/60">
                  ({typeSources.length})
                </span>
              </div>
              <SourceList sources={typeSources} allSources={sources} />
            </div>
          );
        })
      ) : (
        // Flat list
        <SourceList sources={sources} allSources={sources} />
      )}
    </div>
  );

  return (
    <section
      className={cn(
        "mt-12 pt-8 border-t-2 border-dashed border-border/50",
        className
      )}
      aria-labelledby="sources-heading"
    >
      {headerContent}
      {sourcesContent}

      {/* Transparency note */}
      <footer className="mt-8 pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground italic leading-relaxed">
          {t("transparencyNote")}
        </p>
      </footer>
    </section>
  );
}

// ============================================================================
// Source List Component
// ============================================================================

interface SourceListProps {
  sources: Source[];
  allSources: Source[]; // For calculating index
}

function SourceList({ sources, allSources }: SourceListProps) {
  return (
    <ol className="space-y-4 list-none" role="list">
      {sources.map((source) => {
        const globalIndex = allSources.findIndex((s) => s.id === source.id);

        return (
          <li
            key={source.id}
            id={`ref-${source.inlineKey}`}
            className="group relative pl-10"
          >
            {/* Index badge */}
            <span
              className={cn(
                "absolute left-0 top-0",
                "flex items-center justify-center",
                "w-7 h-7 rounded-lg",
                "bg-muted/50 text-muted-foreground",
                "text-xs font-mono",
                "transition-colors duration-200",
                "group-hover:bg-trust/10 group-hover:text-trust"
              )}
            >
              {globalIndex + 1}
            </span>

            {/* Source content */}
            <div className="space-y-1.5">
              {/* Title and authors */}
              <p className="text-sm leading-relaxed">
                {source.formattedAPA ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: formatAPAWithLinks(source.formattedAPA),
                    }}
                  />
                ) : (
                  <>
                    <span className="text-muted-foreground">
                      {source.authors.join(", ")}
                    </span>
                    {source.year && (
                      <span className="text-muted-foreground">
                        {" "}({source.year})
                      </span>
                    )}
                    <span className="text-foreground font-medium">
                      . {source.title}
                    </span>
                    {source.journal && (
                      <span className="text-muted-foreground italic">
                        . {source.journal}
                      </span>
                    )}
                  </>
                )}
              </p>

              {/* Links */}
              <div className="flex flex-wrap items-center gap-3">
                {source.doi && (
                  <a
                    href={`https://doi.org/${source.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1.5",
                      "text-xs text-trust hover:text-trust/80",
                      "underline-offset-2 hover:underline",
                      "transition-colors duration-200"
                    )}
                  >
                    <span className="font-mono">DOI</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only">(öffnet in neuem Tab)</span>
                  </a>
                )}
                {source.url && !source.doi && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1.5",
                      "text-xs text-trust hover:text-trust/80",
                      "underline-offset-2 hover:underline",
                      "transition-colors duration-200"
                    )}
                  >
                    <span>Quelle aufrufen</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only">(öffnet in neuem Tab)</span>
                  </a>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatAPAWithLinks(apa: string): string {
  // Convert URLs to styled links
  return apa.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-trust hover:text-trust/80 underline-offset-2 hover:underline">$1</a>'
  );
}

// ============================================================================
// Compact Sources Preview (for showing at top of article)
// ============================================================================

interface SourcesPreviewProps {
  count: number;
  className?: string;
}

export function SourcesPreview({ count, className }: SourcesPreviewProps) {
  const t = useTranslations("blog.sources");

  if (count === 0) return null;

  return (
    <a
      href="#sources-heading"
      className={cn(
        "inline-flex items-center gap-1.5",
        "text-xs text-muted-foreground hover:text-trust",
        "transition-colors duration-200",
        className
      )}
    >
      <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{t("count", { count })}</span>
    </a>
  );
}
