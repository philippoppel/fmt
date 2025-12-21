"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { labelInputSchema, type LabelInput } from "@/lib/validations/labelling";
import { validateLabel } from "@/lib/labelling/validation";
import type { ActionResult, Label, LabelWithRater } from "@/types/labelling";
import { Prisma } from "@prisma/client";

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
 * Get or create active taxonomy version
 */
async function getActiveTaxonomyVersion() {
  let taxonomy = await db.taxonomyVersion.findFirst({
    where: { isActive: true },
  });

  if (!taxonomy) {
    // Create initial taxonomy version if none exists
    const { buildTaxonomySchema } = await import("@/lib/labelling/validation");
    const schema = buildTaxonomySchema("v0.1");

    taxonomy = await db.taxonomyVersion.create({
      data: {
        version: "v0.1",
        description: "Initiale Taxonomie basierend auf matching/topics.ts",
        schema: schema as unknown as Prisma.InputJsonValue,
        isActive: true,
      },
    });
  }

  return taxonomy;
}

/**
 * Create a new label for a case
 */
export async function createLabel(
  input: LabelInput
): Promise<ActionResult<Label>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  // Validate input schema
  const schemaValidation = labelInputSchema.safeParse(input);
  if (!schemaValidation.success) {
    return {
      success: false,
      error: schemaValidation.error.issues[0]?.message || "Ungültige Eingabe",
    };
  }

  // Get the case to validate evidence snippets against text length
  const labelCase = await db.labellingCase.findUnique({
    where: { id: input.caseId },
    select: { id: true, text: true },
  });

  if (!labelCase) {
    return { success: false, error: "Fall nicht gefunden" };
  }

  // Validate label semantically
  const labelValidation = validateLabel(
    {
      primaryCategories: input.primaryCategories,
      subcategories: input.subcategories,
      intensity: input.intensity,
      relatedTopics: input.relatedTopics,
      evidenceSnippets: input.evidenceSnippets,
    },
    labelCase.text.length
  );

  if (!labelValidation.valid) {
    return {
      success: false,
      error: labelValidation.errors.map((e) => e.message).join("; "),
    };
  }

  try {
    const taxonomy = await getActiveTaxonomyVersion();

    // Check if user already has a label for this case
    const existingLabel = await db.label.findFirst({
      where: {
        caseId: input.caseId,
        raterId: user.id,
        supersededById: null, // Only check current (not superseded) labels
      },
    });

    if (existingLabel) {
      return {
        success: false,
        error: "Sie haben diesen Fall bereits gelabelt. Nutzen Sie 'Aktualisieren' zum Ändern.",
      };
    }

    const newLabel = await db.label.create({
      data: {
        caseId: input.caseId,
        raterId: user.id,
        taxonomyVersionId: taxonomy.id,
        primaryCategories: input.primaryCategories as Prisma.InputJsonValue,
        subcategories: input.subcategories as Prisma.InputJsonValue,
        intensity: input.intensity as Prisma.InputJsonValue,
        relatedTopics: (input.relatedTopics as Prisma.InputJsonValue) || Prisma.JsonNull,
        uncertain: input.uncertain || false,
        evidenceSnippets: (input.evidenceSnippets as Prisma.InputJsonValue) || Prisma.JsonNull,
      },
    });

    // Update case status to LABELED
    await db.labellingCase.update({
      where: { id: input.caseId },
      data: { status: "LABELED" },
    });

    revalidatePath("/labelling/cases");
    revalidatePath(`/labelling/cases/${input.caseId}`);

    return {
      success: true,
      data: {
        ...newLabel,
        primaryCategories: newLabel.primaryCategories as { key: string; rank: 1 | 2 | 3 }[],
        subcategories: newLabel.subcategories as Record<string, string[]>,
        intensity: newLabel.intensity as Record<string, string[]>,
        relatedTopics: newLabel.relatedTopics as { key: string; strength: "OFTEN" | "SOMETIMES" }[] | null,
        evidenceSnippets: newLabel.evidenceSnippets as { start: number; end: number }[] | null,
      },
    };
  } catch (err) {
    console.error("Create label error:", err);
    return { success: false, error: "Fehler beim Erstellen des Labels" };
  }
}

/**
 * Update an existing label (creates a new label that supersedes the old one)
 */
