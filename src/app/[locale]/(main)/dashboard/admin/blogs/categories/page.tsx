import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { CategoryList } from "@/components/blog/admin/category-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tags, FileText } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Kategorien & Tags - Blog-Verwaltung",
  };
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get categories with post counts
  const categories = await db.blogCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  // Get tags with post counts
  const tags = await db.blogTag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Kategorien</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {categories.length} Kategorien
          </span>
        </div>
        <CategoryList
          categories={categories.map((cat) => ({
            id: cat.id,
            slug: cat.slug,
            name: cat.name,
            nameDE: cat.nameDE,
            nameEN: cat.nameEN,
            description: cat.description,
            color: cat.color,
            icon: cat.icon,
            sortOrder: cat.sortOrder,
            postCount: cat._count.posts,
          }))}
        />
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Tags</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {tags.length} Tags
          </span>
        </div>
        <Card>
          <CardContent className="p-4">
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Noch keine Tags vorhanden
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm"
                  >
                    <span>{tag.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({tag._count.posts})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
