"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";

interface SeriesInput {
  title: string;
  titleDE: string;
  titleEN: string;
  description?: string;
  descriptionDE?: string;
  descriptionEN?: string;
  coverImage?: string;
  coverImageAlt?: string;
  isPublished?: boolean;
}

/**
 * Create a new blog series
 */
export async function createSeries(input: SeriesInput): Promise<{
  success: boolean;
  seriesId?: string;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    // Generate slug from title
    const slug = input.title
      .toLowerCase()
      .replace(/[äÄ]/g, "ae")
      .replace(/[öÖ]/g, "oe")
      .replace(/[üÜ]/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Ensure unique slug
    let finalSlug = slug;
    let counter = 1;
    while (await db.blogSeries.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const series = await db.blogSeries.create({
      data: {
        slug: finalSlug,
        title: input.title,
        titleDE: input.titleDE,
        titleEN: input.titleEN,
        description: input.description,
        descriptionDE: input.descriptionDE,
        descriptionEN: input.descriptionEN,
        coverImage: input.coverImage,
        coverImageAlt: input.coverImageAlt,
        isPublished: input.isPublished ?? false,
        authorId: session.user.id,
      },
    });

    revalidateTag("blog-series", {});

    return { success: true, seriesId: series.id };
  } catch (error) {
    console.error("Create series error:", error);
    return { success: false, error: "Fehler beim Erstellen der Serie" };
  }
}

/**
 * Update a blog series
 */
export async function updateSeries(
  seriesId: string,
  input: Partial<SeriesInput>
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    const series = await db.blogSeries.findUnique({
      where: { id: seriesId },
      select: { authorId: true },
    });

    if (!series) {
      return { success: false, error: "Serie nicht gefunden" };
    }

    // Check permission
    const isAdmin = session.user.role === "ADMIN";
    const isAuthor = series.authorId === session.user.id;
    if (!isAdmin && !isAuthor) {
      return { success: false, error: "Keine Berechtigung" };
    }

    await db.blogSeries.update({
      where: { id: seriesId },
      data: {
        title: input.title,
        titleDE: input.titleDE,
        titleEN: input.titleEN,
        description: input.description,
        descriptionDE: input.descriptionDE,
        descriptionEN: input.descriptionEN,
        coverImage: input.coverImage,
        coverImageAlt: input.coverImageAlt,
        isPublished: input.isPublished,
      },
    });

    revalidateTag("blog-series", {});

    return { success: true };
  } catch (error) {
    console.error("Update series error:", error);
    return { success: false, error: "Fehler beim Aktualisieren der Serie" };
  }
}

/**
 * Delete a blog series
 */
export async function deleteSeries(
  seriesId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    const series = await db.blogSeries.findUnique({
      where: { id: seriesId },
      select: { authorId: true },
    });

    if (!series) {
      return { success: false, error: "Serie nicht gefunden" };
    }

    // Check permission
    const isAdmin = session.user.role === "ADMIN";
    const isAuthor = series.authorId === session.user.id;
    if (!isAdmin && !isAuthor) {
      return { success: false, error: "Keine Berechtigung" };
    }

    // Remove series from all posts
    await db.blogPost.updateMany({
      where: { seriesId },
      data: { seriesId: null, seriesOrder: null },
    });

    // Delete the series
    await db.blogSeries.delete({
      where: { id: seriesId },
    });

    revalidateTag("blog-series", {});

    return { success: true };
  } catch (error) {
    console.error("Delete series error:", error);
    return { success: false, error: "Fehler beim Löschen der Serie" };
  }
}

/**
 * Add a post to a series
 */
export async function addPostToSeries(
  postId: string,
  seriesId: string,
  order?: number
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    const post = await db.blogPost.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return { success: false, error: "Artikel nicht gefunden" };
    }

    // Check permission
    const isAdmin = session.user.role === "ADMIN";
    const isAuthor = post.authorId === session.user.id;
    if (!isAdmin && !isAuthor) {
      return { success: false, error: "Keine Berechtigung" };
    }

    // Get max order in series if not provided
    let seriesOrder = order;
    if (seriesOrder === undefined) {
      const maxOrder = await db.blogPost.aggregate({
        where: { seriesId },
        _max: { seriesOrder: true },
      });
      seriesOrder = (maxOrder._max.seriesOrder || 0) + 1;
    }

    await db.blogPost.update({
      where: { id: postId },
      data: { seriesId, seriesOrder },
    });

    revalidateTag("blog-series", {});
    revalidateTag("blog-posts", {});

    return { success: true };
  } catch (error) {
    console.error("Add post to series error:", error);
    return { success: false, error: "Fehler beim Hinzufügen zur Serie" };
  }
}

/**
 * Remove a post from a series
 */
export async function removePostFromSeries(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  try {
    const post = await db.blogPost.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return { success: false, error: "Artikel nicht gefunden" };
    }

    // Check permission
    const isAdmin = session.user.role === "ADMIN";
    const isAuthor = post.authorId === session.user.id;
    if (!isAdmin && !isAuthor) {
      return { success: false, error: "Keine Berechtigung" };
    }

    await db.blogPost.update({
      where: { id: postId },
      data: { seriesId: null, seriesOrder: null },
    });

    revalidateTag("blog-series", {});
    revalidateTag("blog-posts", {});

    return { success: true };
  } catch (error) {
    console.error("Remove post from series error:", error);
    return { success: false, error: "Fehler beim Entfernen aus der Serie" };
  }
}

/**
 * Get all series for current user
 */
export async function getUserSeries() {
  const session = await auth();
  if (!session?.user?.id) {
    return { series: [], error: "Nicht authentifiziert" };
  }

  try {
    const isAdmin = session.user.role === "ADMIN";

    const series = await db.blogSeries.findMany({
      where: isAdmin ? {} : { authorId: session.user.id },
      include: {
        _count: { select: { posts: true } },
        author: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { series };
  } catch (error) {
    console.error("Get user series error:", error);
    return { series: [], error: "Fehler beim Laden der Serien" };
  }
}

/**
 * Get a series by slug with its posts
 */
export async function getSeriesBySlug(slug: string) {
  try {
    const series = await db.blogSeries.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, image: true } },
        posts: {
          where: { status: "published" },
          orderBy: { seriesOrder: "asc" },
          select: {
            id: true,
            slug: true,
            title: true,
            summaryShort: true,
            featuredImage: true,
            readingTimeMinutes: true,
            seriesOrder: true,
          },
        },
      },
    });

    return { series };
  } catch (error) {
    console.error("Get series by slug error:", error);
    return { series: null, error: "Fehler beim Laden der Serie" };
  }
}
