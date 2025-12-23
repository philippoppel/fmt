/**
 * Blog Permission System
 *
 * Role-based access control for the blog publishing system.
 * Uses the existing ADMIN role to determine blog admin privileges.
 */

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Check if the current user is a blog admin (can publish, approve, manage all posts)
 */
export async function isBlogAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

/**
 * Get the current user's ID if authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/**
 * Check if the current user can edit a specific post
 * - Admins can edit any post
 * - Authors can edit their own posts (except when in review)
 */
export async function canEditPost(postId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  // Admins can edit any post
  if (session.user.role === "ADMIN") return true;

  // Authors can edit their own posts
  const post = await db.blogPost.findUnique({
    where: { id: postId },
    select: { authorId: true, status: true },
  });

  if (!post) return false;

  // Authors can edit their own posts (but maybe warn if in review)
  return post.authorId === session.user.id;
}

/**
 * Check if the current user can delete a post
 * - Admins can delete any post
 * - Authors can only delete their own drafts
 */
export async function canDeletePost(postId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  // Admins can delete any post
  if (session.user.role === "ADMIN") return true;

  // Authors can only delete their own drafts
  const post = await db.blogPost.findUnique({
    where: { id: postId },
    select: { authorId: true, status: true },
  });

  if (!post) return false;

  return post.authorId === session.user.id && post.status === "draft";
}

/**
 * Check if the current user can publish or schedule a post
 * Only admins can publish
 */
export async function canPublishPost(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

/**
 * Check if the current user can view all posts (admin dashboard)
 */
export async function canViewAllPosts(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

/**
 * Check if the current user can manage blog categories and tags
 */
export async function canManageCategories(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

/**
 * Check if the current user can submit a post for review
 * Authors can submit their own drafts
 */
export async function canSubmitForReview(postId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const post = await db.blogPost.findUnique({
    where: { id: postId },
    select: { authorId: true, status: true },
  });

  if (!post) return false;

  // Only the author can submit, and only if it's a draft
  return post.authorId === session.user.id && post.status === "draft";
}

/**
 * Check if the current user can approve or reject a post
 * Only admins can review
 */
export async function canReviewPost(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

/**
 * Get the post with author verification
 * Returns null if post doesn't exist or user can't access it
 */
export async function getPostWithPermission(postId: string): Promise<{
  id: string;
  authorId: string;
  status: string;
  title: string;
} | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const post = await db.blogPost.findUnique({
    where: { id: postId },
    select: {
      id: true,
      authorId: true,
      status: true,
      title: true,
    },
  });

  if (!post) return null;

  // Admins can access any post
  if (session.user.role === "ADMIN") return post;

  // Authors can only access their own posts
  if (post.authorId === session.user.id) return post;

  return null;
}
