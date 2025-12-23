"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  canSubmitForReview,
  canReviewPost,
  isBlogAdmin,
  getPostWithPermission,
} from "@/lib/permissions/blog-permissions";

type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

/**
 * Submit a draft post for admin review
 * Called by authors when they're ready for their post to be reviewed
 */
export async function submitForReview(
  postId: string
): Promise<ActionResult<{ status: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  // Check permission
  const canSubmit = await canSubmitForReview(postId);
  if (!canSubmit) {
    return {
      success: false,
      error: "Keine Berechtigung oder Artikel ist kein Entwurf",
    };
  }

  try {
    await db.blogPost.update({
      where: { id: postId },
      data: {
        status: "review",
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/blog");
    revalidatePath("/dashboard/admin/blogs");
    revalidateTag("blog-posts", {});

    return { success: true, data: { status: "review" } };
  } catch (error) {
    console.error("Error submitting for review:", error);
    return { success: false, error: "Fehler beim Einreichen zur Prüfung" };
  }
}

/**
 * Approve a post and publish it immediately or schedule it
 * Called by admins from the review queue
 */
export async function approvePost(
  postId: string,
  scheduledAt?: Date | null
): Promise<ActionResult<{ status: string; publishedAt?: Date; scheduledAt?: Date }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  // Check admin permission
  const isAdmin = await canReviewPost();
  if (!isAdmin) {
    return { success: false, error: "Keine Berechtigung" };
  }

  const post = await getPostWithPermission(postId);
  if (!post) {
    return { success: false, error: "Artikel nicht gefunden" };
  }

  if (post.status !== "review") {
    return { success: false, error: "Artikel ist nicht zur Prüfung eingereicht" };
  }

  try {
    const now = new Date();
    const shouldSchedule = scheduledAt && scheduledAt > now;

    // Update post status
    const updatedPost = await db.blogPost.update({
      where: { id: postId },
      data: {
        status: shouldSchedule ? "scheduled" : "published",
        publishedAt: shouldSchedule ? null : now,
        scheduledAt: shouldSchedule ? scheduledAt : null,
        editorId: session.user.id,
        isReviewed: true,
        reviewedAt: now,
        reviewedBy: session.user.name || session.user.email || "Admin",
      },
    });

    // Create review record
    await db.blogReview.create({
      data: {
        postId,
        reviewerId: session.user.id,
        status: "approved",
        feedback: shouldSchedule
          ? `Geplant für ${scheduledAt?.toLocaleDateString("de-DE")}`
          : null,
      },
    });

    revalidatePath("/dashboard/blog");
    revalidatePath("/dashboard/admin/blogs");
    revalidatePath("/blog");
    revalidateTag("blog-posts", {});

    return {
      success: true,
      data: {
        status: updatedPost.status,
        publishedAt: updatedPost.publishedAt ?? undefined,
        scheduledAt: updatedPost.scheduledAt ?? undefined,
      },
    };
  } catch (error) {
    console.error("Error approving post:", error);
    return { success: false, error: "Fehler beim Genehmigen" };
  }
}

/**
 * Request changes on a post and send it back to draft status
 * Called by admins when a post needs revision
 */
export async function requestChanges(
  postId: string,
  feedback: string
): Promise<ActionResult<{ status: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  // Check admin permission
  const isAdmin = await canReviewPost();
  if (!isAdmin) {
    return { success: false, error: "Keine Berechtigung" };
  }

  if (!feedback || feedback.trim().length === 0) {
    return { success: false, error: "Bitte geben Sie Feedback ein" };
  }

  const post = await getPostWithPermission(postId);
  if (!post) {
    return { success: false, error: "Artikel nicht gefunden" };
  }

  if (post.status !== "review") {
    return { success: false, error: "Artikel ist nicht zur Prüfung eingereicht" };
  }

  try {
    // Update post status back to draft
    await db.blogPost.update({
      where: { id: postId },
      data: {
        status: "draft",
        editorId: session.user.id,
      },
    });

    // Create review record with feedback
    await db.blogReview.create({
      data: {
        postId,
        reviewerId: session.user.id,
        status: "changes_requested",
        feedback: feedback.trim(),
      },
    });

    revalidatePath("/dashboard/blog");
    revalidatePath("/dashboard/admin/blogs");
    revalidateTag("blog-posts", {});

    return { success: true, data: { status: "draft" } };
  } catch (error) {
    console.error("Error requesting changes:", error);
    return { success: false, error: "Fehler beim Anfordern von Änderungen" };
  }
}

/**
 * Archive a published post
 * Called by admins to hide a post from public view
 */
export async function archivePost(
  postId: string
): Promise<ActionResult<{ status: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  const isAdmin = await isBlogAdmin();
  if (!isAdmin) {
    return { success: false, error: "Keine Berechtigung" };
  }

  const post = await getPostWithPermission(postId);
  if (!post) {
    return { success: false, error: "Artikel nicht gefunden" };
  }

  if (post.status !== "published") {
    return { success: false, error: "Nur veröffentlichte Artikel können archiviert werden" };
  }

  try {
    await db.blogPost.update({
      where: { id: postId },
      data: {
        status: "archived",
        editorId: session.user.id,
      },
    });

    revalidatePath("/dashboard/blog");
    revalidatePath("/dashboard/admin/blogs");
    revalidatePath("/blog");
    revalidateTag("blog-posts", {});

    return { success: true, data: { status: "archived" } };
  } catch (error) {
    console.error("Error archiving post:", error);
    return { success: false, error: "Fehler beim Archivieren" };
  }
}

/**
 * Unarchive/restore an archived post
 * Called by admins to bring a post back to published
 */
export async function unarchivePost(
  postId: string
): Promise<ActionResult<{ status: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  const isAdmin = await isBlogAdmin();
  if (!isAdmin) {
    return { success: false, error: "Keine Berechtigung" };
  }

  const post = await getPostWithPermission(postId);
  if (!post) {
    return { success: false, error: "Artikel nicht gefunden" };
  }

  if (post.status !== "archived") {
    return { success: false, error: "Nur archivierte Artikel können wiederhergestellt werden" };
  }

  try {
    await db.blogPost.update({
      where: { id: postId },
      data: {
        status: "published",
        editorId: session.user.id,
      },
    });

    revalidatePath("/dashboard/blog");
    revalidatePath("/dashboard/admin/blogs");
    revalidatePath("/blog");
    revalidateTag("blog-posts", {});

    return { success: true, data: { status: "published" } };
  } catch (error) {
    console.error("Error unarchiving post:", error);
    return { success: false, error: "Fehler beim Wiederherstellen" };
  }
}

/**
 * Cancel a scheduled post (move back to review or draft)
 * Called by admins
 */
export async function cancelScheduledPost(
  postId: string
): Promise<ActionResult<{ status: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  const isAdmin = await isBlogAdmin();
  if (!isAdmin) {
    return { success: false, error: "Keine Berechtigung" };
  }

  const post = await getPostWithPermission(postId);
  if (!post) {
    return { success: false, error: "Artikel nicht gefunden" };
  }

  if (post.status !== "scheduled") {
    return { success: false, error: "Nur geplante Artikel können abgebrochen werden" };
  }

  try {
    await db.blogPost.update({
      where: { id: postId },
      data: {
        status: "draft",
        scheduledAt: null,
        editorId: session.user.id,
      },
    });

    revalidatePath("/dashboard/blog");
    revalidatePath("/dashboard/admin/blogs");
    revalidateTag("blog-posts", {});

    return { success: true, data: { status: "draft" } };
  } catch (error) {
    console.error("Error canceling scheduled post:", error);
    return { success: false, error: "Fehler beim Abbrechen der Planung" };
  }
}

/**
 * Publish a scheduled post immediately
 * Called by admins who don't want to wait for the scheduled time
 */
export async function publishScheduledPostNow(
  postId: string
): Promise<ActionResult<{ status: string; publishedAt: Date }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  const isAdmin = await isBlogAdmin();
  if (!isAdmin) {
    return { success: false, error: "Keine Berechtigung" };
  }

  const post = await getPostWithPermission(postId);
  if (!post) {
    return { success: false, error: "Artikel nicht gefunden" };
  }

  if (post.status !== "scheduled") {
    return { success: false, error: "Nur geplante Artikel können sofort veröffentlicht werden" };
  }

  try {
    const now = new Date();
    await db.blogPost.update({
      where: { id: postId },
      data: {
        status: "published",
        publishedAt: now,
        scheduledAt: null,
        editorId: session.user.id,
      },
    });

    revalidatePath("/dashboard/blog");
    revalidatePath("/dashboard/admin/blogs");
    revalidatePath("/blog");
    revalidateTag("blog-posts", {});

    return { success: true, data: { status: "published", publishedAt: now } };
  } catch (error) {
    console.error("Error publishing scheduled post:", error);
    return { success: false, error: "Fehler beim Veröffentlichen" };
  }
}

/**
 * Get the latest review feedback for a post
 * Used to show authors what changes are requested
 */
export async function getLatestReviewFeedback(
  postId: string
): Promise<ActionResult<{ feedback: string; createdAt: Date; reviewerName: string } | null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    const review = await db.blogReview.findFirst({
      where: {
        postId,
        status: "changes_requested",
      },
      orderBy: { createdAt: "desc" },
      include: {
        reviewer: {
          select: { name: true, email: true },
        },
      },
    });

    if (!review || !review.feedback) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        feedback: review.feedback,
        createdAt: review.createdAt,
        reviewerName: review.reviewer.name || review.reviewer.email || "Admin",
      },
    };
  } catch (error) {
    console.error("Error getting review feedback:", error);
    return { success: false, error: "Fehler beim Laden des Feedbacks" };
  }
}
