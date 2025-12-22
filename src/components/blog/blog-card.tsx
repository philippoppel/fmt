import Link from "next/link";
import Image from "next/image";
import { Clock, MessageCircle, Bookmark, ShieldCheck } from "lucide-react";
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
    isReviewed?: boolean;
    publishedAt: Date | string | null; // Can be string from cache serialization
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
  locale: string;
  variant?: "default" | "featured" | "compact";
  className?: string;
}

export function BlogCard({ post, locale, variant = "default", className }: BlogCardProps) {
  const href = locale === "de" ? `/blog/${post.slug}` : `/${locale}/blog/${post.slug}`;

  // Safely parse publishedAt - it may be a string (from cache) or Date object
  let formattedDate: string | null = null;
  if (post.publishedAt) {
    try {
      const dateValue = typeof post.publishedAt === "string"
        ? new Date(post.publishedAt)
        : post.publishedAt;

      if (!isNaN(dateValue.getTime())) {
        formattedDate = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(dateValue);
      }
    } catch {
      // Invalid date - leave formattedDate as null
    }
  }

  if (variant === "compact") {
    return (
      <article className={cn("group", className)}>
        <Link href={href} className="flex gap-4 items-start">
          {post.featuredImage && (
            <div className="relative w-20 h-20 shrink-0">
              <Image
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                fill
                sizes="80px"
                className="object-cover rounded-lg"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {formattedDate && <span>{formattedDate}</span>}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {post.readingTimeMinutes} min
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
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={post.featuredImage}
                  alt={post.featuredImageAlt || post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
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
              {post.isReviewed && (
                <Badge
                  variant="outline"
                  className="bg-calm/10 text-calm border-calm/20 text-xs gap-1"
                >
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  {locale === "de" ? "Fachlich geprüft" : "Expert reviewed"}
                </Badge>
              )}
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
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
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
              <div className="relative w-5 h-5">
                <Image
                  src={post.author.image}
                  alt={post.author.name || ""}
                  fill
                  sizes="20px"
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <span>{post.author.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {post.isReviewed && (
              <Badge
                variant="outline"
                className="bg-calm/10 text-calm border-calm/20 text-[10px] gap-0.5 px-1.5 py-0"
              >
                <ShieldCheck className="h-2.5 w-2.5" aria-hidden="true" />
                {locale === "de" ? "Geprüft" : "Reviewed"}
              </Badge>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {post.readingTimeMinutes} min
            </span>
          </div>
        </CardFooter>
      </Card>
    </article>
  );
}
