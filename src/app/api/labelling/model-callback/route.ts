import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Callback endpoint for Python model runner.
 * Receives training results and updates the ModelRun record.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { runId, status, metrics, error } = body as {
      runId: string;
      status: "completed" | "failed";
      metrics?: Record<string, unknown>;
      error?: string;
    };

    if (!runId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: runId, status" },
        { status: 400 }
      );
    }

    // Find the model run
    const modelRun = await db.modelRun.findUnique({
      where: { id: runId },
    });

    if (!modelRun) {
      return NextResponse.json(
        { error: "Model run not found" },
        { status: 404 }
      );
    }

    // Update the model run
    await db.modelRun.update({
      where: { id: runId },
      data: {
        status,
        metrics: metrics as Prisma.InputJsonValue || Prisma.JsonNull,
        error: error || null,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Model callback error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
