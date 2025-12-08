"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { draftSchema, type DraftInput } from "@/lib/validations/blog";

type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

/**
 * Save or update a draft (autosave)
 */
export async function saveDraft(
  input: DraftInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  const validation = draftSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: "Ungültige Daten" };
  }

  const data = validation.data;

  try {
    // Check for existing draft for this post or user
    let draft;

    if (data.postId) {
      // Editing existing post - find draft by postId
      draft = await db.blogDraft.findUnique({
        where: { postId: data.postId },
      });
    } else {
      // New post - find most recent draft without postId
      draft = await db.blogDraft.findFirst({
        where: {
          authorId: session.user.id,
          postId: null,
        },
        orderBy: { savedAt: "desc" },
      });
    }

    if (draft) {
      // Update existing draft
      await db.blogDraft.update({
        where: { id: draft.id },
        data: {
          title: data.title,
          content: data.content,
          summaryShort: data.summaryShort,
          savedAt: new Date(),
        },
      });
      return { success: true, data: { id: draft.id } };
    } else {
      // Create new draft
      const newDraft = await db.blogDraft.create({
        data: {
          authorId: session.user.id,
          postId: data.postId || null,
          title: data.title,
          content: data.content,
          summaryShort: data.summaryShort,
        },
      });
      return { success: true, data: { id: newDraft.id } };
    }
  } catch (error) {
    console.error("Save draft error:", error);
    return { success: false, error: "Fehler beim Speichern" };
  }
}

/**
 * Get draft by ID or get latest draft for new post
 */
export async function getDraft(
  postId?: string
): Promise<ActionResult<{
  id: string;
  title: string | null;
  content: unknown;
  summaryShort: string | null;
  savedAt: Date;
} | null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    let draft;

    if (postId) {
      draft = await db.blogDraft.findUnique({
        where: { postId },
        select: {
          id: true,
          title: true,
          content: true,
          summaryShort: true,
          savedAt: true,
          authorId: true,
        },
      });
    } else {
      draft = await db.blogDraft.findFirst({
        where: {
          authorId: session.user.id,
          postId: null,
        },
        orderBy: { savedAt: "desc" },
        select: {
          id: true,
          title: true,
          content: true,
          summaryShort: true,
          savedAt: true,
          authorId: true,
        },
      });
    }

    if (draft && draft.authorId !== session.user.id) {
      return { success: false, error: "Keine Berechtigung" };
    }

    return {
      success: true,
      data: draft
        ? {
            id: draft.id,
            title: draft.title,
            content: draft.content,
            summaryShort: draft.summaryShort,
            savedAt: draft.savedAt,
          }
        : null,
    };
  } catch (error) {
    console.error("Get draft error:", error);
    return { success: false, error: "Fehler beim Laden" };
  }
}

/**
 * Delete a draft
 */
export async function deleteDraft(draftId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    const draft = await db.blogDraft.findUnique({
      where: { id: draftId },
      select: { authorId: true },
    });

    if (!draft || draft.authorId !== session.user.id) {
      return { success: false, error: "Nicht berechtigt" };
    }

    await db.blogDraft.delete({ where: { id: draftId } });

    return { success: true };
  } catch (error) {
    console.error("Delete draft error:", error);
    return { success: false, error: "Fehler beim Löschen" };
  }
}

/**
 * Get all drafts for current user
 */
export async function getUserDrafts(): Promise<
  ActionResult<
    Array<{
      id: string;
      title: string | null;
      savedAt: Date;
      postId: string | null;
    }>
  >
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    const drafts = await db.blogDraft.findMany({
      where: { authorId: session.user.id },
      select: {
        id: true,
        title: true,
        savedAt: true,
        postId: true,
      },
      orderBy: { savedAt: "desc" },
    });

    return { success: true, data: drafts };
  } catch (error) {
    console.error("Get user drafts error:", error);
    return { success: false, error: "Fehler beim Laden" };
  }
}
