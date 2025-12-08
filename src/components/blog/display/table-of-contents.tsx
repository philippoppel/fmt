"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";
import type { TOCHeading } from "@/lib/blog/utils";

interface TableOfContentsProps {
  headings: TOCHeading[];
  className?: string;
}

export function TableOfContents({ headings, className }: TableOfContentsProps) {
  const t = useTranslations("blog");
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky header
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav
      className={cn("rounded-lg border bg-card p-4", className)}
      aria-label={t("tableOfContents")}
    >
      <h2 className="flex items-center gap-2 font-semibold text-sm mb-3">
        <List className="h-4 w-4" aria-hidden="true" />
        {t("tableOfContents")}
      </h2>
      <ul className="space-y-1 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={cn(heading.level === 3 && "ml-4")}
          >
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                "text-left w-full px-2 py-1 rounded hover:bg-muted transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activeId === heading.id
                  ? "text-primary font-medium bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Collapsible version for mobile
export function TableOfContentsCollapsible({
  headings,
  className,
}: TableOfContentsProps) {
  const t = useTranslations("blog");
  const [isOpen, setIsOpen] = useState(false);

  if (headings.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 font-semibold text-sm">
          <List className="h-4 w-4" aria-hidden="true" />
          {t("tableOfContents")}
        </span>
        <span className="text-muted-foreground text-xs">
          {headings.length} Abschnitte
        </span>
      </button>
      {isOpen && (
        <ul className="border-t px-4 pb-4 space-y-1 text-sm">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={cn(heading.level === 3 && "ml-4")}
            >
              <button
                onClick={() => scrollToHeading(heading.id)}
                className="text-left w-full px-2 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
