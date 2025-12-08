import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import { getBlogPosts, getCategories, getPopularTags } from "@/lib/data/blog";
import { BlogCard } from "@/components/blog/blog-card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; tag?: string; page?: string; q?: string }>;
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

  const [{ posts, total }, categories, popularTags, t] = await Promise.all([
    getBlogPosts({
      locale,
      categorySlug: search.category,
      tagSlug: search.tag,
      search: search.q,
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

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <header className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <main className="flex-1">
          {/* Search Bar */}
          <form action={`${localePath}/blog`} method="get" className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                name="q"
                placeholder="Artikel durchsuchen..."
                defaultValue={search.q || ""}
                className="pl-10"
              />
            </div>
          </form>

          {/* Active Filters */}
          {(search.category || search.tag || search.q) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Filter:</span>
              {search.category && (
                <Link href={`${localePath}/blog`}>
                  <Badge variant="secondary" className="cursor-pointer">
                    {categories.find((c) => c.slug === search.category)?.[locale === "de" ? "nameDE" : "nameEN"] || search.category}
                    <span className="ml-1">×</span>
                  </Badge>
                </Link>
              )}
              {search.tag && (
                <Link href={`${localePath}/blog`}>
                  <Badge variant="outline" className="cursor-pointer">
                    #{search.tag}
                    <span className="ml-1">×</span>
                  </Badge>
                </Link>
              )}
              {search.q && (
                <Link href={`${localePath}/blog`}>
                  <Badge variant="outline" className="cursor-pointer">
                    &quot;{search.q}&quot;
                    <span className="ml-1">×</span>
                  </Badge>
                </Link>
              )}
            </div>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {search.q || search.category || search.tag
                  ? "Keine Artikel gefunden. Versuchen Sie eine andere Suche."
                  : "Noch keine Artikel veröffentlicht."}
              </p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && !search.category && !search.tag && !search.q && currentPage === 1 && (
                <section className="mb-12">
                  <BlogCard post={featuredPost} variant="featured" />
                </section>
              )}

              {/* Posts Grid */}
              <section>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {(search.category || search.tag || search.q || currentPage > 1 ? posts : remainingPosts).map((post) => (
                    <BlogCard key={post.slug} post={post} />
                  ))}
                </div>
              </section>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-12 flex justify-center gap-2" aria-label="Seitennavigation">
                  {currentPage > 1 && (
                    <Link
                      href={`${localePath}/blog?page=${currentPage - 1}${search.category ? `&category=${search.category}` : ""}${search.tag ? `&tag=${search.tag}` : ""}`}
                      className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                    >
                      Zurück
                    </Link>
                  )}
                  <span className="px-4 py-2 text-muted-foreground">
                    Seite {currentPage} von {totalPages}
                  </span>
                  {currentPage < totalPages && (
                    <Link
                      href={`${localePath}/blog?page=${currentPage + 1}${search.category ? `&category=${search.category}` : ""}${search.tag ? `&tag=${search.tag}` : ""}`}
                      className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                    >
                      Weiter
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </main>

        {/* Sidebar */}
        <aside className="lg:w-72 shrink-0 space-y-8">
          {/* Categories */}
          <section>
            <h2 className="font-semibold mb-4">{t("categories.all")}</h2>
            <nav className="space-y-1">
              <Link
                href={`${localePath}/blog`}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!search.category ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                Alle Artikel
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`${localePath}/blog?category=${category.slug}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${search.category === category.slug ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  <span>{locale === "de" ? category.nameDE : category.nameEN}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category._count.posts}
                  </Badge>
                </Link>
              ))}
            </nav>
          </section>

          {/* Popular Tags */}
          {popularTags.length > 0 && (
            <section>
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4" />
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
                      className="cursor-pointer"
                    >
                      #{tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
