import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { generateSeoMetadata, generateArticleSchema } from "@/lib/seo";
import { getBlogPostBySlug, getRelatedPosts } from "@/lib/data/blog";
import {
  extractHeadings,
  extractTextFromTipTap,
  type TipTapNode,
} from "@/lib/blog/utils";

import { ReadingProgress } from "@/components/blog/display/reading-progress";
import { ViewTracker } from "@/components/blog/view-tracker";
import { KeyTakeaways } from "@/components/blog/display/key-takeaways";
import { TLDRBox } from "@/components/blog/display/tldr-box";
import { ArticleInfoBox } from "@/components/blog/display/article-info-box";
import { ArticleReaderWrapper } from "@/components/blog/display/article-reader-wrapper";
import {
  TableOfContents,
  TableOfContentsCollapsible,
} from "@/components/blog/display/table-of-contents";
import { CitationList } from "@/components/blog/display/citation-list";
import { AuthorInline } from "@/components/blog/display/author-card";
import { MatchingCTA } from "@/components/blog/display/matching-cta";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/blog/interaction/bookmark-button";
import { ShareButton } from "@/components/blog/interaction/share-button";
import { ReactionButtons } from "@/components/blog/interaction/reaction-buttons";
import { ReadingPreferences } from "@/components/blog/a11y/reading-preferences";
import { SeriesNavigation } from "@/components/blog/display/series-navigation";

import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowLeft, BookOpen } from "lucide-react";

