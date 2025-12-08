"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { citationSchema, type CitationInput } from "@/lib/validations/blog";
import {
  resolveDOI,
  formatAPA,
  generateInlineKey,
  type DOIMetadata,
} from "@/lib/blog/doi-resolver";

type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

/**
 * Resolve DOI and return metadata
 */
export async function resolveAndFormatDOI(
  doi: string
): Promise<ActionResult<DOIMetadata & { formattedAPA: string; inlineKey: string }>> {
  const meta = await resolveDOI(doi);

  if (!meta) {
    return { success: false, error: "DOI konnte nicht aufgelöst werden" };
  }

  return {
    success: true,
    data: {
      ...meta,
      formattedAPA: formatAPA(meta),
      inlineKey: generateInlineKey(meta),
    },
  };
}

/**
 * Add a citation to a post
 */
export async function addCitation(
  postId: string,
  input: CitationInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  // Check post ownership
  const post = await db.blogPost.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post || post.authorId !== session.user.id) {
    return { success: false, error: "Keine Berechtigung" };
  }

  const validation = citationSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Ungültige Eingabe",
    };
  }

  const data = validation.data;

  try {
    // Generate APA formatted citation
    const formattedAPA = formatAPA({
      title: data.title,
      authors: data.authors,
      journal: data.journal || undefined,
      year: data.year || undefined,
      volume: data.volume || undefined,
      issue: data.issue || undefined,
      pages: data.pages || undefined,
      publisher: data.publisher || undefined,
      url: data.url || `https://doi.org/${data.doi}`,
      doi: data.doi || "",
      type: data.type,
    });

    const citation = await db.citation.create({
      data: {
        postId,
        doi: data.doi || null,
        title: data.title,
        authors: data.authors,
        journal: data.journal || null,
        year: data.year || null,
        volume: data.volume || null,
        issue: data.issue || null,
        pages: data.pages || null,
        publisher: data.publisher || null,
        url: data.url || null,
        type: data.type,
        inlineKey: data.inlineKey,
        formattedAPA,
      },
    });

    return { success: true, data: { id: citation.id } };
  } catch (error) {
    console.error("Add citation error:", error);
    return { success: false, error: "Fehler beim Hinzufügen" };
  }
}

/**
 * Update a citation
 */
export async function updateCitation(
  citationId: string,
  input: Partial<CitationInput>
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    const citation = await db.citation.findUnique({
      where: { id: citationId },
      select: {
        post: {
          select: { authorId: true },
        },
      },
    });

    if (!citation || citation.post.authorId !== session.user.id) {
      return { success: false, error: "Keine Berechtigung" };
    }

    const updateData: Record<string, unknown> = {};

    if (input.doi !== undefined) updateData.doi = input.doi;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.authors !== undefined) updateData.authors = input.authors;
    if (input.journal !== undefined) updateData.journal = input.journal;
    if (input.year !== undefined) updateData.year = input.year;
    if (input.volume !== undefined) updateData.volume = input.volume;
    if (input.issue !== undefined) updateData.issue = input.issue;
    if (input.pages !== undefined) updateData.pages = input.pages;
    if (input.publisher !== undefined) updateData.publisher = input.publisher;
    if (input.url !== undefined) updateData.url = input.url;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.inlineKey !== undefined) updateData.inlineKey = input.inlineKey;

    // Regenerate APA if any content changed
    if (Object.keys(updateData).length > 0) {
      const current = await db.citation.findUnique({
        where: { id: citationId },
      });

      if (current) {
        const merged = { ...current, ...updateData };
        updateData.formattedAPA = formatAPA({
          title: merged.title as string,
          authors: merged.authors as string[],
          journal: merged.journal as string | undefined,
          year: merged.year as number | undefined,
          volume: merged.volume as string | undefined,
          issue: merged.issue as string | undefined,
          pages: merged.pages as string | undefined,
          publisher: merged.publisher as string | undefined,
          url: (merged.url as string) || `https://doi.org/${merged.doi || ""}`,
          doi: merged.doi as string || "",
          type: merged.type as string,
        });
      }
    }

    await db.citation.update({
      where: { id: citationId },
      data: updateData,
    });

    return { success: true };
  } catch (error) {
    console.error("Update citation error:", error);
    return { success: false, error: "Fehler beim Aktualisieren" };
  }
}

/**
 * Delete a citation
 */
export async function deleteCitation(citationId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    const citation = await db.citation.findUnique({
      where: { id: citationId },
      select: {
        post: {
          select: { authorId: true },
        },
      },
    });

    if (!citation || citation.post.authorId !== session.user.id) {
      return { success: false, error: "Keine Berechtigung" };
    }

    await db.citation.delete({ where: { id: citationId } });

    return { success: true };
  } catch (error) {
    console.error("Delete citation error:", error);
    return { success: false, error: "Fehler beim Löschen" };
  }
}

/**
 * Get all citations for a post
 */
export async function getPostCitations(
  postId: string
): Promise<
  ActionResult<
    Array<{
      id: string;
      doi: string | null;
      title: string;
      authors: string[];
      inlineKey: string;
      formattedAPA: string | null;
    }>
  >
> {
  try {
    const citations = await db.citation.findMany({
      where: { postId },
      select: {
        id: true,
        doi: true,
        title: true,
        authors: true,
        inlineKey: true,
        formattedAPA: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, data: citations };
  } catch (error) {
    console.error("Get citations error:", error);
    return { success: false, error: "Fehler beim Laden" };
  }
}
