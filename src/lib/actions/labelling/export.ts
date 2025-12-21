"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { exportOptionsSchema, type ExportOptions } from "@/lib/validations/labelling";
import type {
  ActionResult,
  ExportResult,
  ExportReport,
  ConflictCase,
  ExportedCase,
} from "@/types/labelling";

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
 * Get export preview (counts, conflicts) without generating file
 */
export async function getExportPreview(
  options: ExportOptions
): Promise<
  ActionResult<{
    totalCases: number;
    exportableCases: number;
    conflictCases: number;
    conflicts: ConflictCase[];
  }>
> {
  const { error, user } = await requireAdmin();
  if (error || !user) {
    return { success: false, error: error || "Admin-Berechtigung erforderlich" };
  }

  const validation = exportOptionsSchema.safeParse(options);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Ungültige Optionen",
    };
  }

  const opts = validation.data;

  try {
    // Build where clause for cases
    const whereCase: Record<string, unknown> = {
      status: { in: ["LABELED", "REVIEW"] },
    };

    if (opts.fromDate) {
      whereCase.createdAt = { ...(whereCase.createdAt as object), gte: opts.fromDate };
    }
    if (opts.toDate) {
      whereCase.createdAt = { ...(whereCase.createdAt as object), lte: opts.toDate };
    }

    // Get all labeled cases
    const cases = await db.labellingCase.findMany({
      where: whereCase,
      include: {
        labels: {
          where: { supersededById: null },
          include: { rater: { select: { id: true } } },
        },
        calibrationPool: true,
      },
    });

    const conflicts: ConflictCase[] = [];
    let exportableCases = 0;

    for (const c of cases) {
      if (c.labels.length === 0) continue;

      // Check for conflicts in calibration cases
      if (c.calibrationPool && c.labels.length > 1) {
        // Check if primary categories agree
        const categorySets = c.labels.map((l) => {
          const cats = l.primaryCategories as { key: string; rank: number }[];
          return new Set(cats.map((cat) => cat.key));
        });

        // Calculate Jaccard similarity
        let hasConflict = false;
        const disagreementCategories = new Set<string>();

        for (let i = 0; i < categorySets.length && !hasConflict; i++) {
          for (let j = i + 1; j < categorySets.length; j++) {
            const intersection = new Set(
              [...categorySets[i]].filter((x) => categorySets[j].has(x))
            );
            const union = new Set([...categorySets[i], ...categorySets[j]]);
            const jaccard = intersection.size / union.size;

            if (jaccard < 0.5) {
              hasConflict = true;
              // Find disagreement categories
              for (const cat of union) {
                if (!categorySets[i].has(cat) || !categorySets[j].has(cat)) {
                  disagreementCategories.add(cat);
                }
              }
            }
          }
        }

        if (hasConflict) {
          conflicts.push({
            caseId: c.id,
            raterCount: c.labels.length,
            disagreementCategories: [...disagreementCategories],
          });
          continue;
        }
      }

      // Check uncertain filter
      if (!opts.includeUncertain) {
        const hasUncertain = c.labels.some((l) => l.uncertain);
        if (hasUncertain) continue;
      }

      exportableCases++;
    }

    return {
      success: true,
      data: {
        totalCases: cases.length,
        exportableCases,
        conflictCases: conflicts.length,
        conflicts,
      },
    };
  } catch (err) {
    console.error("Get export preview error:", err);
    return { success: false, error: "Fehler beim Erstellen der Vorschau" };
  }
}

/**
 * Generate JSONL export content
 */
function generateJSONL(
  cases: Array<{
    id: string;
    text: string;
    taxonomyVersion: string;
    label: {
      primaryCategories: { key: string; rank: number }[];
      subcategories: Record<string, string[]>;
      intensity: Record<string, string[]>;
      relatedTopics: { key: string; strength: string }[] | null;
      uncertain: boolean;
    };
  }>
): string {
  const lines = cases.map((c) => {
    const exported: ExportedCase = {
      id: c.id,
      text: c.text,
      taxonomy_version: c.taxonomyVersion,
      labels_main: c.label.primaryCategories.map((cat) => ({
        key: cat.key,
        rank: cat.rank,
      })),
      labels_sub: c.label.subcategories,
      intensity: c.label.intensity,
      related_topics: (c.label.relatedTopics || []).map((rt) => ({
        key: rt.key,
        strength: rt.strength,
      })),
      uncertain: c.label.uncertain,
    };
    return JSON.stringify(exported);
  });

  return lines.join("\n");
}

/**
 * Generate CSV export content
 */
function generateCSV(
  cases: Array<{
    id: string;
    text: string;
    taxonomyVersion: string;
    label: {
      primaryCategories: { key: string; rank: number }[];
      subcategories: Record<string, string[]>;
      intensity: Record<string, string[]>;
      relatedTopics: { key: string; strength: string }[] | null;
      uncertain: boolean;
    };
  }>
): string {
  // CSV header
  const header = [
    "id",
    "text",
    "taxonomy_version",
    "category_1",
    "category_2",
    "category_3",
    "subcategories",
    "intensity",
    "related_topics",
    "uncertain",
  ].join(",");

  const rows = cases.map((c) => {
    const cats = c.label.primaryCategories.sort((a, b) => a.rank - b.rank);
    const escapedText = `"${c.text.replace(/"/g, '""').replace(/\n/g, " ")}"`;

    return [
      c.id,
      escapedText,
      c.taxonomyVersion,
      cats[0]?.key || "",
      cats[1]?.key || "",
      cats[2]?.key || "",
      `"${JSON.stringify(c.label.subcategories).replace(/"/g, '""')}"`,
      `"${JSON.stringify(c.label.intensity).replace(/"/g, '""')}"`,
      `"${JSON.stringify(c.label.relatedTopics || []).replace(/"/g, '""')}"`,
      c.label.uncertain ? "true" : "false",
    ].join(",");
  });

  return [header, ...rows].join("\n");
}

