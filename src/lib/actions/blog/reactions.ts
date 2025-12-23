"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { createHash } from "crypto";

export type ReactionType = "like" | "love" | "insightful" | "helpful";

const REACTION_TYPES: ReactionType[] = ["like", "love", "insightful", "helpful"];

/**
 * Get anonymous ID from cookies or create one
 */
async function getAnonymousId(): Promise<string> {
  const cookieStore = await cookies();
  let anonymousId = cookieStore.get("reaction_id")?.value;

  if (!anonymousId) {
    anonymousId = createHash("sha256")
      .update(Date.now().toString() + Math.random().toString())
      .digest("hex")
      .slice(0, 32);
  }

  return anonymousId;
}

/**
 * Toggle a reaction on a post
 */
export async function toggleReaction(
  postId: string,
  type: ReactionType
): Promise<{ success: boolean; added: boolean; error?: string }> {
  if (!REACTION_TYPES.includes(type)) {
    return { success: false, added: false, error: "Ungültiger Reaktionstyp" };
  }

  const session = await auth();
  const userId = session?.user?.id;
  const anonymousId = userId ? null : await getAnonymousId();

  try {
    // Check if post exists and is published
    const post = await db.blogPost.findUnique({
      where: { id: postId },
      select: { status: true },
    });

    if (!post || post.status !== "published") {
      return { success: false, added: false, error: "Artikel nicht gefunden" };
    }

    // Check for existing reaction
    const existingReaction = await db.blogReaction.findFirst({
      where: {
        postId,
        type,
        ...(userId ? { userId } : { anonymousId }),
      },
    });

    if (existingReaction) {
      // Remove reaction
      await db.blogReaction.delete({
        where: { id: existingReaction.id },
      });
      return { success: true, added: false };
    } else {
      // Add reaction
      await db.blogReaction.create({
        data: {
          postId,
          type,
          userId,
          anonymousId,
        },
      });
      return { success: true, added: true };
    }
  } catch (error) {
    console.error("Toggle reaction error:", error);
    return { success: false, added: false, error: "Fehler bei der Reaktion" };
  }
}

/**
 * Get reactions for a post
 */
export async function getPostReactions(postId: string): Promise<{
  reactions: Record<ReactionType, number>;
  userReactions: ReactionType[];
}> {
  const session = await auth();
  const userId = session?.user?.id;
  const anonymousId = userId ? null : await getAnonymousId();

  try {
    // Get reaction counts
    const reactionCounts = await db.blogReaction.groupBy({
      by: ["type"],
      where: { postId },
      _count: { type: true },
    });

    const reactions: Record<ReactionType, number> = {
      like: 0,
      love: 0,
      insightful: 0,
      helpful: 0,
    };

    for (const count of reactionCounts) {
      if (REACTION_TYPES.includes(count.type as ReactionType)) {
        reactions[count.type as ReactionType] = count._count.type;
      }
    }

    // Get user's reactions
    const userReactionRecords = await db.blogReaction.findMany({
      where: {
        postId,
        ...(userId ? { userId } : { anonymousId }),
      },
      select: { type: true },
    });

    const userReactions = userReactionRecords
      .map((r) => r.type)
      .filter((t): t is ReactionType => REACTION_TYPES.includes(t as ReactionType));

    return { reactions, userReactions };
  } catch (error) {
    console.error("Get reactions error:", error);
    return {
      reactions: { like: 0, love: 0, insightful: 0, helpful: 0 },
      userReactions: [],
    };
  }
}
