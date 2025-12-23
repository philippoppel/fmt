"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";

/**
 * Create a new version snapshot of a blog post
 */
export async function createVersion(
  postId: string,
  changeNote?: string
): Promise<{ success: boolean; versionNumber?: number; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    // Get the current post data
    const post = await db.blogPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        content: true,
        contentHtml: true,
        summaryShort: true,
        summaryMedium: true,
        authorId: true,
      },
    });

    if (!post) {
      return { success: false, error: "Artikel nicht gefunden" };
    }

    // Check permission (author or admin)
    const isAdmin = session.user.role === "ADMIN";
    const isAuthor = post.authorId === session.user.id;
    if (!isAdmin && !isAuthor) {
      return { success: false, error: "Keine Berechtigung" };
    }

    // Get the next version number
    const lastVersion = await db.blogPostVersion.findFirst({
      where: { postId },
      orderBy: { versionNumber: "desc" },
      select: { versionNumber: true },
    });

    const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    // Create the version
    await db.blogPostVersion.create({
      data: {
        postId,
        versionNumber: nextVersionNumber,
        changeNote,
        title: post.title,
        content: post.content as object,
        contentHtml: post.contentHtml,
        summaryShort: post.summaryShort,
        summaryMedium: post.summaryMedium,
        createdById: session.user.id,
      },
    });

    return { success: true, versionNumber: nextVersionNumber };
  } catch (error) {
    console.error("Create version error:", error);
    return { success: false, error: "Fehler beim Erstellen der Version" };
  }
}

/**
 * Get all versions of a blog post
 */
export async function getVersions(postId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { versions: [], error: "Nicht authentifiziert" };
  }

  try {
    const post = await db.blogPost.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return { versions: [], error: "Artikel nicht gefunden" };
    }

    // Check permission
    const isAdmin = session.user.role === "ADMIN";
    const isAuthor = post.authorId === session.user.id;
    if (!isAdmin && !isAuthor) {
      return { versions: [], error: "Keine Berechtigung" };
    }

    const versions = await db.blogPostVersion.findMany({
      where: { postId },
      orderBy: { versionNumber: "desc" },
      select: {
        id: true,
        versionNumber: true,
        changeNote: true,
        title: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return { versions };
  } catch (error) {
    console.error("Get versions error:", error);
    return { versions: [], error: "Fehler beim Laden der Versionen" };
  }
}

/**
 * Get a specific version with full content
 */
export async function getVersion(versionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { version: null, error: "Nicht authentifiziert" };
  }

  try {
    const version = await db.blogPostVersion.findUnique({
      where: { id: versionId },
      include: {
        post: {
          select: { authorId: true },
        },
        createdBy: {
          select: { name: true, image: true },
        },
      },
    });

    if (!version) {
      return { version: null, error: "Version nicht gefunden" };
    }

    // Check permission
    const isAdmin = session.user.role === "ADMIN";
    const isAuthor = version.post.authorId === session.user.id;
    if (!isAdmin && !isAuthor) {
      return { version: null, error: "Keine Berechtigung" };
    }

    return {
      version: {
        id: version.id,
        versionNumber: version.versionNumber,
        changeNote: version.changeNote,
        title: version.title,
        content: version.content,
        contentHtml: version.contentHtml,
        summaryShort: version.summaryShort,
        summaryMedium: version.summaryMedium,
        createdAt: version.createdAt,
        createdBy: version.createdBy,
      },
    };
  } catch (error) {
    console.error("Get version error:", error);
    return { version: null, error: "Fehler beim Laden der Version" };
  }
}

/**
 * Restore a post to a previous version
 */
export async function restoreVersion(
  postId: string,
  versionId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    // Get the version to restore
    const version = await db.blogPostVersion.findUnique({
      where: { id: versionId },
      include: {
        post: {
          select: { authorId: true },
        },
      },
    });

    if (!version || version.postId !== postId) {
      return { success: false, error: "Version nicht gefunden" };
    }

    // Check permission
    const isAdmin = session.user.role === "ADMIN";
    const isAuthor = version.post.authorId === session.user.id;
    if (!isAdmin && !isAuthor) {
      return { success: false, error: "Keine Berechtigung" };
    }

    // First, create a version of the current state before restoring
    await createVersion(postId, `Vor Wiederherstellung von Version ${version.versionNumber}`);

    // Restore the post to the selected version
    await db.blogPost.update({
      where: { id: postId },
      data: {
        title: version.title,
        content: version.content as object,
        contentHtml: version.contentHtml,
        summaryShort: version.summaryShort,
        summaryMedium: version.summaryMedium,
      },
    });

    // Create a new version to mark the restoration
    await createVersion(postId, `Wiederhergestellt von Version ${version.versionNumber}`);

    revalidateTag("blog-posts", {});

    return { success: true };
  } catch (error) {
    console.error("Restore version error:", error);
    return { success: false, error: "Fehler beim Wiederherstellen" };
  }
}

/**
 * Get post statistics
 */
export async function getPostStats(postId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { stats: null, error: "Nicht authentifiziert" };
  }

  try {
    const post = await db.blogPost.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
        viewCount: true,
        uniqueViewCount: true,
        readingTimeMinutes: true,
        wordCount: true,
        publishedAt: true,
        _count: {
          select: {
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!post) {
      return { stats: null, error: "Artikel nicht gefunden" };
    }

    // Check permission
    const isAdmin = session.user.role === "ADMIN";
    const isAuthor = post.authorId === session.user.id;
    if (!isAdmin && !isAuthor) {
      return { stats: null, error: "Keine Berechtigung" };
    }

    return {
      stats: {
        viewCount: post.viewCount,
        uniqueViewCount: post.uniqueViewCount,
        readingTimeMinutes: post.readingTimeMinutes,
        wordCount: post.wordCount,
        commentCount: post._count.comments,
        bookmarkCount: post._count.bookmarks,
        publishedAt: post.publishedAt,
      },
    };
  } catch (error) {
    console.error("Get post stats error:", error);
    return { stats: null, error: "Fehler beim Laden der Statistiken" };
  }
}
