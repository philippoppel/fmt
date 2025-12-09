"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import type { MatchingCriteria } from "@/types/therapist";

/**
 * Anonymous session ID for ML tracking
 * Uses a cookie to maintain session without user login
 */
const SESSION_COOKIE_NAME = "matching_session_id";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function getOrCreateMatchingSession(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
    });
  }

  return sessionId;
}

/**
 * Track a user interaction with a therapist result
 */
export async function trackInteraction(input: {
  therapistId: string;
  action: "view" | "click" | "contact";
  matchScore?: number;
  searchCriteria?: Partial<MatchingCriteria>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionId = await getOrCreateMatchingSession();

    await db.matchInteraction.create({
      data: {
        sessionId,
        therapistId: input.therapistId,
        action: input.action,
        matchScore: input.matchScore,
        searchCriteria: input.searchCriteria
          ? JSON.parse(JSON.stringify(input.searchCriteria))
          : undefined,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to track interaction:", error);
    return { success: false, error: "Failed to track interaction" };
  }
}

/**
 * Track multiple interactions at once (e.g., batch view tracking)
 */
export async function trackBatchInteractions(
  interactions: Array<{
    therapistId: string;
    action: "view" | "click" | "contact";
    matchScore?: number;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionId = await getOrCreateMatchingSession();

    await db.matchInteraction.createMany({
      data: interactions.map((interaction) => ({
        sessionId,
        therapistId: interaction.therapistId,
        action: interaction.action,
        matchScore: interaction.matchScore,
      })),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to track batch interactions:", error);
    return { success: false, error: "Failed to track batch interactions" };
  }
}

/**
 * Submit user feedback after matching
 */
export async function submitMatchFeedback(input: {
  foundMatch: boolean | null;
  relevanceRating: number | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionId = await getOrCreateMatchingSession();

    await db.matchFeedback.create({
      data: {
        sessionId,
        foundMatch: input.foundMatch,
        relevanceRating: input.relevanceRating,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}

/**
 * Track therapy result views for ML optimization
 * Called when user views matching results
 */
export async function trackResultsView(
  results: Array<{
    therapistId: string;
    matchScore: number;
    rank: number; // Position in results
  }>
): Promise<{ success: boolean }> {
  try {
    const sessionId = await getOrCreateMatchingSession();

    // Track the top results (limit to prevent excessive data)
    const topResults = results.slice(0, 20);

    await db.matchInteraction.createMany({
      data: topResults.map((result) => ({
        sessionId,
        therapistId: result.therapistId,
        action: "view",
        matchScore: result.matchScore,
        searchCriteria: { rank: result.rank },
      })),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to track results view:", error);
    return { success: false };
  }
}
