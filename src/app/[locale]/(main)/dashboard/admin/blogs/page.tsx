import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { AdminBlogTable } from "@/components/blog/admin/admin-blog-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CalendarClock, Archive } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; author?: string; search?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog-Verwaltung - Admin",
  };
}

export default async function AdminBlogsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { status, author, search } = await searchParams;
  setRequestLocale(locale);

  // Get stats
  const [
    totalCount,
    draftCount,
    reviewCount,
    scheduledCount,
    publishedCount,
    archivedCount,
  ] = await Promise.all([
    db.blogPost.count(),
    db.blogPost.count({ where: { status: "draft" } }),
    db.blogPost.count({ where: { status: "review" } }),
    db.blogPost.count({ where: { status: "scheduled" } }),
    db.blogPost.count({ where: { status: "published" } }),
    db.blogPost.count({ where: { status: "archived" } }),
  ]);

  // Build filter
  const where: any = {};
  if (status && status !== "all") {
    where.status = status;
  }
  if (author) {
    where.authorId = author;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];
  }

  // Get posts with filters
  const posts = await db.blogPost.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      author: {
        select: { name: true, email: true },
      },
      categories: {
        include: {
          category: {
            select: { nameDE: true, slug: true },
          },
        },
      },
      _count: {
        select: { comments: true, bookmarks: true },
      },
    },
    take: 50,
  });

  // Get all authors for filter dropdown
  const authors = await db.user.findMany({
    where: {
      blogPosts: {
        some: {},
      },
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card className={reviewCount > 0 ? "border-yellow-200 bg-yellow-50/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Zur Prüfung</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
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
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Archiviert</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Blog Table */}
      <AdminBlogTable
        posts={posts.map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          status: post.status,
          author: post.author,
          categories: post.categories.map((c) => c.category),
          readingTimeMinutes: post.readingTimeMinutes,
          commentCount: post._count.comments,
          bookmarkCount: post._count.bookmarks,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          publishedAt: post.publishedAt,
          scheduledAt: post.scheduledAt,
        }))}
        authors={authors}
        currentStatus={status || "all"}
        currentAuthor={author || ""}
        currentSearch={search || ""}
      />
    </div>
  );
}
