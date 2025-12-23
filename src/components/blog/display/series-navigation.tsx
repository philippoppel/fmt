"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SeriesPost {
  id: string;
  slug: string;
  title: string;
  seriesOrder: number | null;
}

interface SeriesNavigationProps {
  seriesTitle: string;
  seriesSlug: string;
  posts: SeriesPost[];
  currentPostId: string;
  locale: string;
  className?: string;
}

export function SeriesNavigation({
  seriesTitle,
  seriesSlug,
  posts,
  currentPostId,
  locale,
  className,
}: SeriesNavigationProps) {
  const localePath = locale === "de" ? "" : `/${locale}`;
  const sortedPosts = [...posts].sort(
    (a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0)
  );
  const currentIndex = sortedPosts.findIndex((p) => p.id === currentPostId);
  const prevPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

  return (
    <Card className={cn("bg-muted/30", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Series Header */}
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Teil {currentIndex + 1} von {sortedPosts.length}:
          </span>
          <Link
            href={`${localePath}/blog/series/${seriesSlug}`}
            className="text-sm font-medium hover:underline"
          >
            {seriesTitle}
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          {prevPost ? (
            <Link
              href={`${localePath}/blog/${prevPost.slug}`}
              className="flex-1 flex items-center gap-2 p-3 rounded-lg border bg-background hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Vorheriger</p>
                <p className="text-sm font-medium truncate">{prevPost.title}</p>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {nextPost ? (
            <Link
              href={`${localePath}/blog/${nextPost.slug}`}
              className="flex-1 flex items-center justify-end gap-2 p-3 rounded-lg border bg-background hover:bg-muted transition-colors text-right"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Nächster</p>
                <p className="text-sm font-medium truncate">{nextPost.title}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* All Parts */}
        <details className="group">
          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-1">
            <span>Alle {sortedPosts.length} Teile anzeigen</span>
            <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
          </summary>
          <div className="mt-3 space-y-1">
            {sortedPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`${localePath}/blog/${post.slug}`}
                className={cn(
                  "flex items-center gap-2 p-2 rounded text-sm transition-colors",
                  post.id === currentPostId
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
              >
                <Badge variant="outline" className="h-5 w-5 p-0 justify-center text-xs">
                  {index + 1}
                </Badge>
                <span className="truncate">{post.title}</span>
              </Link>
            ))}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
