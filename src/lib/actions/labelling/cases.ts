"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  createCaseSchema,
  importCasesSchema,
  caseFiltersSchema,
  updateCaseStatusSchema,
  type CreateCaseInput,
  type ImportCasesInput,
  type CaseFilters,
} from "@/lib/validations/labelling";
import type {
  ActionResult,
  ImportResult,
  LabellingCase,
  LabellingCaseWithLabels,
} from "@/types/labelling";
import { CaseStatus, Prisma } from "@prisma/client";

/**
 * Check if user has labelling access
 */
async function requireLabellingAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Nicht authentifiziert", user: null };
  }
  if (session.user.role !== "LABELLER" && session.user.role !== "ADMIN") {
    return { error: "Keine Berechtigung für Labelling-Portal", user: null };
  }
  return { error: null, user: session.user };
}

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

/**
 * Create a new case
 */
export async function createCase(
  input: CreateCaseInput
): Promise<ActionResult<LabellingCase>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  const validation = createCaseSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Ungültige Eingabe",
    };
  }

  const data = validation.data;

  try {
    const newCase = await db.labellingCase.create({
      data: {
        text: data.text,
        language: data.language,
        source: data.source,
        metadata: data.metadata as Prisma.InputJsonValue || Prisma.JsonNull,
        createdById: user.id,
        status: "NEW",
      },
    });

    revalidatePath("/labelling/cases");

    return {
      success: true,
      data: {
        ...newCase,
        metadata: newCase.metadata as Record<string, unknown> | null,
      },
    };
  } catch (err) {
    console.error("Create case error:", err);
    return { success: false, error: "Fehler beim Erstellen des Falls" };
  }
}

/**
 * Import multiple cases in bulk
 */
export async function importCases(
  input: ImportCasesInput
): Promise<ActionResult<ImportResult>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  const validation = importCasesSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Ungültige Eingabe",
    };
  }

  const { cases } = validation.data;
  let imported = 0;
  const errors: string[] = [];

  try {
    // Use transaction for bulk import
    await db.$transaction(async (tx) => {
      for (let i = 0; i < cases.length; i++) {
        const caseItem = cases[i];
        try {
          await tx.labellingCase.create({
            data: {
              text: caseItem.text,
              language: caseItem.language || "de",
              source: "IMPORT",
              metadata: caseItem.metadata as Prisma.InputJsonValue || Prisma.JsonNull,
              createdById: user.id,
              status: "NEW",
            },
          });
          imported++;
        } catch (err) {
          errors.push(`Fall ${i + 1}: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`);
        }
      }
    });

    revalidatePath("/labelling/cases");

    return {
      success: true,
      data: {
        imported,
        failed: cases.length - imported,
        errors,
      },
    };
  } catch (err) {
    console.error("Import cases error:", err);
    return { success: false, error: "Fehler beim Import der Fälle" };
  }
}

/**
 * Get cases with filters
 */
