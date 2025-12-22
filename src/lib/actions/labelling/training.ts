"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import Groq from "groq-sdk";

// Lazy init Groq
let groq: Groq | null = null;
function getGroqClient(): Groq {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

interface TrainingCase {
  id: string;
  text: string;
}

interface TrainingStats {
  totalLabeled: number;
  todayLabeled: number;
  topCategories: { category: string; count: number }[];
}

/**
 * Check if user has labelling access
 */
async function requireLabellingAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Nicht authentifiziert", user: null };
  }
  if (session.user.role !== "LABELLER" && session.user.role !== "ADMIN") {
    return { error: "Keine Berechtigung", user: null };
  }
  return { error: null, user: session.user };
}

/**
 * Get the next unlabeled training case for the current user
 */
export async function getNextTrainingCase(): Promise<ActionResult<TrainingCase | null>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  try {
    // Find a case that hasn't been labeled by this user yet
    const nextCase = await db.labellingCase.findFirst({
      where: {
        status: "NEW",
        labels: {
          none: {
            raterId: user.id,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        text: true,
      },
    });

    return {
      success: true,
      data: nextCase,
    };
  } catch (err) {
    console.error("Get next training case error:", err);
    return { success: false, error: "Fehler beim Laden" };
  }
}

/**
 * Save a training label (simplified - just topics)
 */
export async function saveTrainingLabel(input: {
  caseId: string;
  topics: string[];
  uncertain?: boolean;
}): Promise<ActionResult> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  if (!input.topics || input.topics.length === 0) {
    return { success: false, error: "Mindestens ein Thema erforderlich" };
  }

  if (input.topics.length > 3) {
    return { success: false, error: "Maximal 3 Themen erlaubt" };
  }

  try {
    // Get or create taxonomy version
    let taxonomy = await db.taxonomyVersion.findFirst({
      where: { isActive: true },
    });

    if (!taxonomy) {
      taxonomy = await db.taxonomyVersion.create({
        data: {
          version: "v0.1",
          description: "Training Taxonomie",
          schema: { type: "training" },
          isActive: true,
        },
      });
    }

    // Create simplified label with ranked categories
    const primaryCategories = input.topics.map((topic, index) => ({
      key: topic,
      rank: (index + 1) as 1 | 2 | 3,
    }));

    await db.label.create({
      data: {
        caseId: input.caseId,
        raterId: user.id,
        taxonomyVersionId: taxonomy.id,
        primaryCategories: primaryCategories as Prisma.InputJsonValue,
        subcategories: {},
        intensity: {},
        relatedTopics: Prisma.JsonNull,
        uncertain: input.uncertain ?? false,
        evidenceSnippets: Prisma.JsonNull,
      },
    });

    // Update case status
    await db.labellingCase.update({
      where: { id: input.caseId },
      data: { status: "LABELED" },
    });

    revalidatePath("/labelling");
    revalidatePath("/labelling/train");

    return { success: true };
  } catch (err) {
    console.error("Save training label error:", err);
    return { success: false, error: "Fehler beim Speichern" };
  }
}

/**
 * Generate a new training case using Groq AI
 */
