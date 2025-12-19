import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import { getBlogPosts, getCategories, getPopularTags, type SortOption } from "@/lib/data/blog";
import { BlogCard } from "@/components/blog/blog-card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Search,
  Tag,
  BookOpen,
  Sparkles,
  ArrowRight,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    tag?: string;
    page?: string;
    q?: string;
    sort?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return generateSeoMetadata({
    title: t("meta.title"),
    description: t("meta.description"),
    locale,
    path: "/blog",
    type: "website",
  });
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const search = await searchParams;
  const currentPage = parseInt(search.page || "1", 10);
  const currentSort = (search.sort as SortOption) || "newest";

  const [{ posts, total }, categories, popularTags, t] = await Promise.all([
    getBlogPosts({
      locale,
      categorySlug: search.category,
      tagSlug: search.tag,
      search: search.q,
      sortBy: currentSort,
      page: currentPage,
      limit: 12,
    }),
    getCategories(),
    getPopularTags(15),
    getTranslations({ locale, namespace: "blog" }),
  ]);

  const totalPages = Math.ceil(total / 12);
  const localePath = locale === "de" ? "" : `/${locale}`;

  // Featured post (first published post)
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);
  const hasFilters = search.category || search.tag || search.q;

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <header className="relative overflow-hidden border-b bg-gradient-to-b from-muted/30 to-background">
        {/* Decorative elements */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-calm/5 via-transparent to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute top-20 right-[15%] w-72 h-72 bg-trust/5 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-[10%] w-64 h-64 bg-hope/5 rounded-full blur-3xl"
          aria-hidden="true"
        />

        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-calm/10 text-calm text-sm font-medium mb-6">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>Evidenzbasiertes Wissen</span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {t("title")}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              {t("subtitle")}
            </p>

            {/* Guiding principle */}
            <p className="text-sm text-muted-foreground/80 italic">
              „Du musst nicht alles lesen – nur das, was dir wirklich hilft."
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Search and Filter Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <form
            action={`${localePath}/blog`}
            method="get"
            className="relative"
          >
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  name="q"
                  placeholder="Artikel durchsuchen..."
                  defaultValue={search.q || ""}
                  className="pl-12 h-12 text-base rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                />
              </div>
              {/* Sorting Dropdown */}
              <div className="relative">
                <select
                  name="sort"
                  defaultValue={currentSort}
                  className="h-12 px-4 pr-10 rounded-xl border border-border/50 bg-muted/30 text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-trust/50 focus:bg-background transition-colors"
                  aria-label={t("filters.sortBy")}
                >
                  <option value="relevance">{t("filters.relevance")}</option>
                  <option value="newest">{t("filters.newest")}</option>
                  <option value="oldest">{t("filters.oldest")}</option>
                  <option value="popular">{t("filters.popular")}</option>
                </select>
                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 px-6 rounded-xl bg-trust hover:bg-trust/90"
              >
                Suchen
              </Button>
            </div>
            {/* Preserve existing filters when sorting */}
            {search.category && (
              <input type="hidden" name="category" value={search.category} />
            )}
            {search.tag && <input type="hidden" name="tag" value={search.tag} />}
          </form>

          {/* Active Filters */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Aktive Filter:
              </span>
              {search.category && (
                <Link href={`${localePath}/blog${search.q ? `?q=${search.q}` : ""}`}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors gap-1"
                  >
                    {categories.find((c) => c.slug === search.category)?.[
                      locale === "de" ? "nameDE" : "nameEN"
                    ] || search.category}
                    <span className="ml-1 opacity-60">×</span>
                  </Badge>
                </Link>
              )}
              {search.tag && (
                <Link href={`${localePath}/blog${search.q ? `?q=${search.q}` : ""}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors gap-1"
                  >
                    #{search.tag}
                    <span className="ml-1 opacity-60">×</span>
                  </Badge>
                </Link>
              )}
              {search.q && (
                <Link
                  href={`${localePath}/blog${search.category ? `?category=${search.category}` : ""}${search.tag ? `?tag=${search.tag}` : ""}`}
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors gap-1"
                  >
                    &quot;{search.q}&quot;
                    <span className="ml-1 opacity-60">×</span>
                  </Badge>
                </Link>
              )}
              <Link
                href={`${localePath}/blog`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-2"
              >
                Alle zurücksetzen
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-6">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  Keine Artikel gefunden
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {hasFilters
                    ? "Versuche es mit anderen Suchbegriffen oder Filtern."
                    : "Es wurden noch keine Artikel veröffentlicht."}
                </p>
                {hasFilters && (
                  <Button asChild variant="outline">
                    <Link href={`${localePath}/blog`}>
                      Filter zurücksetzen
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Featured Post */}
                {featuredPost && !hasFilters && currentPage === 1 && (
                  <section className="mb-16">
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles
                        className="h-4 w-4 text-hope"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Aktuell empfohlen
                      </span>
                    </div>
                    <BlogCard
                      post={featuredPost}
                      locale={locale}
                      variant="featured"
                    />
                  </section>
                )}

                {/* Posts Grid */}
                <section>
                  {!hasFilters && currentPage === 1 && (
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="font-serif text-2xl font-semibold">
                        Alle Artikel
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{total} Artikel</span>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                    {(hasFilters || currentPage > 1
                      ? posts
                      : remainingPosts
                    ).map((post, index) => (
                      <div
                        key={post.slug}
                        className="animate-in fade-in-0 slide-in-from-bottom-4"
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: "backwards",
                        }}
                      >
                        <BlogCard post={post} locale={locale} />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav
                    className="mt-16 flex justify-center items-center gap-4"
                    aria-label="Seitennavigation"
                  >
                    {currentPage > 1 && (
                      <Button asChild variant="outline" className="gap-2">
                        <Link
                          href={`${localePath}/blog?page=${currentPage - 1}${search.category ? `&category=${search.category}` : ""}${search.tag ? `&tag=${search.tag}` : ""}${search.q ? `&q=${search.q}` : ""}${currentSort !== "newest" ? `&sort=${currentSort}` : ""}`}
                        >
                          Zurück
                        </Link>
                      </Button>
                    )}
                    <span className="text-sm text-muted-foreground">
                      Seite {currentPage} von {totalPages}
                    </span>
                    {currentPage < totalPages && (
                      <Button asChild variant="outline" className="gap-2">
                        <Link
                          href={`${localePath}/blog?page=${currentPage + 1}${search.category ? `&category=${search.category}` : ""}${search.tag ? `&tag=${search.tag}` : ""}${search.q ? `&q=${search.q}` : ""}${currentSort !== "newest" ? `&sort=${currentSort}` : ""}`}
                        >
                          Weiter
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </nav>
                )}
              </>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:w-80 shrink-0 space-y-8">
            {/* Categories */}
            <section className="rounded-2xl border bg-card/50 p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-trust" />
                Themen
              </h2>
              <nav className="space-y-1">
                <Link
                  href={`${localePath}/blog`}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                    !search.category
                      ? "bg-trust text-white font-medium"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>Alle Artikel</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      !search.category && "bg-white/20 text-white"
                    )}
                  >
                    {total}
                  </Badge>
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`${localePath}/blog?category=${category.slug}`}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                      search.category === category.slug
                        ? "bg-trust text-white font-medium"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>
                      {locale === "de" ? category.nameDE : category.nameEN}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        search.category === category.slug &&
                          "bg-white/20 text-white"
                      )}
                    >
                      {category._count.posts}
                    </Badge>
                  </Link>
                ))}
              </nav>
            </section>

            {/* Popular Tags */}
            {popularTags.length > 0 && (
              <section className="rounded-2xl border bg-card/50 p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-calm" />
                  Beliebte Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Link
                      key={tag.slug}
                      href={`${localePath}/blog?tag=${tag.slug}`}
                    >
                      <Badge
                        variant={search.tag === tag.slug ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all duration-200",
                          search.tag === tag.slug
                            ? "bg-calm text-white hover:bg-calm/90"
                            : "hover:bg-calm/10 hover:text-calm hover:border-calm/30"
                        )}
                      >
                        #{tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Matching CTA */}
            <section className="rounded-2xl border border-trust/20 bg-trust/5 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-trust/15 text-trust shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Passende Therapie finden?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Unser geführtes Matching hilft dir, die richtige Unterstützung zu finden.
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="w-full gap-2 bg-trust hover:bg-trust/90"
              >
                <Link href={`${localePath}/therapists/matching`}>
                  Matching starten
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
