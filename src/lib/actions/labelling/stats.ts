"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult, LabellingStats, RaterStats } from "@/types/labelling";
import { CaseSource, CaseStatus } from "@prisma/client";

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
 * Get overall labelling statistics
 */
export async function getLabellingStats(): Promise<ActionResult<LabellingStats>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  try {
    // Total cases
    const totalCases = await db.labellingCase.count();

    // Cases by status
    const casesByStatusRaw = await db.labellingCase.groupBy({
      by: ["status"],
      _count: true,
    });
    const casesByStatus: Record<CaseStatus, number> = {
      NEW: 0,
      LABELED: 0,
      REVIEW: 0,
    };
    for (const item of casesByStatusRaw) {
      casesByStatus[item.status] = item._count;
    }

    // Cases by source
    const casesBySourceRaw = await db.labellingCase.groupBy({
      by: ["source"],
      _count: true,
    });
    const casesBySource: Record<CaseSource, number> = {
      MANUAL: 0,
      IMPORT: 0,
      AI_SEEDED: 0,
    };
    for (const item of casesBySourceRaw) {
      casesBySource[item.source] = item._count;
    }

    // Total labels (current only, not superseded)
    const totalLabels = await db.label.count({
      where: { supersededById: null },
    });

    // Labels by category
    const labels = await db.label.findMany({
      where: { supersededById: null },
      select: { primaryCategories: true },
    });

    const labelsByCategory: Record<string, number> = {};
    for (const label of labels) {
      const categories = label.primaryCategories as { key: string; rank: number }[];
      for (const cat of categories) {
        labelsByCategory[cat.key] = (labelsByCategory[cat.key] || 0) + 1;
      }
    }

    // Labels by rater
    const raterStatsRaw = await db.label.groupBy({
      by: ["raterId"],
      where: { supersededById: null },
      _count: true,
      _max: { createdAt: true },
    });

    const raterIds = raterStatsRaw.map((r) => r.raterId);
    const raters = await db.user.findMany({
      where: { id: { in: raterIds } },
      select: { id: true, name: true, email: true },
    });

    const raterMap = new Map(raters.map((r) => [r.id, r]));

    const labelsByRater: RaterStats[] = [];
    for (const raterStat of raterStatsRaw) {
      const rater = raterMap.get(raterStat.raterId);

      // Count unique cases
      const uniqueCases = await db.label.findMany({
        where: { raterId: raterStat.raterId, supersededById: null },
        select: { caseId: true },
        distinct: ["caseId"],
      });

      labelsByRater.push({
        raterId: raterStat.raterId,
        raterName: rater?.name || rater?.email || "Unbekannt",
        totalLabels: raterStat._count,
        casesLabeled: uniqueCases.length,
        lastLabeledAt: raterStat._max.createdAt,
      });
    }

    // Sort by total labels descending
    labelsByRater.sort((a, b) => b.totalLabels - a.totalLabels);

    // Calibration pool size
    const calibrationPoolSize = await db.calibrationPool.count({
      where: { isActive: true },
    });

    // Average agreement (simplified - just get from calibration stats)
    const calibrationCases = await db.calibrationPool.findMany({
      where: { isActive: true },
      select: { caseId: true },
    });

    let averageAgreement: number | null = null;
    if (calibrationCases.length > 0) {
      // Import dynamically to avoid circular dependency
      const { getCalibrationAgreement } = await import("./calibration");

      let totalAgreement = 0;
      let countWithMultiple = 0;

      for (const cp of calibrationCases) {
        const labelCount = await db.label.count({
          where: { caseId: cp.caseId, supersededById: null },
        });

        if (labelCount >= 2) {
          const result = await getCalibrationAgreement(cp.caseId);
          if (result.success && result.data) {
            totalAgreement += result.data.jaccardSimilarity;
            countWithMultiple++;
          }
        }
      }

      if (countWithMultiple > 0) {
        averageAgreement = totalAgreement / countWithMultiple;
      }
    }

    return {
      success: true,
      data: {
        totalCases,
        casesByStatus,
        casesBySource,
        totalLabels,
        labelsByCategory,
        labelsByRater,
        calibrationPoolSize,
        averageAgreement,
      },
    };
  } catch (err) {
    console.error("Get labelling stats error:", err);
    return { success: false, error: "Fehler beim Laden der Statistiken" };
  }
}

/**
 * Get category coverage (categories with few examples)
 */
export async function getCategoryCoverage(): Promise<
  ActionResult<{
    coverage: { category: string; count: number; percentage: number }[];
    underrepresented: string[];
    threshold: number;
  }>
> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  try {
    // Get all labels
    const labels = await db.label.findMany({
      where: { supersededById: null },
      select: { primaryCategories: true },
    });

    // Count by category
    const categoryCounts: Record<string, number> = {};
    let totalLabels = 0;

    for (const label of labels) {
      const categories = label.primaryCategories as { key: string; rank: number }[];
      for (const cat of categories) {
        categoryCounts[cat.key] = (categoryCounts[cat.key] || 0) + 1;
        totalLabels++;
      }
    }

    // All possible categories
    const { MATCHING_TOPICS } = await import("@/lib/matching/topics");
    const allCategories = MATCHING_TOPICS
      .filter((t) => t.id !== "other")
      .map((t) => t.id);

    // Calculate coverage
    const coverage = allCategories.map((category) => ({
      category,
      count: categoryCounts[category] || 0,
      percentage: totalLabels > 0 ? ((categoryCounts[category] || 0) / totalLabels) * 100 : 0,
    }));

    // Sort by count ascending
    coverage.sort((a, b) => a.count - b.count);

    // Threshold: categories with less than 5% of total labels
    const threshold = 5;
    const underrepresented = coverage
      .filter((c) => c.percentage < threshold)
      .map((c) => c.category);

    return {
      success: true,
      data: { coverage, underrepresented, threshold },
    };
  } catch (err) {
    console.error("Get category coverage error:", err);
    return { success: false, error: "Fehler beim Berechnen der Kategorie-Abdeckung" };
  }
}
