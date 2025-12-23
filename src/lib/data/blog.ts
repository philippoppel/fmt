import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { PostStatus } from "@prisma/client";

export type SortOption = "relevance" | "newest" | "oldest" | "popular";

export interface BlogPostFilters {
  locale?: string;
  status?: PostStatus;
  categorySlug?: string;
  tagSlug?: string;
  authorId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: SortOption;
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
  isReviewed: boolean;
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
 * Internal function to fetch blog posts
 */
async function fetchBlogPosts(
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
    sortBy = "newest",
  } = filters;

  // Determine orderBy based on sortBy option
  let orderBy: Record<string, unknown>;
  switch (sortBy) {
    case "oldest":
      orderBy = { publishedAt: "asc" };
      break;
    case "popular":
      orderBy = { bookmarks: { _count: "desc" } };
      break;
    case "relevance":
    case "newest":
    default:
      orderBy = { publishedAt: "desc" };
      break;
  }

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
        isReviewed: true,
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
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.blogPost.count({ where }),
  ]);

  return { posts, total };
}

/**
 * Get blog posts with optional filtering (cached for 60 seconds)
 * Search queries bypass cache for fresh results
 */
export async function getBlogPosts(
  filters: BlogPostFilters = {}
): Promise<{ posts: BlogPostWithDetails[]; total: number }> {
  // Don't cache search queries - they need fresh results
  if (filters.search) {
    return fetchBlogPosts(filters);
  }

  // Create cache key from filters
  const cacheKey = [
    "blog-posts",
    filters.status || "published",
    filters.categorySlug || "all",
    filters.tagSlug || "all",
    filters.authorId || "all",
    filters.sortBy || "newest",
    String(filters.page || 1),
    String(filters.limit || 10),
  ];

  const cachedFetch = unstable_cache(
    () => fetchBlogPosts(filters),
    cacheKey,
    { revalidate: 60, tags: ["blog-posts"] }
  );

  return cachedFetch();
}

/**
 * Get a single blog post by slug (cached for 60 seconds)
 */
export async function getBlogPostBySlug(slug: string) {
  const cachedFetch = unstable_cache(
    async () => {
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
          series: {
            select: {
              id: true,
              slug: true,
              titleDE: true,
              titleEN: true,
              posts: {
                where: { status: "published" },
                orderBy: { seriesOrder: "asc" },
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  seriesOrder: true,
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
      });
    },
    ["blog-post", slug],
    { revalidate: 60, tags: ["blog-posts", `blog-post-${slug}`] }
  );

  return cachedFetch();
}

/**
 * Get related posts based on categories with randomization
 * Fetches more candidates than needed and shuffles to ensure variety
 */
export async function getRelatedPosts(
  postId: string,
  categoryIds: string[],
  limit: number = 3,
  excludeIds: string[] = []
) {
  // Fetch more candidates for randomization
  const candidates = await db.blogPost.findMany({
    where: {
      id: { notIn: [postId, ...excludeIds] },
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
    take: limit * 3, // Fetch 3x more for randomization
  });

  // Fisher-Yates shuffle for true randomization
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, limit);
}

/**
 * Get all categories (cached for 5 minutes)
 */
export const getCategories = unstable_cache(
  async () => {
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
  },
  ["blog-categories"],
  { revalidate: 300, tags: ["blog-categories"] }
);

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
  return db.blogCategory.findUnique({
    where: { slug },
  });
}

/**
 * Get popular tags (cached for 5 minutes)
 */
export const getPopularTags = unstable_cache(
  async (limit: number = 20) => {
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
  },
  ["blog-popular-tags"],
  { revalidate: 300, tags: ["blog-tags"] }
);

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
 * Get user's posts with review feedback for author dashboard
 */
export async function getUserPostsWithReviews(userId: string) {
  const posts = await db.blogPost.findMany({
    where: { authorId: userId },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
      scheduledAt: true,
      createdAt: true,
      updatedAt: true,
      readingTimeMinutes: true,
      _count: {
        select: {
          comments: true,
          bookmarks: true,
        },
      },
      reviews: {
        where: { status: "changes_requested" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          feedback: true,
          createdAt: true,
          reviewer: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Transform to include latestFeedback
  return posts.map((post) => ({
    ...post,
    latestFeedback:
      post.status === "draft" && post.reviews.length > 0
        ? {
            feedback: post.reviews[0].feedback,
            createdAt: post.reviews[0].createdAt,
            reviewerName: post.reviews[0].reviewer.name,
          }
        : null,
  }));
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
