import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { generateSeoMetadata, generateArticleSchema } from "@/lib/seo";
import { getBlogPostBySlug, getRelatedPosts } from "@/lib/data/blog";
import { extractHeadings, extractTextFromTipTap, type TipTapNode } from "@/lib/blog/utils";

import { ReadingProgress } from "@/components/blog/display/reading-progress";
import { TLDRBox } from "@/components/blog/display/tldr-box";
import { TableOfContents, TableOfContentsCollapsible } from "@/components/blog/display/table-of-contents";
import { CitationList } from "@/components/blog/display/citation-list";
import { AuthorInline } from "@/components/blog/display/author-card";
import { ReadingPreferences } from "@/components/blog/a11y/reading-preferences";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/blog/interaction/bookmark-button";
import { ShareButton } from "@/components/blog/interaction/share-button";

import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || post.status !== "published") {
    return {};
  }

  return generateSeoMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || post.summaryShort,
    locale,
    path: `/blog/${slug}`,
    type: "article",
    publishedTime: post.publishedAt?.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
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

  // Generate JSON-LD
  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.excerpt || post.summaryShort,
    url: `${process.env.NEXT_PUBLIC_APP_URL || ""}${localePath}/blog/${slug}`,
    image: post.featuredImage || `${process.env.NEXT_PUBLIC_APP_URL || ""}/og-image.svg`,
    publishedTime: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
    authors: post.author.name ? [post.author.name] : [],
  });

  // Medical Web Page Schema for psychotherapy content
  const medicalSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    headline: post.title,
    description: post.summaryShort,
    url: `${process.env.NEXT_PUBLIC_APP_URL || ""}${localePath}/blog/${slug}`,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
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

      {/* Reading Progress Bar */}
      <ReadingProgress />

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back Link */}
        <Link
          href={`${localePath}/blog`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("title")}
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            {/* Article Header */}
            <header className="mb-8">
              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.map(({ category }) => (
                  <Link
                    key={category.slug}
                    href={`${localePath}/blog?category=${category.slug}`}
                  >
                    <Badge
                      variant="secondary"
                      style={category.color ? { backgroundColor: `${category.color}20`, color: category.color } : undefined}
                    >
                      {locale === "de" ? category.nameDE : category.nameEN}
                    </Badge>
                  </Link>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <AuthorInline
                  author={post.author}
                  locale={locale}
                  publishedAt={post.publishedAt}
                />
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {t("readingTime", { minutes: post.readingTimeMinutes })}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mb-6">
                <BookmarkButton postId={post.id} />
                <ShareButton title={post.title} url={`${localePath}/blog/${slug}`} />
              </div>

              {/* Featured Image */}
              {post.featuredImage && (
                <figure className="mb-8">
                  <div className="relative w-full aspect-[16/9]">
                    <Image
                      src={post.featuredImage}
                      alt={post.featuredImageAlt || post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="rounded-lg object-cover"
                      priority
                    />
                  </div>
                  {post.featuredImageAlt && (
                    <figcaption className="text-sm text-muted-foreground mt-2 text-center">
                      {post.featuredImageAlt}
                    </figcaption>
                  )}
                </figure>
              )}
            </header>

            {/* TLDR Box */}
            <TLDRBox
              summaryShort={post.summaryShort}
              summaryMedium={post.summaryMedium}
              className="mb-8"
            />

            {/* Reading Preferences (Mobile) */}
            <div className="lg:hidden mb-8">
              <ReadingPreferences text={plainText} />
            </div>

            {/* Table of Contents (Mobile) */}
            {headings.length > 0 && (
              <div className="lg:hidden mb-8">
                <TableOfContentsCollapsible headings={headings} />
              </div>
            )}

            {/* Article Content */}
            <article
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {/* Citations */}
            {post.citations.length > 0 && (
              <CitationList citations={post.citations} />
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <section className="mt-12 pt-8 border-t">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(({ tag }) => (
                    <Link key={tag.slug} href={`${localePath}/blog?tag=${tag.slug}`}>
                      <Badge variant="outline">#{tag.name}</Badge>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Reading Preferences */}
              <ReadingPreferences text={plainText} />

              {/* Table of Contents */}
              {headings.length > 0 && (
                <TableOfContents headings={headings} />
              )}
            </div>
          </aside>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-8">{t("relatedPosts")}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.slug} className="group">
                  <Link href={`${localePath}/blog/${relatedPost.slug}`}>
                    {relatedPost.featuredImage && (
                      <div className="relative w-full aspect-[16/10] mb-3">
                        <Image
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
