import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCategories } from "@/lib/data/blog";
import { PostEditorForm } from "../../_components/post-editor-form";
import { PostStats } from "@/components/blog/admin/post-stats";
import { VersionHistory } from "@/components/blog/admin/version-history";

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
    title: post ? `${post.title} bearbeiten - Dashboard` : "Artikel bearbeiten",
  };
}

export default async function EditPostPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/auth/login`);
  }

  // Get post with permission check
  const post = await db.blogPost.findUnique({
    where: { id },
    include: {
      categories: {
        select: { categoryId: true },
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

  // Get categories and authors (for admin)
  const [categories, authors] = await Promise.all([
    getCategories(),
    isAdmin
      ? db.user.findMany({
          select: { id: true, name: true, email: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const initialData = {
    id: post.id,
    title: post.title,
    content: post.content,
    summaryShort: post.summaryShort,
    summaryMedium: post.summaryMedium,
    featuredImage: post.featuredImage,
    featuredImageAlt: post.featuredImageAlt,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    categoryIds: post.categories.map((c) => c.categoryId),
    tags: post.tags.map((t) => t.tag.name),
    status: post.status as "draft" | "published",
    authorId: post.authorId,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 lg:mb-8">Artikel bearbeiten</h1>

      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
        {/* Main Editor */}
        <div className="flex-1 min-w-0">
          <PostEditorForm
            locale={locale}
            categories={categories}
            initialData={initialData}
            authors={authors}
            isAdmin={isAdmin}
          />
        </div>

        {/* Sidebar with Stats and Versions */}
        <div className="w-full xl:w-80 shrink-0 space-y-6">
          {post.status === "published" && <PostStats postId={post.id} />}
          <VersionHistory postId={post.id} />
        </div>
      </div>
    </div>
  );
}