/**
 * Export labels as JSONL or CSV
 */
export async function exportLabels(
  options: ExportOptions
): Promise<ActionResult<ExportResult>> {
  const { error, user } = await requireAdmin();
  if (error || !user) {
    return { success: false, error: error || "Admin-Berechtigung erforderlich" };
  }

  const validation = exportOptionsSchema.safeParse(options);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Ungültige Optionen",
    };
  }

  const opts = validation.data;

  try {
    // Get active taxonomy version
    let taxonomyVersion = await db.taxonomyVersion.findFirst({
      where: opts.taxonomyVersionId ? { id: opts.taxonomyVersionId } : { isActive: true },
    });

    if (!taxonomyVersion) {
      return { success: false, error: "Keine Taxonomie-Version gefunden" };
    }

    // Build where clause for cases
    const whereCase: Record<string, unknown> = {
      status: { in: ["LABELED", "REVIEW"] },
    };

    if (opts.fromDate) {
      whereCase.createdAt = { ...(whereCase.createdAt as object), gte: opts.fromDate };
    }
    if (opts.toDate) {
      whereCase.createdAt = { ...(whereCase.createdAt as object), lte: opts.toDate };
    }

    // Get all labeled cases with their labels
    const cases = await db.labellingCase.findMany({
      where: whereCase,
      include: {
        labels: {
          where: { supersededById: null },
          include: { taxonomyVersion: { select: { version: true } } },
        },
        calibrationPool: true,
      },
    });

    const conflicts: ConflictCase[] = [];
    const exportData: Array<{
      id: string;
      text: string;
      taxonomyVersion: string;
      label: {
        primaryCategories: { key: string; rank: number }[];
        subcategories: Record<string, string[]>;
        intensity: Record<string, string[]>;
        relatedTopics: { key: string; strength: string }[] | null;
        uncertain: boolean;
      };
    }> = [];
    const categoryDistribution: Record<string, number> = {};

    for (const c of cases) {
      if (c.labels.length === 0) continue;

      // For calibration cases, check for conflicts
      if (c.calibrationPool && c.labels.length > 1) {
        const categorySets = c.labels.map((l) => {
          const cats = l.primaryCategories as { key: string; rank: number }[];
          return new Set(cats.map((cat) => cat.key));
        });

        let hasConflict = false;
        const disagreementCategories = new Set<string>();

        for (let i = 0; i < categorySets.length && !hasConflict; i++) {
          for (let j = i + 1; j < categorySets.length; j++) {
            const intersection = new Set(
              [...categorySets[i]].filter((x) => categorySets[j].has(x))
            );
            const union = new Set([...categorySets[i], ...categorySets[j]]);
            const jaccard = intersection.size / union.size;

            if (jaccard < 0.5) {
              hasConflict = true;
              for (const cat of union) {
                if (!categorySets[i].has(cat) || !categorySets[j].has(cat)) {
                  disagreementCategories.add(cat);
                }
              }
            }
          }
        }

        if (hasConflict) {
          conflicts.push({
            caseId: c.id,
            raterCount: c.labels.length,
            disagreementCategories: [...disagreementCategories],
          });
          continue;
        }
      }

      // Get the label to export (latest for non-calibration, consensus for calibration)
      const label = c.labels[0]; // For now, use first/latest label

      // Check uncertain filter
      if (!opts.includeUncertain && label.uncertain) {
        continue;
      }

      const primaryCategories = label.primaryCategories as { key: string; rank: number }[];
      const subcategories = label.subcategories as Record<string, string[]>;
      const intensity = label.intensity as Record<string, string[]>;
      const relatedTopics = label.relatedTopics as { key: string; strength: string }[] | null;

      // Update category distribution
      for (const cat of primaryCategories) {
        categoryDistribution[cat.key] = (categoryDistribution[cat.key] || 0) + 1;
      }

      exportData.push({
        id: c.id,
        text: c.text,
        taxonomyVersion: label.taxonomyVersion.version,
        label: {
          primaryCategories,
          subcategories,
          intensity,
          relatedTopics,
          uncertain: label.uncertain,
        },
      });
    }

    // Generate content based on format
    let content: string;
    let contentType: string;
    let extension: string;

    if (opts.format === "jsonl") {
      content = generateJSONL(exportData);
      contentType = "application/x-ndjson";
      extension = "jsonl";
    } else {
      content = generateCSV(exportData);
      contentType = "text/csv";
      extension = "csv";
    }

    // Create report
    const report: ExportReport = {
      taxonomyVersion: taxonomyVersion.version,
      exportedAt: new Date().toISOString(),
      totalCases: cases.length,
      exportedCases: exportData.length,
      excludedCases: cases.length - exportData.length - conflicts.length,
      conflicts,
      categoryDistribution,
    };

    // For now, return the content as a data URL
    const base64Content = Buffer.from(content).toString("base64");
    const dataUrl = `data:${contentType};base64,${base64Content}`;

    return {
      success: true,
      data: {
        url: dataUrl,
        totalCases: cases.length,
        exportedCases: exportData.length,
        conflictCases: conflicts.length,
        report,
      },
    };
  } catch (err) {
    console.error("Export labels error:", err);
    return { success: false, error: "Fehler beim Exportieren" };
  }
}
