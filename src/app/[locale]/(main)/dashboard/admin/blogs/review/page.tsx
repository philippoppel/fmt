import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { ReviewQueueList } from "@/components/blog/admin/review-queue-list";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertCircle } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Zur Prüfung - Blog-Verwaltung",
  };
}

export default async function ReviewQueuePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get posts awaiting review, ordered by oldest first
  const posts = await db.blogPost.findMany({
    where: {
      status: "review",
    },
    orderBy: { updatedAt: "asc" },
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
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Keine Artikel zur Prüfung</h3>
          <p className="text-muted-foreground text-center">
            Alle eingereichten Artikel wurden bereits geprüft.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.length > 3 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm">
            {posts.length} Artikel warten auf Prüfung. Die ältesten werden zuerst angezeigt.
          </span>
        </div>
      )}

      <ReviewQueueList
        posts={posts.map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || post.summaryShort,
          author: post.author,
          categories: post.categories.map((c) => c.category),
          readingTimeMinutes: post.readingTimeMinutes,
          wordCount: post.wordCount,
          submittedAt: post.updatedAt,
          featuredImage: post.featuredImage,
        }))}
      />
    </div>
  );
}
