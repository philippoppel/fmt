import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { ScheduledPostsList } from "@/components/blog/admin/scheduled-posts-list";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Geplante Artikel - Blog-Verwaltung",
  };
}

export default async function ScheduledPostsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get scheduled posts ordered by scheduled date
  const posts = await db.blogPost.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { not: null },
    },
    orderBy: { scheduledAt: "asc" },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
      categories: {
        include: {
          category: {
            select: { nameDE: true, slug: true },
          },
        },
      },
    },
  });

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CalendarClock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Keine geplanten Artikel</h3>
          <p className="text-muted-foreground text-center">
            Geplante Veröffentlichungen erscheinen hier.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScheduledPostsList
      posts={posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        author: post.author,
        categories: post.categories.map((c) => c.category),
        readingTimeMinutes: post.readingTimeMinutes,
        scheduledAt: post.scheduledAt!,
      }))}
    />
  );
}
