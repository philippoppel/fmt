import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserPostsWithReviews } from "@/lib/data/blog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, CalendarClock, Eye, Send } from "lucide-react";
import { BlogTabs } from "@/components/dashboard/blog/blog-tabs";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog - Dashboard",
  };
}

export default async function DashboardBlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/auth/login`);
  }

  const isAdmin = session.user.role === "ADMIN";
  const localePath = locale === "de" ? "" : `/${locale}`;

  // Fetch user's own posts
  const userPostsRaw = await getUserPostsWithReviews(session.user.id);
  const userPosts = userPostsRaw.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: post.status as "draft" | "review" | "scheduled" | "published" | "archived",
    readingTimeMinutes: post.readingTimeMinutes,
    commentCount: post._count.comments,
    bookmarkCount: post._count.bookmarks,
    publishedAt: post.publishedAt,
    scheduledAt: post.scheduledAt,
    latestFeedback: post.latestFeedback,
  }));

  // Stats for user's own posts
  const draftCount = userPosts.filter((p) => p.status === "draft").length;
  const userReviewCount = userPosts.filter((p) => p.status === "review").length;
  const userScheduledCount = userPosts.filter((p) => p.status === "scheduled").length;
  const publishedCount = userPosts.filter((p) => p.status === "published").length;

  // Admin-only data
  let allPosts: any[] = [];
  let reviewPosts: any[] = [];
  let scheduledPosts: any[] = [];
  let authors: any[] = [];
  let globalReviewCount = 0;
  let globalScheduledCount = 0;

  if (isAdmin) {
    // Fetch all posts for admin
    const [allPostsRaw, reviewPostsRaw, scheduledPostsRaw, authorsRaw] = await Promise.all([
      db.blogPost.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          author: { select: { name: true, email: true } },
          categories: {
            include: {
              category: { select: { nameDE: true, slug: true } },
            },
          },
          _count: { select: { comments: true, bookmarks: true } },
        },
        take: 50,
      }),
      db.blogPost.findMany({
        where: { status: "review" },
        orderBy: { updatedAt: "asc" },
        include: {
          author: { select: { id: true, name: true, email: true } },
          categories: {
            include: {
              category: { select: { nameDE: true, slug: true } },
            },
          },
        },
      }),
      db.blogPost.findMany({
        where: { status: "scheduled", scheduledAt: { not: null } },
        orderBy: { scheduledAt: "asc" },
        include: {
          author: { select: { id: true, name: true, email: true } },
          categories: {
            include: {
              category: { select: { nameDE: true, slug: true } },
            },
          },
        },
      }),
      db.user.findMany({
        where: { blogPosts: { some: {} } },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      }),
    ]);

    allPosts = allPostsRaw.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status as "draft" | "review" | "scheduled" | "published" | "archived",
      author: post.author,
      categories: post.categories.map((c) => c.category),
      readingTimeMinutes: post.readingTimeMinutes,
      commentCount: post._count.comments,
      bookmarkCount: post._count.bookmarks,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
      scheduledAt: post.scheduledAt,
    }));

    reviewPosts = reviewPostsRaw.map((post) => ({
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
    }));

    scheduledPosts = scheduledPostsRaw.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      author: post.author,
      categories: post.categories.map((c) => c.category),
      readingTimeMinutes: post.readingTimeMinutes,
      scheduledAt: post.scheduledAt!,
    }));

    authors = authorsRaw;
    globalReviewCount = reviewPostsRaw.length;
    globalScheduledCount = scheduledPostsRaw.length;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Verwalten Sie alle Blog-Artikel" : "Verwalten Sie Ihre Blog-Artikel"}
          </p>
        </div>
        <Button asChild>
          <Link href={`${localePath}/dashboard/blog/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Artikel
          </Link>
        </Button>
      </div>

      {/* Stats (user's own posts) */}
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
        <Card className={userReviewCount > 0 ? "border-yellow-200 bg-yellow-50/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Zur Prüfung</CardTitle>
            <Send className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{userReviewCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Geplant</CardTitle>
            <CalendarClock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userScheduledCount}</div>
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

      {/* Blog Tabs */}
      <BlogTabs
        isAdmin={isAdmin}
        locale={locale}
        userPosts={userPosts}
        allPosts={allPosts}
        reviewPosts={reviewPosts}
        scheduledPosts={scheduledPosts}
        authors={authors}
        reviewCount={globalReviewCount}
        scheduledCount={globalScheduledCount}
      />
    </div>
  );
}
