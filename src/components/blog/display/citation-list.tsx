"use client";

import { useTranslations } from "next-intl";
import { BookOpen, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Citation {
  id: string;
  doi: string | null;
  title: string;
  authors: string[];
  inlineKey: string;
  formattedAPA: string | null;
  year: number | null;
}

interface CitationListProps {
  citations: Citation[];
  className?: string;
}

export function CitationList({ citations, className }: CitationListProps) {
  const t = useTranslations("blog");

  if (citations.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("mt-12 pt-8 border-t", className)}
      aria-labelledby="references-heading"
    >
      <h2
        id="references-heading"
        className="flex items-center gap-2 text-xl font-semibold mb-6"
      >
        <BookOpen className="h-5 w-5" aria-hidden="true" />
        {t("references")}
      </h2>
      <ol className="space-y-4 list-none">
        {citations.map((citation, index) => (
          <li
            key={citation.id}
            id={`ref-${citation.inlineKey}`}
            className="group"
          >
            <div className="flex gap-3">
              <span className="text-muted-foreground text-sm font-mono shrink-0">
                [{index + 1}]
              </span>
              <div className="flex-1">
                <p
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: formatAPAWithLinks(citation.formattedAPA || formatFallback(citation)),
                  }}
                />
                {citation.doi && (
                  <a
                    href={`https://doi.org/${citation.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                  >
                    DOI: {citation.doi}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only">(öffnet in neuem Tab)</span>
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function formatAPAWithLinks(apa: string): string {
  // Convert URLs to links
  return apa.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>'
  );
}

function formatFallback(citation: Citation): string {
  const authors = citation.authors.join(", ");
  const year = citation.year ? `(${citation.year})` : "(n.d.)";
  return `${authors} ${year}. ${citation.title}.`;
}

// Inline citation component for use within article
interface InlineCitationProps {
  citationKey: string;
  citations: Citation[];
}

export function InlineCitation({ citationKey, citations }: InlineCitationProps) {
  const citation = citations.find((c) => c.inlineKey === citationKey);
  const index = citations.findIndex((c) => c.inlineKey === citationKey);

  if (!citation) {
    return <span className="text-destructive">[?]</span>;
  }

  const firstAuthor = citation.authors[0]?.split(",")[0] || "Unknown";
  const displayText =
    citation.authors.length > 2
      ? `${firstAuthor} et al., ${citation.year || "n.d."}`
      : citation.authors.length === 2
        ? `${firstAuthor} & ${citation.authors[1]?.split(",")[0]}, ${citation.year || "n.d."}`
        : `${firstAuthor}, ${citation.year || "n.d."}`;

  return (
    <a
      href={`#ref-${citationKey}`}
      className="text-primary hover:underline font-normal"
      title={citation.title}
    >
      ({displayText})
      <sup className="ml-0.5">[{index + 1}]</sup>
    </a>
  );
}
