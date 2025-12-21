"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { triggerModelRunSchema } from "@/lib/validations/labelling";
import type { ActionResult } from "@/types/labelling";
import { Prisma } from "@prisma/client";

/**
 * Check if user is admin
 */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Nicht authentifiziert", user: null };
  }
  if (session.user.role !== "ADMIN") {
    return { error: "Admin-Berechtigung erforderlich", user: null };
  }
  return { error: null, user: session.user };
}

interface ModelRunResult {
  id: string;
  method: string;
  status: string;
}

/**
 * Trigger a new model run
 * Note: This creates the record but doesn't actually run the Python script.
 * In production, you'd spawn a child process or use a job queue.
 */
export async function triggerModelRun(input: {
  method: "knn" | "logreg";
  parameters?: {
    k?: number;
    threshold?: number;
    testSplit?: number;
    randomSeed?: number;
  };
}): Promise<ActionResult<ModelRunResult>> {
  const { error, user } = await requireAdmin();
  if (error || !user) {
    return { success: false, error: error || "Admin-Berechtigung erforderlich" };
  }

  const validation = triggerModelRunSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Ungültige Eingabe",
    };
  }

  const { method, parameters } = validation.data;

  try {
    const modelRun = await db.modelRun.create({
      data: {
        method,
        parameters: parameters as Prisma.InputJsonValue,
        status: "pending",
        triggeredById: user.id,
      },
    });

    revalidatePath("/labelling/model-runs");

    // In production, spawn the Python script here:
    // spawn('python', ['scripts/model_runner/run_baseline.py', ...])

    return {
      success: true,
      data: {
        id: modelRun.id,
        method: modelRun.method,
        status: modelRun.status,
      },
    };
  } catch (err) {
    console.error("Trigger model run error:", err);
    return { success: false, error: "Fehler beim Starten des Modell-Laufs" };
  }
}

interface ModelRunWithUser {
  id: string;
  method: string;
  parameters: Record<string, unknown> | null;
  metrics: Record<string, unknown> | null;
  status: string;
  error: string | null;
  startedAt: Date;
  completedAt: Date | null;
  triggeredBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

/**
 * Get all model runs
 */
export async function getModelRuns(): Promise<ActionResult<ModelRunWithUser[]>> {
  const { error, user } = await requireAdmin();
  if (error || !user) {
    return { success: false, error: error || "Admin-Berechtigung erforderlich" };
  }

  try {
    const runs = await db.modelRun.findMany({
      include: {
        triggeredBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return {
      success: true,
      data: runs.map((run) => ({
        id: run.id,
        method: run.method,
        parameters: run.parameters as Record<string, unknown> | null,
        metrics: run.metrics as Record<string, unknown> | null,
        status: run.status,
        error: run.error,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        triggeredBy: run.triggeredBy,
      })),
    };
  } catch (err) {
    console.error("Get model runs error:", err);
    return { success: false, error: "Fehler beim Laden der Modell-Läufe" };
  }
}

/**
 * Get a single model run
 */
export async function getModelRun(
  id: string
): Promise<ActionResult<ModelRunWithUser | null>> {
  const { error, user } = await requireAdmin();
  if (error || !user) {
    return { success: false, error: error || "Admin-Berechtigung erforderlich" };
  }

  try {
    const run = await db.modelRun.findUnique({
      where: { id },
      include: {
        triggeredBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!run) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        id: run.id,
        method: run.method,
        parameters: run.parameters as Record<string, unknown> | null,
        metrics: run.metrics as Record<string, unknown> | null,
        status: run.status,
        error: run.error,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        triggeredBy: run.triggeredBy,
      },
    };
  } catch (err) {
    console.error("Get model run error:", err);
    return { success: false, error: "Fehler beim Laden des Modell-Laufs" };
  }
}