// Safely parse dates that may be strings (from cache) or Date objects
function safeParseDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  try {
    const parsed = typeof date === "string" ? new Date(date) : date;
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || post.status !== "published") {
    return {};
  }

  // Safely parse dates (may be strings from cache serialization)
  const publishedAt = safeParseDate(post.publishedAt);
  const updatedAt = safeParseDate(post.updatedAt);

  return generateSeoMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || post.summaryShort,
    locale,
    path: `/blog/${slug}`,
    type: "article",
    publishedTime: publishedAt?.toISOString(),
    modifiedTime: updatedAt?.toISOString(),
    authors: post.author.name ? [post.author.name] : undefined,
    image: post.featuredImage || undefined,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [post, t] = await Promise.all([
    getBlogPostBySlug(slug),
    getTranslations({ locale, namespace: "blog" }),
  ]);

  if (!post || post.status !== "published") {
    notFound();
  }

  const categoryIds = post.categories.map((c) => c.category.id);
  const relatedPosts = await getRelatedPosts(post.id, categoryIds, 3);

  const headings = extractHeadings(post.content as TipTapNode);
  const plainText = extractTextFromTipTap(post.content as TipTapNode);

  const localePath = locale === "de" ? "" : `/${locale}`;

  // Get primary category for matching context
  const primaryCategory = post.categories[0]?.category;
  const matchingTopic = primaryCategory?.slug || undefined;

  // Key takeaways - use from database if available, otherwise generate fallback
  const keyTakeaways =
    post.keyTakeaways && post.keyTakeaways.length > 0
      ? post.keyTakeaways
      : post.summaryShort
        ? [
            post.summaryShort,
            "Du erfährst, wann professionelle Unterstützung sinnvoll sein kann.",
            "Praktische Hinweise helfen dir, informierte Entscheidungen zu treffen.",
          ]
        : [];

  // Safely parse dates (may be strings from cache serialization)
  const publishedAt = safeParseDate(post.publishedAt);
  const createdAt = safeParseDate(post.createdAt);
  const updatedAt = safeParseDate(post.updatedAt);

  // Generate JSON-LD
  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.excerpt || post.summaryShort,
    url: `${process.env.NEXT_PUBLIC_APP_URL || ""}${localePath}/blog/${slug}`,
    image:
      post.featuredImage ||
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/og-image.svg`,
    publishedTime: publishedAt?.toISOString() || createdAt?.toISOString() || new Date().toISOString(),
    modifiedTime: updatedAt?.toISOString() || new Date().toISOString(),
    authors: post.author.name ? [post.author.name] : [],
  });

  // Medical Web Page Schema for psychotherapy content
  const medicalSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    headline: post.title,
    description: post.summaryShort,
    url: `${process.env.NEXT_PUBLIC_APP_URL || ""}${localePath}/blog/${slug}`,
    datePublished: publishedAt?.toISOString(),
    dateModified: updatedAt?.toISOString() || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    medicalSpecialty: "Psychiatry",
    isAccessibleForFree: true,
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalSchema) }}
      />

      {/* View Tracking */}
      <ViewTracker postId={post.id} />

      {/* Reading Progress Bar */}
      <ReadingProgress />

      <div className="min-h-screen">
        {/* Article Header */}
        <header className="relative overflow-hidden border-b bg-gradient-to-b from-muted/20 to-background">
          {/* Decorative elements */}
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-trust/3 via-transparent to-transparent"
            aria-hidden="true"
          />

          <div className="container mx-auto px-4 py-8 md:py-12">
            {/* Back Link */}
            <Link
              href={`${localePath}/blog`}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-all group px-3 py-1.5 -ml-3 rounded-lg hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Zurück zum {t("title")}</span>
            </Link>

            <div className="max-w-3xl">
              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.map(({ category }) => (
                  <Link
                    key={category.slug}
                    href={`${localePath}/blog?category=${category.slug}`}
                  >
                    <Badge
                      variant="secondary"
                      className="transition-colors hover:bg-trust/20"
                      style={
                        category.color
                          ? {
                              backgroundColor: `${category.color}15`,
                              color: category.color,
                            }
                          : undefined
                      }
                    >
                      {locale === "de" ? category.nameDE : category.nameEN}
                    </Badge>
                  </Link>
                ))}
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <AuthorInline
                  author={post.author}
                  locale={locale}
                  publishedAt={post.publishedAt}
                />
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {t("readingTime", { minutes: post.readingTimeMinutes })}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <BookmarkButton postId={post.id} />
                <ShareButton
                  title={post.title}
                  url={`${localePath}/blog/${slug}`}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <main className="flex-1 max-w-3xl">
              {/* Featured Image */}
              {post.featuredImage && (
                <figure className="mb-10">
                  <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden">
                    <Image
                      src={post.featuredImage}
                      alt={post.featuredImageAlt || post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  {post.featuredImageAlt && (
                    <figcaption className="text-sm text-muted-foreground mt-3 text-center">
                      {post.featuredImageAlt}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Article Meta Box - For Whom / What You'll Learn */}
              <ArticleInfoBox
                targetAudience={post.targetAudience}
                learningOutcome={post.learningOutcome}
                className="mb-8"
              />

              {/* Key Takeaways - PROMINENT */}
              <KeyTakeaways takeaways={keyTakeaways} className="mb-10" />

              {/* TLDR Box (if different from takeaways) */}
              {post.summaryShort && (
                <TLDRBox
                  summaryShort={post.summaryShort}
                  summaryMedium={post.summaryMedium}
                  className="mb-10"
                />
              )}

              {/* Table of Contents (Mobile) */}
              {headings.length > 0 && (
                <div className="lg:hidden mb-10">
                  <TableOfContentsCollapsible headings={headings} />
                </div>
              )}

              {/* Article Content with Reader Mode */}
              <ArticleReaderWrapper plainText={plainText}>
                <article
                  className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:font-serif prose-headings:tracking-tight
                    prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                    prose-p:leading-relaxed prose-p:text-foreground/90
                    prose-a:text-trust prose-a:no-underline hover:prose-a:underline
                    prose-blockquote:border-l-trust prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                    prose-li:marker:text-trust
                    prose-img:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                />
              </ArticleReaderWrapper>

              {/* Inline Matching CTA - after content, before citations */}
              <MatchingCTA
                variant="footer"
                topic={matchingTopic}
                localePath={localePath}
                className="mt-12"
              />

              {/* Citations */}
              {post.citations.length > 0 && (
                <CitationList citations={post.citations} className="mt-12" />
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <section className="mt-12 pt-8 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                    Verwandte Themen
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(({ tag }) => (
                      <Link
                        key={tag.slug}
                        href={`${localePath}/blog?tag=${tag.slug}`}
                      >
                        <Badge
                          variant="outline"
                          className="hover:bg-calm/10 hover:text-calm hover:border-calm/30 transition-colors"
                        >
                          #{tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Reactions */}
              <section className="mt-12 pt-8 border-t">
                <ReactionButtons postId={post.id} />
              </section>

              {/* Series Navigation */}
              {post.series && post.series.posts.length > 1 && (
                <SeriesNavigation
                  seriesTitle={locale === "de" ? post.series.titleDE : post.series.titleEN}
                  seriesSlug={post.series.slug}
                  posts={post.series.posts}
                  currentPostId={post.id}
                  locale={locale}
                  className="mt-12"
                />
              )}
            </main>

            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:block lg:w-72 shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Reading Preferences */}
                <ReadingPreferences text={plainText} />

                {/* Table of Contents */}
                {headings.length > 0 && <TableOfContents headings={headings} />}

                {/* Sidebar Matching CTA */}
                <MatchingCTA
                  variant="sidebar"
                  topic={matchingTopic}
                  localePath={localePath}
                />
              </div>
            </aside>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-20 pt-12 border-t">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-calm/10 text-calm">
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold">
                    {t("relatedPosts")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Weitere Artikel, die dich interessieren könnten
                  </p>
                </div>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost, index) => (
                  <article
                    key={relatedPost.slug}
                    className="group animate-in fade-in-0 slide-in-from-bottom-4"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <Link
                      href={`${localePath}/blog/${relatedPost.slug}`}
                      className="block"
                    >
                      {relatedPost.featuredImage && (
                        <div className="relative w-full aspect-[16/10] mb-4 rounded-xl overflow-hidden">
                          <Image
                            src={relatedPost.featuredImage}
                            alt={relatedPost.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <h3 className="font-semibold text-lg group-hover:text-trust transition-colors line-clamp-2 mb-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
