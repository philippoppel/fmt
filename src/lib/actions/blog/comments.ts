"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { commentSchema, type CommentInput } from "@/lib/validations/blog";

type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

/**
 * Add a comment to a post
 */
export async function addComment(
  postId: string,
  input: CommentInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();

  const validation = commentSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Ungültige Eingabe",
    };
  }

  const data = validation.data;

  // Guest comments require name and email
  if (!session?.user?.id && (!data.guestName || !data.guestEmail)) {
    return {
      success: false,
      error: "Name und E-Mail sind erforderlich",
    };
  }

  // Check if post exists and is published
  const post = await db.blogPost.findUnique({
    where: { id: postId },
    select: { status: true, slug: true },
  });

  if (!post || post.status !== "published") {
    return { success: false, error: "Artikel nicht gefunden" };
  }

  // Validate parent comment if replying
  if (data.parentId) {
    const parent = await db.comment.findUnique({
      where: { id: data.parentId },
      select: { postId: true },
    });
    if (!parent || parent.postId !== postId) {
      return { success: false, error: "Ungültige Antwort" };
    }
  }

  try {
    const comment = await db.comment.create({
      data: {
        content: data.content,
        postId,
        authorId: session?.user?.id || null,
        guestName: !session?.user?.id ? data.guestName : null,
        guestEmail: !session?.user?.id ? data.guestEmail : null,
        parentId: data.parentId || null,
        // Auto-approve for registered users, require moderation for guests
        isApproved: !!session?.user?.id,
      },
    });

    revalidatePath(`/[locale]/blog/${post.slug}`, "page");

    return { success: true, data: { id: comment.id } };
  } catch (error) {
    console.error("Add comment error:", error);
    return { success: false, error: "Fehler beim Speichern" };
  }
}

/**
 * Get comments for a post (only approved)
 */
export async function getPostComments(postId: string): Promise<
  ActionResult<
    Array<{
      id: string;
      content: string;
      createdAt: Date;
      author: {
        name: string | null;
        image: string | null;
      } | null;
      guestName: string | null;
      parentId: string | null;
      replies: Array<{
        id: string;
        content: string;
        createdAt: Date;
        author: {
          name: string | null;
          image: string | null;
        } | null;
        guestName: string | null;
      }>;
    }>
  >
> {
  try {
    const comments = await db.comment.findMany({
      where: {
        postId,
        isApproved: true,
        parentId: null, // Only top-level comments
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        guestName: true,
        parentId: true,
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        replies: {
          where: { isApproved: true },
          select: {
            id: true,
            content: true,
            createdAt: true,
            guestName: true,
            author: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: comments };
  } catch (error) {
    console.error("Get comments error:", error);
    return { success: false, error: "Fehler beim Laden" };
  }
}

/**
 * Delete a comment (author or post owner)
 */
export async function deleteComment(commentId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: {
        authorId: true,
        post: {
          select: {
            authorId: true,
            slug: true,
          },
        },
      },
    });

    if (!comment) {
      return { success: false, error: "Kommentar nicht gefunden" };
    }

    // Allow deletion by comment author or post author
    const isCommentAuthor = comment.authorId === session.user.id;
    const isPostAuthor = comment.post.authorId === session.user.id;

    if (!isCommentAuthor && !isPostAuthor) {
      return { success: false, error: "Keine Berechtigung" };
    }

    await db.comment.delete({ where: { id: commentId } });

    revalidatePath(`/[locale]/blog/${comment.post.slug}`, "page");

    return { success: true };
  } catch (error) {
    console.error("Delete comment error:", error);
    return { success: false, error: "Fehler beim Löschen" };
  }
}

/**
 * Approve a comment (post owner only)
 */
export async function approveComment(commentId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: {
        post: {
          select: {
            authorId: true,
            slug: true,
          },
        },
      },
    });

    if (!comment || comment.post.authorId !== session.user.id) {
      return { success: false, error: "Keine Berechtigung" };
    }

    await db.comment.update({
      where: { id: commentId },
      data: { isApproved: true },
    });

    revalidatePath(`/[locale]/blog/${comment.post.slug}`, "page");

    return { success: true };
  } catch (error) {
    console.error("Approve comment error:", error);
    return { success: false, error: "Fehler beim Freigeben" };
  }
}

/**
 * Mark comment as spam
 */
export async function markAsSpam(commentId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: {
        post: {
          select: { authorId: true },
        },
      },
    });

    if (!comment || comment.post.authorId !== session.user.id) {
      return { success: false, error: "Keine Berechtigung" };
    }

    await db.comment.update({
      where: { id: commentId },
      data: { isSpam: true, isApproved: false },
    });

    return { success: true };
  } catch (error) {
    console.error("Mark spam error:", error);
    return { success: false, error: "Fehler" };
  }
}

/**
 * Get pending comments for moderation (post owner)
 */
export async function getPendingComments(): Promise<
  ActionResult<
    Array<{
      id: string;
      content: string;
      createdAt: Date;
      guestName: string | null;
      guestEmail: string | null;
      post: {
        id: string;
        title: string;
        slug: string;
      };
    }>
  >
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    const comments = await db.comment.findMany({
      where: {
        post: { authorId: session.user.id },
        isApproved: false,
        isSpam: false,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        guestName: true,
        guestEmail: true,
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: comments };
  } catch (error) {
    console.error("Get pending comments error:", error);
    return { success: false, error: "Fehler beim Laden" };
  }
}