export async function getCases(
  filters: Partial<CaseFilters> = {}
): Promise<ActionResult<{ cases: LabellingCaseWithLabels[]; total: number }>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  const validation = caseFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Ungültige Filter",
    };
  }

  const {
    status,
    source,
    createdById,
    search,
    language,
    calibrationOnly,
    limit,
    offset,
  } = validation.data;

  try {
    const where: Prisma.LabellingCaseWhereInput = {};

    if (status) where.status = status;
    if (source) where.source = source;
    if (createdById) where.createdById = createdById;
    if (language) where.language = language;
    if (search) {
      where.text = { contains: search, mode: "insensitive" };
    }
    if (calibrationOnly) {
      where.calibrationPool = { isNot: null };
    }

    const [cases, total] = await Promise.all([
      db.labellingCase.findMany({
        where,
        include: {
          labels: {
            include: {
              rater: { select: { id: true, name: true, email: true } },
              taxonomyVersion: { select: { version: true } },
            },
            orderBy: { createdAt: "desc" },
          },
          calibrationPool: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.labellingCase.count({ where }),
    ]);

    // Transform to proper types
    const transformedCases = cases.map((c) => ({
      ...c,
      metadata: c.metadata as Record<string, unknown> | null,
      labels: c.labels.map((l) => ({
        ...l,
        primaryCategories: l.primaryCategories as { key: string; rank: 1 | 2 | 3 }[],
        subcategories: l.subcategories as Record<string, string[]>,
        intensity: l.intensity as Record<string, string[]>,
        relatedTopics: l.relatedTopics as { key: string; strength: "OFTEN" | "SOMETIMES" }[] | null,
        evidenceSnippets: l.evidenceSnippets as { start: number; end: number }[] | null,
      })),
    }));

    return {
      success: true,
      data: { cases: transformedCases as LabellingCaseWithLabels[], total },
    };
  } catch (err) {
    console.error("Get cases error:", err);
    return { success: false, error: "Fehler beim Laden der Fälle" };
  }
}

/**
 * Get a single case by ID
 */
export async function getCase(
  caseId: string
): Promise<ActionResult<LabellingCaseWithLabels>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  try {
    const foundCase = await db.labellingCase.findUnique({
      where: { id: caseId },
      include: {
        labels: {
          include: {
            rater: { select: { id: true, name: true, email: true } },
            taxonomyVersion: { select: { version: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        calibrationPool: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!foundCase) {
      return { success: false, error: "Fall nicht gefunden" };
    }

    // Transform to proper types
    const transformed = {
      ...foundCase,
      metadata: foundCase.metadata as Record<string, unknown> | null,
      labels: foundCase.labels.map((l) => ({
        ...l,
        primaryCategories: l.primaryCategories as { key: string; rank: 1 | 2 | 3 }[],
        subcategories: l.subcategories as Record<string, string[]>,
        intensity: l.intensity as Record<string, string[]>,
        relatedTopics: l.relatedTopics as { key: string; strength: "OFTEN" | "SOMETIMES" }[] | null,
        evidenceSnippets: l.evidenceSnippets as { start: number; end: number }[] | null,
      })),
    };

    return { success: true, data: transformed as LabellingCaseWithLabels };
  } catch (err) {
    console.error("Get case error:", err);
    return { success: false, error: "Fehler beim Laden des Falls" };
  }
}

/**
 * Delete a case (Admin only)
 */
export async function deleteCase(caseId: string): Promise<ActionResult> {
  const { error, user } = await requireAdmin();
  if (error || !user) {
    return { success: false, error: error || "Admin-Berechtigung erforderlich" };
  }

  try {
    await db.labellingCase.delete({
      where: { id: caseId },
    });

    revalidatePath("/labelling/cases");

    return { success: true };
  } catch (err) {
    console.error("Delete case error:", err);
    return { success: false, error: "Fehler beim Löschen des Falls" };
  }
}

/**
 * Update case status
 */
export async function updateCaseStatus(
  caseId: string,
  status: CaseStatus
): Promise<ActionResult<LabellingCase>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  const validation = updateCaseStatusSchema.safeParse({ caseId, status });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Ungültige Eingabe",
    };
  }

  try {
    const updatedCase = await db.labellingCase.update({
      where: { id: caseId },
      data: { status },
    });

    revalidatePath("/labelling/cases");
    revalidatePath(`/labelling/cases/${caseId}`);

    return {
      success: true,
      data: {
        ...updatedCase,
        metadata: updatedCase.metadata as Record<string, unknown> | null,
      },
    };
  } catch (err) {
    console.error("Update case status error:", err);
    return { success: false, error: "Fehler beim Aktualisieren des Status" };
  }
}

/**
 * Get next unlabeled case for current user
 */
export async function getNextUnlabeledCase(): Promise<ActionResult<LabellingCaseWithLabels | null>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  try {
    // Find a case that this user hasn't labeled yet
    const nextCase = await db.labellingCase.findFirst({
      where: {
        status: "NEW",
        labels: {
          none: {
            raterId: user.id,
          },
        },
      },
      include: {
        labels: {
          include: {
            rater: { select: { id: true, name: true, email: true } },
            taxonomyVersion: { select: { version: true } },
          },
        },
        calibrationPool: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    if (!nextCase) {
      return { success: true, data: null };
    }

    // Transform to proper types
    const transformed = {
      ...nextCase,
      metadata: nextCase.metadata as Record<string, unknown> | null,
      labels: nextCase.labels.map((l) => ({
        ...l,
        primaryCategories: l.primaryCategories as { key: string; rank: 1 | 2 | 3 }[],
        subcategories: l.subcategories as Record<string, string[]>,
        intensity: l.intensity as Record<string, string[]>,
        relatedTopics: l.relatedTopics as { key: string; strength: "OFTEN" | "SOMETIMES" }[] | null,
        evidenceSnippets: l.evidenceSnippets as { start: number; end: number }[] | null,
      })),
    };

    return { success: true, data: transformed as LabellingCaseWithLabels };
  } catch (err) {
    console.error("Get next unlabeled case error:", err);
    return { success: false, error: "Fehler beim Laden des nächsten Falls" };
  }
}
