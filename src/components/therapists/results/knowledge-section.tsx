"use client";

import { useTranslations } from "next-intl";
import { KnowledgeCard } from "./knowledge-card";
import { SectionHeader } from "./section-header";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { BlogPost } from "@/types/therapist";

interface KnowledgeSectionProps {
  articles: BlogPost[];
}

export function KnowledgeSection({ articles }: KnowledgeSectionProps) {
  const t = useTranslations("therapists.results");

  if (articles.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="knowledge-heading" className="mt-10">
      <SectionHeader
        title={t("sectionKnowledge")}
        count={articles.length}
        variant="accent"
      />

      {/* Mobile: Horizontal Scroll */}
      <div className="sm:hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-4">
            {articles.map((article) => (
              <div key={article.id} className="w-[280px] shrink-0">
                <KnowledgeCard article={article} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Desktop: Grid */}
      <div
        className="hidden sm:grid sm:grid-cols-2 gap-4"
        role="list"
        aria-label={t("sectionKnowledge")}
      >
        {articles.map((article) => (
          <div key={article.id} role="listitem">
            <KnowledgeCard article={article} />
          </div>
        ))}
      </div>
    </section>
  );
}
