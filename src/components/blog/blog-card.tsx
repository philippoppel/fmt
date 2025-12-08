"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Clock, MessageCircle, Bookmark } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  post: {
    slug: string;
    title: string;
    excerpt: string | null;
    summaryShort: string;
    featuredImage: string | null;
    featuredImageAlt: string | null;
    readingTimeMinutes: number;
    publishedAt: Date | null;
    author: {
      name: string | null;
      image: string | null;
    };
    categories: Array<{
      category: {
        slug: string;
        nameDE: string;
        nameEN: string;
        color: string | null;
      };
    }>;
    _count: {
      comments: number;
      bookmarks: number;
    };
  };
  variant?: "default" | "featured" | "compact";
  className?: string;
}

export function BlogCard({ post, variant = "default", className }: BlogCardProps) {
  const t = useTranslations("blog");
  const locale = useLocale();

  const href = locale === "de" ? `/blog/${post.slug}` : `/${locale}/blog/${post.slug}`;

  const formattedDate = post.publishedAt
    ? new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(post.publishedAt)
    : null;

  if (variant === "compact") {
    return (
      <article className={cn("group", className)}>
        <Link href={href} className="flex gap-4 items-start">
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="w-20 h-20 object-cover rounded-lg shrink-0"
              loading="lazy"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {formattedDate && <span>{formattedDate}</span>}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {t("readingTime", { minutes: post.readingTimeMinutes })}
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className={cn("group", className)}>
        <Card className="overflow-hidden h-full">
          <Link href={href}>
            {post.featuredImage && (
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.featuredImageAlt || post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {post.categories.slice(0, 2).map(({ category }) => (
                  <Badge
                    key={category.slug}
                    variant="secondary"
                    style={category.color ? { backgroundColor: `${category.color}20`, color: category.color } : undefined}
                  >
                    {locale === "de" ? category.nameDE : category.nameEN}
                  </Badge>
                ))}
              </div>
              <h2 className="text-2xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-muted-foreground line-clamp-3">
                {post.excerpt || post.summaryShort}
              </p>
            </CardContent>
          </Link>
          <CardFooter className="pt-2 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {formattedDate && <span>{formattedDate}</span>}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {post.readingTimeMinutes} min
              </span>
            </div>
            <div className="flex items-center gap-3">
              {post._count.comments > 0 && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  {post._count.comments}
                </span>
              )}
              {post._count.bookmarks > 0 && (
                <span className="flex items-center gap-1">
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                  {post._count.bookmarks}
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
      </article>
    );
  }

  // Default variant
  return (
    <article className={cn("group", className)}>
      <Card className="overflow-hidden h-full flex flex-col">
        <Link href={href} className="flex-1 flex flex-col">
          {post.featuredImage && (
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          )}
          <CardHeader className="pb-2 flex-1">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {post.categories.slice(0, 2).map(({ category }) => (
                <Badge
                  key={category.slug}
                  variant="outline"
                  className="text-xs"
                  style={category.color ? { borderColor: category.color, color: category.color } : undefined}
                >
                  {locale === "de" ? category.nameDE : category.nameEN}
                </Badge>
              ))}
            </div>
            <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {post.excerpt || post.summaryShort}
            </p>
          </CardHeader>
        </Link>
        <CardFooter className="pt-0 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            {post.author.image && (
              <img
                src={post.author.image}
                alt={post.author.name || ""}
                className="w-5 h-5 rounded-full"
              />
            )}
            <span>{post.author.name}</span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {post.readingTimeMinutes} min
          </span>
        </CardFooter>
      </Card>
    </article>
  );
}
