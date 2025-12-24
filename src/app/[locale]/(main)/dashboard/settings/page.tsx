import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CategoryList } from "@/components/blog/admin/category-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tags, FileText, Settings } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Einstellungen - Dashboard",
  };
}

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  // Admin-only page
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(`/${locale}/dashboard`);
  }

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
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Einstellungen</h1>
        </div>
        <p className="text-muted-foreground">
          Plattform-Einstellungen und Inhaltsverwaltung (nur für Administratoren)
        </p>
      </div>

      {/* Blog Categories Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Blog-Kategorien</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              {categories.length} Kategorien
            </span>
          </div>
          <CardDescription>
            Verwalte die Kategorien für Blog-Artikel
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Tags Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tags className="h-5 w-5 text-primary" />
              <CardTitle>Tags</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              {tags.length} Tags
            </span>
          </div>
          <CardDescription>
            Übersicht aller verwendeten Tags
          </CardDescription>
        </CardHeader>
        <CardContent>
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
  );
}