export async function generateNewCase(): Promise<ActionResult<TrainingCase>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  try {
    const client = getGroqClient();

    // Generate diverse scenarios
    const scenarios = [
      "eine Person mit Symptomen von Depression",
      "jemand mit Beziehungsproblemen",
      "eine Person die unter Angst leidet",
      "jemand mit Stress am Arbeitsplatz",
      "eine Person die Trauma erlebt hat",
      "jemand mit Schlafproblemen",
      "eine Person mit Familienkonflikten",
      "jemand der sich ausgebrannt fühlt",
      "eine Person die mit einer Sucht kämpft",
      "jemand mit Essstörungen",
      "eine Person die sich einsam fühlt",
      "jemand mit Selbstwertproblemen",
      "eine Person mit Trauer nach einem Verlust",
      "jemand mit Panikattacken",
      "eine Person in einer Lebenskrise",
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.9,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte darin, realistische Therapie-Anfragen zu schreiben.
Generiere einen authentischen deutschen Text, wie ihn eine echte Person schreiben würde, die nach Therapie sucht.

Regeln:
- Schreibe aus der Ich-Perspektive
- 2-4 Sätze lang
- Natürliche, alltägliche Sprache (nicht klinisch)
- Beschreibe Gefühle und Situation
- Keine Namen oder identifizierbaren Details
- Variiere den Stil: manche kurz und direkt, manche ausführlicher
- KEINE Grußformeln oder Anreden`,
        },
        {
          role: "user",
          content: `Schreibe einen Text für ${scenario}. Nur der Text, keine Erklärungen.`,
        },
      ],
    });

    const generatedText = response.choices[0]?.message?.content?.trim();

    if (!generatedText || generatedText.length < 20) {
      return { success: false, error: "Textgenerierung fehlgeschlagen" };
    }

    // Save the generated case
    const newCase = await db.labellingCase.create({
      data: {
        text: generatedText,
        language: "de",
        source: "AI_SEEDED",
        status: "NEW",
        metadata: { generatedScenario: scenario },
        createdById: user.id,
      },
    });

    revalidatePath("/labelling/train");

    return {
      success: true,
      data: {
        id: newCase.id,
        text: newCase.text,
      },
    };
  } catch (err) {
    console.error("Generate case error:", err);
    return { success: false, error: "Fehler bei der Generierung" };
  }
}

/**
 * Get training statistics for the current user
 */
export async function getTrainingStats(): Promise<ActionResult<TrainingStats>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get counts
    const [totalLabeled, todayLabeled, allLabels] = await Promise.all([
      db.label.count({
        where: { raterId: user.id },
      }),
      db.label.count({
        where: {
          raterId: user.id,
          createdAt: { gte: today },
        },
      }),
      db.label.findMany({
        where: { raterId: user.id },
        select: { primaryCategories: true },
      }),
    ]);

    // Count categories
    const categoryCounts: Record<string, number> = {};
    for (const label of allLabels) {
      const categories = label.primaryCategories as Array<{ key: string }>;
      if (Array.isArray(categories)) {
        for (const cat of categories) {
          categoryCounts[cat.key] = (categoryCounts[cat.key] || 0) + 1;
        }
      }
    }

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      success: true,
      data: {
        totalLabeled,
        todayLabeled,
        topCategories,
      },
    };
  } catch (err) {
    console.error("Get training stats error:", err);
    return { success: false, error: "Fehler beim Laden der Statistik" };
  }
}

/**
 * Save a label with AI suggestion audit trail
 * Creates a new case if text is provided, otherwise uses existing caseId
 */
export async function saveLabelWithAudit(input: {
  caseId?: string;
  text?: string;
  aiSuggestion: {
    main: Array<{ key: string; rank: 1 | 2 | 3; confidence: number }>;
    sub: Record<string, string[]>;
    intensity: Record<string, string[]>;
    related: Array<{ key: string; strength: "OFTEN" | "SOMETIMES" }>;
    uncertainSuggested: boolean;
    rationaleShort: string;
  } | null;
  finalLabel: {
    primaryCategories: Array<{ key: string; rank: 1 | 2 | 3 }>;
    subcategories: Record<string, string[]>;
    intensity: Record<string, string[]>;
    relatedTopics?: Array<{ key: string; strength: "OFTEN" | "SOMETIMES" }>;
    uncertain?: boolean;
  };
}): Promise<ActionResult<{ caseId: string; labelId: string }>> {
  const { error, user } = await requireLabellingAccess();
  if (error || !user) {
    return { success: false, error: error || "Nicht authentifiziert" };
  }

  // Validate input
  if (!input.caseId && !input.text) {
    return { success: false, error: "Entweder caseId oder text erforderlich" };
  }

  if (
    !input.finalLabel.primaryCategories ||
    input.finalLabel.primaryCategories.length === 0
  ) {
    return { success: false, error: "Mindestens eine Kategorie erforderlich" };
  }

  if (input.finalLabel.primaryCategories.length > 3) {
    return { success: false, error: "Maximal 3 Kategorien erlaubt" };
  }

  try {
    // Get or create taxonomy version
    let taxonomy = await db.taxonomyVersion.findFirst({
      where: { isActive: true },
    });

    if (!taxonomy) {
      taxonomy = await db.taxonomyVersion.create({
        data: {
          version: "v0.2",
          description: "Labelling mit KI-Vorschlägen",
          schema: { type: "labelling", version: "v0.2" },
          isActive: true,
        },
      });
    }

    let targetCaseId = input.caseId;

    // Create new case if text provided
    if (!targetCaseId && input.text) {
      const newCase = await db.labellingCase.create({
        data: {
          text: input.text,
          language: "de",
          source: "MANUAL",
          status: "NEW",
          metadata: input.aiSuggestion
            ? ({ aiSuggestion: input.aiSuggestion } as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          createdById: user.id,
        },
      });
      targetCaseId = newCase.id;
    }

    if (!targetCaseId) {
      return { success: false, error: "Case ID konnte nicht ermittelt werden" };
    }

    // Create the label
    const label = await db.label.create({
      data: {
        caseId: targetCaseId,
        raterId: user.id,
        taxonomyVersionId: taxonomy.id,
        primaryCategories:
          input.finalLabel.primaryCategories as Prisma.InputJsonValue,
        subcategories: input.finalLabel.subcategories as Prisma.InputJsonValue,
        intensity: input.finalLabel.intensity as Prisma.InputJsonValue,
        relatedTopics: input.finalLabel.relatedTopics
          ? (input.finalLabel.relatedTopics as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        uncertain: input.finalLabel.uncertain ?? false,
        evidenceSnippets: Prisma.JsonNull,
      },
    });

    // Update case status
    await db.labellingCase.update({
      where: { id: targetCaseId },
      data: { status: "LABELED" },
    });

    revalidatePath("/labelling");
    revalidatePath("/labelling/cases");
    revalidatePath("/labelling/cases/new");

    return {
      success: true,
      data: {
        caseId: targetCaseId,
        labelId: label.id,
      },
    };
  } catch (err) {
    console.error("Save label with audit error:", err);
    return { success: false, error: "Fehler beim Speichern" };
  }
}
