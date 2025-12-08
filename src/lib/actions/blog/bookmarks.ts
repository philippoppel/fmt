"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

/**
 * Toggle bookmark for a post
 */
export async function toggleBookmark(
  postId: string
): Promise<ActionResult<{ isBookmarked: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    // Check if bookmark exists
    const existing = await db.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existing) {
      // Remove bookmark
      await db.bookmark.delete({
        where: { id: existing.id },
      });
      return { success: true, data: { isBookmarked: false } };
    } else {
      // Add bookmark
      await db.bookmark.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });
      return { success: true, data: { isBookmarked: true } };
    }
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    return { success: false, error: "Fehler beim Speichern" };
  }
}

/**
 * Check if post is bookmarked by current user
 */
export async function isBookmarked(
  postId: string
): Promise<ActionResult<boolean>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: true, data: false };
  }

  try {
    const bookmark = await db.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    return { success: true, data: !!bookmark };
  } catch (error) {
    console.error("Check bookmark error:", error);
    return { success: false, error: "Fehler" };
  }
}

/**
 * Update reading progress
 */
export async function updateReadProgress(
  postId: string,
  progress: number
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  // Clamp progress to 0-100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  try {
    await db.bookmark.upsert({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
      update: {
        readProgress: clampedProgress,
        lastReadAt: new Date(),
      },
      create: {
        userId: session.user.id,
        postId,
        readProgress: clampedProgress,
        lastReadAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Update progress error:", error);
    return { success: false, error: "Fehler beim Speichern" };
  }
}

/**
 * Get user's bookmarks with post details
 */
export async function getUserBookmarks(): Promise<
  ActionResult<
    Array<{
      id: string;
      readProgress: number;
      lastReadAt: Date | null;
      createdAt: Date;
      post: {
        id: string;
        slug: string;
        title: string;
        excerpt: string | null;
        featuredImage: string | null;
        readingTimeMinutes: number;
        publishedAt: Date | null;
        author: {
          name: string | null;
          image: string | null;
        };
      };
    }>
  >
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    const bookmarks = await db.bookmark.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        readProgress: true,
        lastReadAt: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            featuredImage: true,
            readingTimeMinutes: true,
            publishedAt: true,
            author: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: bookmarks };
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return { success: false, error: "Fehler beim Laden" };
  }
}

/**
 * Remove a bookmark
 */
export async function removeBookmark(postId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    await db.bookmark.delete({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    revalidatePath("/[locale]/dashboard/blog/bookmarks", "page");

    return { success: true };
  } catch (error) {
    console.error("Remove bookmark error:", error);
    return { success: false, error: "Fehler beim Entfernen" };
  }
}
