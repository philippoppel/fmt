import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { suggestLabels } from "@/lib/actions/labelling/suggestions";

/**
 * POST /api/labelling/suggest-labels
 *
 * Analyzes case text and returns AI-suggested labels.
 * Requires LABELLER or ADMIN role.
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    // Check role
    if (session.user.role !== "LABELLER" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { text } = body as { text?: string };

    // Validate input
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text ist erforderlich" },
        { status: 400 }
      );
    }

    if (text.trim().length < 20) {
      return NextResponse.json(
        { error: "Text muss mindestens 20 Zeichen haben" },
        { status: 400 }
      );
    }

    // Get AI suggestions
    const suggestion = await suggestLabels(text);

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error("Suggest labels API error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
