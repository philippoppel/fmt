"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type {
  ActionResult,
  AgreementMetrics,
  CalibrationCaseView,
  CategoryAgreement,
} from "@/types/labelling";

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
 * Add a case to the calibration pool (Admin only)
 */
export async function addToCalibrationPool(
  caseId: string
): Promise<ActionResult> {
  const { error, user } = await requireAdmin();
  if (error || !user) {
    return { success: false, error: error || "Admin-Berechtigung erforderlich" };
  }

  try {
    // Check if case exists
    const existingCase = await db.labellingCase.findUnique({
      where: { id: caseId },
    });

    if (!existingCase) {
      return { success: false, error: "Fall nicht gefunden" };
    }

    // Check if already in pool
    const existing = await db.calibrationPool.findUnique({
      where: { caseId },
    });

    if (existing) {
      // Reactivate if inactive
      if (!existing.isActive) {
        await db.calibrationPool.update({
          where: { caseId },
          data: { isActive: true },
        });
      }
      return { success: true };
    }

    await db.calibrationPool.create({
      data: { caseId, isActive: true },
    });

    revalidatePath("/labelling/calibration");
    revalidatePath("/labelling/cases");

    return { success: true };
  } catch (err) {
    console.error("Add to calibration pool error:", err);
    return { success: false, error: "Fehler beim Hinzufügen zum Kalibrierungs-Pool" };
  }
}

/**
 * Remove a case from the calibration pool (Admin only)
 */
export async function removeFromCalibrationPool(
  caseId: string
): Promise<ActionResult> {
  const { error, user } = await requireAdmin();
  if (error || !user) {
    return { success: false, error: error || "Admin-Berechtigung erforderlich" };
  }

  try {
    await db.calibrationPool.update({
      where: { caseId },
      data: { isActive: false },
    });

    revalidatePath("/labelling/calibration");
    revalidatePath("/labelling/cases");

    return { success: true };
  } catch (err) {
    console.error("Remove from calibration pool error:", err);
    return { success: false, error: "Fehler beim Entfernen aus dem Kalibrierungs-Pool" };
  }
}

/**
 * Calculate Jaccard similarity between two sets
 */
function jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
  if (set1.size === 0 && set2.size === 0) return 1;

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Calculate agreement metrics for a calibration case
 */
export async function getCalibrationAgreement(
  caseId: string
): Promise<ActionResult<AgreementMetrics>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  try {
    // Get all current labels for this case
    const labels = await db.label.findMany({
      where: {
        caseId,
        supersededById: null,
      },
      include: {
        rater: { select: { id: true, name: true } },
      },
    });

    if (labels.length < 2) {
      return {
        success: true,
        data: {
          caseId,
          raterCount: labels.length,
          cohensKappa: null,
          jaccardSimilarity: 1,
          categoryAgreement: [],
          hasConflict: false,
        },
      };
    }

    // Calculate Jaccard similarity for primary categories
    const categorySets = labels.map((l) => {
      const cats = l.primaryCategories as { key: string; rank: number }[];
      return new Set(cats.map((c) => c.key));
    });

    let totalJaccard = 0;
    let pairCount = 0;

    for (let i = 0; i < categorySets.length; i++) {
      for (let j = i + 1; j < categorySets.length; j++) {
        totalJaccard += jaccardSimilarity(categorySets[i], categorySets[j]);
        pairCount++;
      }
    }

    const avgJaccard = pairCount > 0 ? totalJaccard / pairCount : 1;

    // Calculate per-category agreement
    const allCategories = new Set<string>();
    for (const label of labels) {
      const cats = label.primaryCategories as { key: string; rank: number }[];
      cats.forEach((c) => allCategories.add(c.key));
    }

    const categoryAgreement: CategoryAgreement[] = [];
    for (const category of allCategories) {
      const ranksForCategory: number[] = [];

      for (const label of labels) {
        const cats = label.primaryCategories as { key: string; rank: number }[];
        const found = cats.find((c) => c.key === category);
        if (found) {
          ranksForCategory.push(found.rank);
        }
      }

      // If not all raters have this category, it's a disagreement
      const allAgree = ranksForCategory.length === labels.length;
      const sameRank =
        allAgree && new Set(ranksForCategory).size === 1;

      categoryAgreement.push({
        category,
        agreedRanks: sameRank ? ranksForCategory : [],
        disagreedRanks: sameRank ? [] : ranksForCategory,
      });
    }

    // Determine if there's a conflict (Jaccard < 0.5)
    const hasConflict = avgJaccard < 0.5;

    return {
      success: true,
      data: {
        caseId,
        raterCount: labels.length,
        cohensKappa: null, // Could implement Cohen's Kappa for binary agreement
        jaccardSimilarity: avgJaccard,
        categoryAgreement,
        hasConflict,
      },
    };
  } catch (err) {
    console.error("Get calibration agreement error:", err);
    return { success: false, error: "Fehler beim Berechnen der Agreement-Metriken" };
  }
}

