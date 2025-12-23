import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * Track a blog post view
 * POST /api/blog/track-view
 * Body: { postId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();

    if (!postId || typeof postId !== "string") {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await db.blogPost.findUnique({
      where: { id: postId },
      select: { id: true, status: true },
    });

    if (!post || post.status !== "published") {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Check for unique view using cookie
    const cookieStore = await cookies();
    const viewedPosts = cookieStore.get("viewed_posts")?.value || "";
    const viewedPostIds = viewedPosts ? viewedPosts.split(",") : [];
    const isUniqueView = !viewedPostIds.includes(postId);

    // Increment view counts
    await db.blogPost.update({
      where: { id: postId },
      data: {
        viewCount: { increment: 1 },
        ...(isUniqueView && { uniqueViewCount: { increment: 1 } }),
      },
    });

    // Set cookie to track this view (expires in 24 hours)
    if (isUniqueView) {
      const newViewedPosts = [...viewedPostIds, postId].slice(-100).join(",");
      const response = NextResponse.json({ success: true, isUnique: true });
      response.cookies.set("viewed_posts", newViewedPosts, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
      });
      return response;
    }

    return NextResponse.json({ success: true, isUnique: false });
  } catch (error) {
    console.error("Track view error:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}
