import { db } from "@/lib/db";
import type { PostStatus } from "@prisma/client";

export interface BlogPostFilters {
  locale?: string;
  status?: PostStatus;
  categorySlug?: string;
  tagSlug?: string;
  authorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BlogPostWithDetails {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  summaryShort: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  readingTimeMinutes: number;
  publishedAt: Date | null;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  categories: Array<{
    category: {
      id: string;
      slug: string;
      nameDE: string;
      nameEN: string;
      color: string | null;
    };
  }>;
  tags: Array<{
    tag: {
      id: string;
      slug: string;
      name: string;
    };
  }>;
  _count: {
    comments: number;
    bookmarks: number;
  };
}

/**
 * Get blog posts with optional filtering
 */
export async function getBlogPosts(
  filters: BlogPostFilters = {}
): Promise<{ posts: BlogPostWithDetails[]; total: number }> {
  const {
    status = "published",
    categorySlug,
    tagSlug,
    authorId,
    search,
    page = 1,
    limit = 10,
  } = filters;

  const where: Record<string, unknown> = {
    status,
  };

  if (categorySlug) {
    where.categories = {
      some: {
        category: { slug: categorySlug },
      },
    };
  }

  if (tagSlug) {
    where.tags = {
      some: {
        tag: { slug: tagSlug },
      },
    };
  }

  if (authorId) {
    where.authorId = authorId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];
  }

  const [posts, total] = await Promise.all([
    db.blogPost.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        summaryShort: true,
        featuredImage: true,
        featuredImageAlt: true,
        readingTimeMinutes: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                slug: true,
                nameDE: true,
                nameEN: true,
                color: true,
              },
            },
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: { where: { isApproved: true } },
            bookmarks: true,
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.blogPost.count({ where }),
  ]);

  return { posts, total };
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string) {
  return db.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      categories: {
        select: {
          category: {
            select: {
              id: true,
              slug: true,
              nameDE: true,
              nameEN: true,
              color: true,
              icon: true,
            },
          },
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
        },
      },
      citations: {
        select: {
          id: true,
          doi: true,
          title: true,
          authors: true,
          inlineKey: true,
          formattedAPA: true,
          year: true,
        },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: {
          comments: { where: { isApproved: true } },
          bookmarks: true,
        },
      },
    },
  });
}

/**
 * Get related posts based on categories
 */
export async function getRelatedPosts(
  postId: string,
  categoryIds: string[],
  limit: number = 3
) {
  return db.blogPost.findMany({
    where: {
      id: { not: postId },
      status: "published",
      categories: {
        some: {
          categoryId: { in: categoryIds },
        },
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      readingTimeMinutes: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

/**
 * Get all categories
 */
export async function getCategories() {
  return db.blogCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          posts: {
            where: {
              post: { status: "published" },
            },
          },
        },
      },
    },
  });
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
  return db.blogCategory.findUnique({
    where: { slug },
  });
}

/**
 * Get popular tags
 */
export async function getPopularTags(limit: number = 20) {
  const tags = await db.blogTag.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: {
              post: { status: "published" },
            },
          },
        },
      },
    },
    orderBy: {
      posts: {
        _count: "desc",
      },
    },
    take: limit,
  });

  return tags.filter((tag) => tag._count.posts > 0);
}

/**
 * Get tag by slug
 */
export async function getTagBySlug(slug: string) {
  return db.blogTag.findUnique({
    where: { slug },
  });
}

/**
 * Get user's posts (for dashboard)
 */
export async function getUserPosts(userId: string, status?: PostStatus) {
  const where: Record<string, unknown> = { authorId: userId };
  if (status) {
    where.status = status;
  }

  return db.blogPost.findMany({
    where,
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      readingTimeMinutes: true,
      _count: {
        select: {
          comments: true,
          bookmarks: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Get post by ID for editing
 */
export async function getPostForEdit(postId: string, userId: string) {
  const post = await db.blogPost.findUnique({
    where: { id: postId },
    include: {
      categories: {
        select: { categoryId: true },
      },
      tags: {
        select: {
          tag: {
            select: { name: true },
          },
        },
      },
      citations: true,
    },
  });

  if (!post || post.authorId !== userId) {
    return null;
  }

  return post;
}
