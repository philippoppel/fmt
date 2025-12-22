"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthorCardProps {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  locale: string;
  className?: string;
}

export function AuthorCard({ author, locale, className }: AuthorCardProps) {
  const t = useTranslations("blog");

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border bg-card",
        className
      )}
    >
      {author.image ? (
        <img
          src={author.image}
          alt={author.name || "Autor"}
          className="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <User className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {t("author", { name: "" }).replace("{name}", "").trim() || "Autor"}
        </p>
        <Link
          href={`/${locale === "de" ? "" : locale + "/"}blog/author/${author.id}`}
          className="font-semibold hover:text-primary transition-colors"
        >
          {author.name || "Unbekannt"}
        </Link>
      </div>
    </div>
  );
}

// Compact inline version
interface AuthorInlineProps {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  locale: string;
  publishedAt?: Date | string | null; // Can be string from cache serialization
  className?: string;
}

export function AuthorInline({
  author,
  locale,
  publishedAt,
  className,
}: AuthorInlineProps) {
  const t = useTranslations("blog");

  // Safely parse publishedAt - it may be a string (from cache) or Date object
  let parsedDate: Date | null = null;
  let formattedDate: string | null = null;

  if (publishedAt) {
    try {
      parsedDate = typeof publishedAt === "string"
        ? new Date(publishedAt)
        : publishedAt;

      if (!isNaN(parsedDate.getTime())) {
        formattedDate = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(parsedDate);
      }
    } catch {
      // Invalid date - leave as null
    }
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {author.image ? (
        <img
          src={author.image}
          alt={author.name || "Autor"}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <User className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
      <div className="text-sm">
        <Link
          href={`/${locale === "de" ? "" : locale + "/"}blog/author/${author.id}`}
          className="font-medium hover:text-primary transition-colors"
        >
          {author.name || "Unbekannt"}
        </Link>
        {formattedDate && (
          <p className="text-muted-foreground">
            <time dateTime={parsedDate?.toISOString()}>
              {formattedDate}
            </time>
          </p>
        )}
      </div>
    </div>
  );
}
