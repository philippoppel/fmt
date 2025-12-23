"use server";

import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Publish all scheduled posts that are due
 * This should be called by a cron job (e.g., Vercel Cron)
 *
 * Example vercel.json cron config:
 * {
 *   "crons": [{
 *     "path": "/api/cron/publish-scheduled",
 *     "schedule": "0 * * * *"  // Every hour
 *   }]
 * }
 */
export async function publishScheduledPosts(): Promise<{
  success: boolean;
  publishedCount: number;
  error?: string;
}> {
  try {
    const now = new Date();

    // Find all posts that should be published
    const postsToPublish = await db.blogPost.findMany({
      where: {
        status: "scheduled",
        scheduledAt: {
          lte: now,
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        scheduledAt: true,
      },
    });

    if (postsToPublish.length === 0) {
      return { success: true, publishedCount: 0 };
    }

    // Update each post to published
    const results = await Promise.allSettled(
      postsToPublish.map(async (post) => {
        return db.blogPost.update({
          where: { id: post.id },
          data: {
            status: "published",
            publishedAt: post.scheduledAt || now,
            scheduledAt: null,
          },
        });
      })
    );

    // Count successful publishes
    const publishedCount = results.filter(
      (r) => r.status === "fulfilled"
    ).length;

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Failed to publish scheduled post ${postsToPublish[index].id}:`,
          result.reason
        );
      }
    });

    // Revalidate caches
    revalidatePath("/dashboard/blog");
    revalidatePath("/dashboard/admin/blogs");
    revalidatePath("/blog");
    revalidateTag("blog-posts", {});

    return { success: true, publishedCount };
  } catch (error) {
    console.error("Error publishing scheduled posts:", error);
    return {
      success: false,
      publishedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get upcoming scheduled posts
 * Used in the admin dashboard to show what's coming up
 */
export async function getScheduledPosts(limit = 10): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    title: string;
    slug: string;
    scheduledAt: Date;
    author: { name: string | null; email: string };
  }>;
  error?: string;
}> {
  try {
    const posts = await db.blogPost.findMany({
      where: {
        status: "scheduled",
        scheduledAt: {
          not: null,
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        scheduledAt: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        scheduledAt: post.scheduledAt!,
        author: post.author,
      })),
    };
  } catch (error) {
    console.error("Error getting scheduled posts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update the scheduled time for a post
 * Used by admins to reschedule
 */
export async function reschedulePost(
  postId: string,
  newScheduledAt: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date();

    if (newScheduledAt <= now) {
      return {
        success: false,
        error: "Geplante Zeit muss in der Zukunft liegen",
      };
    }

    const post = await db.blogPost.findUnique({
      where: { id: postId },
      select: { status: true },
    });

    if (!post) {
      return { success: false, error: "Artikel nicht gefunden" };
    }

    if (post.status !== "scheduled") {
      return { success: false, error: "Nur geplante Artikel können umgeplant werden" };
    }

    await db.blogPost.update({
      where: { id: postId },
      data: {
        scheduledAt: newScheduledAt,
      },
    });

    revalidatePath("/dashboard/admin/blogs");
    revalidateTag("blog-posts", {});

    return { success: true };
  } catch (error) {
    console.error("Error rescheduling post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