export async function updateLabel(
  labelId: string,
  input: Omit<LabelInput, "caseId">
): Promise<ActionResult<Label>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  // Find the existing label
  const existingLabel = await db.label.findUnique({
    where: { id: labelId },
    include: { case: { select: { id: true, text: true } } },
  });

  if (!existingLabel) {
    return { success: false, error: "Label nicht gefunden" };
  }

  // Check if user owns this label
  if (existingLabel.raterId !== user.id) {
    return { success: false, error: "Nur eigene Labels können aktualisiert werden" };
  }

  // Check if label is already superseded
  if (existingLabel.supersededById) {
    return { success: false, error: "Dieses Label wurde bereits aktualisiert" };
  }

  // Validate label semantically
  const labelValidation = validateLabel(
    {
      primaryCategories: input.primaryCategories,
      subcategories: input.subcategories,
      intensity: input.intensity,
      relatedTopics: input.relatedTopics,
      evidenceSnippets: input.evidenceSnippets,
    },
    existingLabel.case.text.length
  );

  if (!labelValidation.valid) {
    return {
      success: false,
      error: labelValidation.errors.map((e) => e.message).join("; "),
    };
  }

  try {
    const taxonomy = await getActiveTaxonomyVersion();

    // Create new label and update old one in transaction
    const newLabel = await db.$transaction(async (tx) => {
      // Create new label
      const created = await tx.label.create({
        data: {
          caseId: existingLabel.caseId,
          raterId: user.id,
          taxonomyVersionId: taxonomy.id,
          primaryCategories: input.primaryCategories as Prisma.InputJsonValue,
          subcategories: input.subcategories as Prisma.InputJsonValue,
          intensity: input.intensity as Prisma.InputJsonValue,
          relatedTopics: (input.relatedTopics as Prisma.InputJsonValue) || Prisma.JsonNull,
          uncertain: input.uncertain || false,
          evidenceSnippets: (input.evidenceSnippets as Prisma.InputJsonValue) || Prisma.JsonNull,
        },
      });

      // Update old label to point to new one
      await tx.label.update({
        where: { id: labelId },
        data: { supersededById: created.id },
      });

      return created;
    });

    revalidatePath("/labelling/cases");
    revalidatePath(`/labelling/cases/${existingLabel.caseId}`);

    return {
      success: true,
      data: {
        ...newLabel,
        primaryCategories: newLabel.primaryCategories as { key: string; rank: 1 | 2 | 3 }[],
        subcategories: newLabel.subcategories as Record<string, string[]>,
        intensity: newLabel.intensity as Record<string, string[]>,
        relatedTopics: newLabel.relatedTopics as { key: string; strength: "OFTEN" | "SOMETIMES" }[] | null,
        evidenceSnippets: newLabel.evidenceSnippets as { start: number; end: number }[] | null,
      },
    };
  } catch (err) {
    console.error("Update label error:", err);
    return { success: false, error: "Fehler beim Aktualisieren des Labels" };
  }
}

/**
 * Get all labels for a case
 */
export async function getLabelsForCase(
  caseId: string
): Promise<ActionResult<LabelWithRater[]>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  try {
    const labels = await db.label.findMany({
      where: {
        caseId,
        supersededById: null, // Only get current labels
      },
      include: {
        rater: { select: { id: true, name: true, email: true } },
        taxonomyVersion: { select: { version: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const transformed = labels.map((l) => ({
      ...l,
      primaryCategories: l.primaryCategories as { key: string; rank: 1 | 2 | 3 }[],
      subcategories: l.subcategories as Record<string, string[]>,
      intensity: l.intensity as Record<string, string[]>,
      relatedTopics: l.relatedTopics as { key: string; strength: "OFTEN" | "SOMETIMES" }[] | null,
      evidenceSnippets: l.evidenceSnippets as { start: number; end: number }[] | null,
    }));

    return { success: true, data: transformed as LabelWithRater[] };
  } catch (err) {
    console.error("Get labels for case error:", err);
    return { success: false, error: "Fehler beim Laden der Labels" };
  }
}

/**
 * Get current user's label for a case
 */
export async function getMyLabelForCase(
  caseId: string
): Promise<ActionResult<Label | null>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  try {
    const label = await db.label.findFirst({
      where: {
        caseId,
        raterId: user.id,
        supersededById: null, // Only get current label
      },
    });

    if (!label) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        ...label,
        primaryCategories: label.primaryCategories as { key: string; rank: 1 | 2 | 3 }[],
        subcategories: label.subcategories as Record<string, string[]>,
        intensity: label.intensity as Record<string, string[]>,
        relatedTopics: label.relatedTopics as { key: string; strength: "OFTEN" | "SOMETIMES" }[] | null,
        evidenceSnippets: label.evidenceSnippets as { start: number; end: number }[] | null,
      },
    };
  } catch (err) {
    console.error("Get my label error:", err);
    return { success: false, error: "Fehler beim Laden des Labels" };
  }
}

/**
 * Get label statistics for current user
 */
export async function getMyLabelStats(): Promise<
  ActionResult<{
    totalLabels: number;
    casesLabeled: number;
    lastLabeledAt: Date | null;
    categoryDistribution: Record<string, number>;
  }>
> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  try {
    const labels = await db.label.findMany({
      where: {
        raterId: user.id,
        supersededById: null,
      },
      select: {
        id: true,
        caseId: true,
        createdAt: true,
        primaryCategories: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const uniqueCaseIds = new Set(labels.map((l) => l.caseId));
    const lastLabel = labels[0];

    // Count category distribution
    const categoryDistribution: Record<string, number> = {};
    for (const label of labels) {
      const categories = label.primaryCategories as { key: string; rank: number }[];
      for (const cat of categories) {
        categoryDistribution[cat.key] = (categoryDistribution[cat.key] || 0) + 1;
      }
    }

    return {
      success: true,
      data: {
        totalLabels: labels.length,
        casesLabeled: uniqueCaseIds.size,
        lastLabeledAt: lastLabel?.createdAt || null,
        categoryDistribution,
      },
    };
  } catch (err) {
    console.error("Get my label stats error:", err);
    return { success: false, error: "Fehler beim Laden der Statistiken" };
  }
}