/**
 * Get all calibration cases with their labels and agreement
 */
export async function getCalibrationCases(): Promise<
  ActionResult<CalibrationCaseView[]>
> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  try {
    const calibrationCases = await db.calibrationPool.findMany({
      where: { isActive: true },
      include: {
        case: {
          include: {
            labels: {
              where: { supersededById: null },
              include: {
                rater: { select: { id: true, name: true, email: true } },
                taxonomyVersion: { select: { version: true } },
              },
            },
            createdBy: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { addedAt: "desc" },
    });

    // Calculate agreement for each case
    const casesWithAgreement: CalibrationCaseView[] = [];

    for (const cp of calibrationCases) {
      const agreementResult = await getCalibrationAgreement(cp.caseId);
      const agreement = agreementResult.success ? agreementResult.data : null;

      casesWithAgreement.push({
        ...cp.case,
        metadata: cp.case.metadata as Record<string, unknown> | null,
        labels: cp.case.labels.map((l) => ({
          ...l,
          primaryCategories: l.primaryCategories as { key: string; rank: 1 | 2 | 3 }[],
          subcategories: l.subcategories as Record<string, string[]>,
          intensity: l.intensity as Record<string, string[]>,
          relatedTopics: l.relatedTopics as { key: string; strength: "OFTEN" | "SOMETIMES" }[] | null,
          evidenceSnippets: l.evidenceSnippets as { start: number; end: number }[] | null,
        })),
        calibrationPool: cp,
        agreementMetrics: agreement || null,
      } as CalibrationCaseView);
    }

    return { success: true, data: casesWithAgreement };
  } catch (err) {
    console.error("Get calibration cases error:", err);
    return { success: false, error: "Fehler beim Laden der Kalibrierungsfälle" };
  }
}

/**
 * Get overall calibration statistics
 */
export async function getCalibrationStats(): Promise<
  ActionResult<{
    totalCalibrationCases: number;
    casesWithMultipleLabels: number;
    averageAgreement: number;
    conflictCount: number;
  }>
> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  try {
    const calibrationCases = await db.calibrationPool.findMany({
      where: { isActive: true },
      select: { caseId: true },
    });

    let casesWithMultipleLabels = 0;
    let totalAgreement = 0;
    let conflictCount = 0;

    for (const cp of calibrationCases) {
      const labels = await db.label.count({
        where: { caseId: cp.caseId, supersededById: null },
      });

      if (labels >= 2) {
        casesWithMultipleLabels++;
        const agreementResult = await getCalibrationAgreement(cp.caseId);
        if (agreementResult.success && agreementResult.data) {
          totalAgreement += agreementResult.data.jaccardSimilarity;
          if (agreementResult.data.hasConflict) {
            conflictCount++;
          }
        }
      }
    }

    const averageAgreement =
      casesWithMultipleLabels > 0
        ? totalAgreement / casesWithMultipleLabels
        : 1;

    return {
      success: true,
      data: {
        totalCalibrationCases: calibrationCases.length,
        casesWithMultipleLabels,
        averageAgreement,
        conflictCount,
      },
    };
  } catch (err) {
    console.error("Get calibration stats error:", err);
    return { success: false, error: "Fehler beim Laden der Kalibrierungsstatistiken" };
  }
}
