"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { blogPostSchema, type BlogPostInput } from "@/lib/validations/blog";
import {
  generateSlug,
  calculateReadingTime,
  countWords,
  extractTextFromTipTap,
  generateExcerpt,
  type TipTapNode,
} from "@/lib/blog/utils";
import { renderTipTapToHtml } from "@/lib/blog/tiptap-renderer";

type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

/**
 * Create a new blog post
 */
export async function createBlogPost(
  input: BlogPostInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  const validation = blogPostSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Ungültige Eingabe",
    };
  }

  const data = validation.data;

  try {
    // Generate slug from title
    let slug = generateSlug(data.title);

    // Check for existing slug and make unique
    const existingPost = await db.blogPost.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Extract text and calculate reading time
    const plainText = extractTextFromTipTap(data.content as TipTapNode);
    const wordCount = countWords(plainText);
    const readingTime = calculateReadingTime(plainText);
    const excerpt = generateExcerpt(plainText);

    // Render HTML for SEO
    const contentHtml = renderTipTapToHtml(data.content as TipTapNode);

    const post = await db.blogPost.create({
      data: {
        slug,
        title: data.title,
        content: data.content,
        contentHtml,
        excerpt,
        summaryShort: data.summaryShort,
        summaryMedium: data.summaryMedium,
        featuredImage: data.featuredImage || null,
        featuredImageAlt: data.featuredImageAlt || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        wordCount,
        readingTimeMinutes: readingTime,
        status: data.status === "published" ? "published" : "draft",
        publishedAt: data.status === "published" ? new Date() : null,
        authorId: session.user.id,
        categories: {
          create: data.categoryIds.map((categoryId) => ({
            categoryId,
          })),
        },
        tags: {
          create: await createTagConnections(data.tags || []),
        },
      },
    });

    revalidatePath("/blog");
    revalidateTag("blog-posts", {});

    return { success: true, data: { id: post.id, slug: post.slug } };
  } catch (error) {
    console.error("Create blog post error:", error);
    return { success: false, error: "Fehler beim Erstellen des Artikels" };
  }
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(
  postId: string,
  input: Partial<BlogPostInput>
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  // Check ownership
  const existingPost = await db.blogPost.findUnique({
    where: { id: postId },
    select: { authorId: true, slug: true },
  });

  if (!existingPost) {
    return { success: false, error: "Artikel nicht gefunden" };
  }

  if (existingPost.authorId !== session.user.id) {
    return { success: false, error: "Keine Berechtigung" };
  }

  try {
    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.content !== undefined) {
      const plainText = extractTextFromTipTap(input.content as TipTapNode);
      updateData.content = input.content;
      updateData.contentHtml = renderTipTapToHtml(input.content as TipTapNode);
      updateData.excerpt = generateExcerpt(plainText);
      updateData.wordCount = countWords(plainText);
      updateData.readingTimeMinutes = calculateReadingTime(plainText);
    }

    if (input.summaryShort !== undefined) {
      updateData.summaryShort = input.summaryShort;
    }

    if (input.summaryMedium !== undefined) {
      updateData.summaryMedium = input.summaryMedium;
    }

    if (input.featuredImage !== undefined) {
      updateData.featuredImage = input.featuredImage || null;
    }

    if (input.featuredImageAlt !== undefined) {
      updateData.featuredImageAlt = input.featuredImageAlt || null;
    }

    if (input.metaTitle !== undefined) {
      updateData.metaTitle = input.metaTitle || null;
    }

    if (input.metaDescription !== undefined) {
      updateData.metaDescription = input.metaDescription || null;
    }

    // Handle categories
    if (input.categoryIds !== undefined) {
      await db.blogPostCategory.deleteMany({ where: { postId } });
      await db.blogPostCategory.createMany({
        data: input.categoryIds.map((categoryId) => ({
          postId,
          categoryId,
        })),
      });
    }

    // Handle tags
    if (input.tags !== undefined) {
      await db.blogPostTag.deleteMany({ where: { postId } });
      const tagConnections = await createTagConnections(input.tags);
      for (const connection of tagConnections) {
        await db.blogPostTag.create({
          data: { postId, tagId: connection.tagId },
        });
      }
    }

    await db.blogPost.update({
      where: { id: postId },
      data: updateData,
    });

    revalidatePath(`/blog/${existingPost.slug}`);
    revalidatePath("/blog");
    revalidateTag("blog-posts", {});

    return { success: true };
  } catch (error) {
    console.error("Update blog post error:", error);
    return { success: false, error: "Fehler beim Aktualisieren" };
  }
}

/**
 * Publish a draft post
 */
export async function publishBlogPost(postId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  const post = await db.blogPost.findUnique({
    where: { id: postId },
    select: { authorId: true, status: true },
  });

  if (!post) {
    return { success: false, error: "Artikel nicht gefunden" };
  }

  if (post.authorId !== session.user.id) {
    return { success: false, error: "Keine Berechtigung" };
  }

  try {
    await db.blogPost.update({
      where: { id: postId },
      data: {
        status: "published",
        publishedAt: post.status === "draft" ? new Date() : undefined,
      },
    });

    revalidatePath("/blog");
    revalidateTag("blog-posts", {});

    return { success: true };
  } catch (error) {
    console.error("Publish error:", error);
    return { success: false, error: "Fehler beim Veröffentlichen" };
  }
}

/**
 * Unpublish a post (revert to draft)
 */
export async function unpublishBlogPost(postId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  const post = await db.blogPost.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post || post.authorId !== session.user.id) {
    return { success: false, error: "Nicht berechtigt" };
  }

  try {
    await db.blogPost.update({
      where: { id: postId },
      data: { status: "draft" },
    });

    revalidatePath("/blog");
    revalidateTag("blog-posts", {});

    return { success: true };
  } catch (error) {
    console.error("Unpublish error:", error);
    return { success: false, error: "Fehler beim Zurücksetzen" };
  }
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(postId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  const post = await db.blogPost.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post || post.authorId !== session.user.id) {
    return { success: false, error: "Nicht berechtigt" };
  }

  try {
    await db.blogPost.delete({ where: { id: postId } });

    revalidatePath("/blog");
    revalidateTag("blog-posts", {});

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "Fehler beim Löschen" };
  }
}

/**
 * Helper: Create or get tags and return connection data
 */
async function createTagConnections(
  tagNames: string[]
): Promise<{ tagId: string }[]> {
  const connections: { tagId: string }[] = [];

  for (const name of tagNames) {
    const slug = generateSlug(name);
    if (!slug) continue;

    let tag = await db.blogTag.findUnique({ where: { slug } });
    if (!tag) {
      tag = await db.blogTag.create({
        data: { slug, name },
      });
    }
    connections.push({ tagId: tag.id });
  }

  return connections;
}
