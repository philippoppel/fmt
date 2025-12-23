import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Edit, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KeyTakeaways } from "@/components/blog/display/key-takeaways";
import { TLDRBox } from "@/components/blog/display/tldr-box";
import {
  extractHeadings,
  extractTextFromTipTap,
  type TipTapNode,
} from "@/lib/blog/utils";
import {
  TableOfContents,
  TableOfContentsCollapsible,
} from "@/components/blog/display/table-of-contents";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await db.blogPost.findUnique({
    where: { id },
    select: { title: true },
  });

  return {
    title: post ? `Vorschau: ${post.title}` : "Artikel-Vorschau",
    robots: { index: false, follow: false },
  };
}

export default async function PreviewPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/auth/login`);
  }

  const post = await db.blogPost.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, image: true } },
      categories: {
        include: { category: true },
      },
      tags: {
        include: { tag: true },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Check permission (author or admin)
  const isAdmin = session.user.role === "ADMIN";
  const isAuthor = post.authorId === session.user.id;
  if (!isAdmin && !isAuthor) {
    redirect(`/${locale}/dashboard/blog`);
  }

  const localePath = locale === "de" ? "" : `/${locale}`;
  const headings = extractHeadings(post.content as TipTapNode);

  const keyTakeaways =
    post.keyTakeaways && post.keyTakeaways.length > 0
      ? post.keyTakeaways
      : post.summaryShort
        ? [post.summaryShort]
        : [];

  const statusColors: Record<string, string> = {
    draft: "bg-gray-500",
    review: "bg-yellow-500",
    scheduled: "bg-blue-500",
    published: "bg-green-500",
    archived: "bg-red-500",
  };

  const statusLabels: Record<string, string> = {
    draft: "Entwurf",
    review: "In Prüfung",
    scheduled: "Geplant",
    published: "Veröffentlicht",
    archived: "Archiviert",
  };

  return (
    <div className="min-h-screen">
      {/* Preview Banner */}
      <div className="sticky top-0 z-50 bg-yellow-500 text-yellow-950 px-4 py-2">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Vorschau-Modus</span>
            <Badge
              variant="secondary"
              className={`${statusColors[post.status]} text-white`}
            >
              {statusLabels[post.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`${localePath}/dashboard/blog/${post.id}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                Bearbeiten
              </Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href={`${localePath}/dashboard/blog`}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Zurück
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <header className="relative overflow-hidden border-b bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map(({ category }) => (
                <Badge
                  key={category.slug}
                  variant="secondary"
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
              ))}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {post.author.image && (
                  <Image
                    src={post.author.image}
                    alt={post.author.name || ""}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span>{post.author.name}</span>
              </div>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readingTimeMinutes} Min. Lesezeit
              </span>
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

            {/* Key Takeaways */}
            {keyTakeaways.length > 0 && (
              <KeyTakeaways takeaways={keyTakeaways} className="mb-10" />
            )}

            {/* TLDR Box */}
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

            {/* Article Content */}
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

            {/* Tags */}
            {post.tags.length > 0 && (
              <section className="mt-12 pt-8 border-t">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(({ tag }) => (
                    <Badge key={tag.slug} variant="outline">
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Status Card */}
              <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Vorschau</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                  Dieser Artikel ist noch nicht veröffentlicht und nur für dich
                  sichtbar.
                </p>
              </Card>

              {/* Table of Contents */}
              {headings.length > 0 && <TableOfContents headings={headings} />}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
