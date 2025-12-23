import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getUserPostsWithReviews } from "@/lib/data/blog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Eye, Clock, CalendarClock, Send } from "lucide-react";
import { formatRelativeTime } from "@/lib/blog/utils";
import { AuthorPostCard } from "@/components/blog/author/author-post-card";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Meine Artikel - Dashboard",
  };
}

export default async function DashboardBlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/auth/login`);
  }

  const posts = await getUserPostsWithReviews(session.user.id);
  const localePath = locale === "de" ? "" : `/${locale}`;

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const reviewCount = posts.filter((p) => p.status === "review").length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Meine Artikel</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Blog-Artikel
          </p>
        </div>
        <Button asChild>
          <Link href={`${localePath}/dashboard/blog/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Artikel
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entwürfe</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
          </CardContent>
        </Card>
        <Card className={reviewCount > 0 ? "border-yellow-200 bg-yellow-50/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Zur Prüfung</CardTitle>
            <Send className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{reviewCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Geplant</CardTitle>
            <CalendarClock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{scheduledCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Veröffentlicht</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Noch keine Artikel</h3>
            <p className="text-muted-foreground text-center mb-4">
              Erstellen Sie Ihren ersten Blog-Artikel
            </p>
            <Button asChild>
              <Link href={`${localePath}/dashboard/blog/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Artikel erstellen
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <AuthorPostCard
              key={post.id}
              post={{
                id: post.id,
                title: post.title,
                slug: post.slug,
                status: post.status,
                readingTimeMinutes: post.readingTimeMinutes,
                commentCount: post._count.comments,
                bookmarkCount: post._count.bookmarks,
                publishedAt: post.publishedAt,
                scheduledAt: post.scheduledAt,
                latestFeedback: post.latestFeedback,
              }}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
