import { NextResponse } from "next/server";
import { publishScheduledPosts } from "@/lib/actions/blog/scheduled";

/**
 * Cron endpoint to publish scheduled blog posts
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/publish-scheduled",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  // Verify cron secret for security (optional but recommended)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await publishScheduledPosts();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      publishedCount: result.publishedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron publish-scheduled error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
