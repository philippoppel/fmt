"use server";

import type { Specialty, CommunicationStyle, TherapyFocus, IntensityLevel } from "@/types/therapist";

// Dynamic import for Anthropic SDK (optional dependency)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let anthropicClient: any = null;

async function getAnthropicClient() {
  if (anthropicClient) return anthropicClient;

  try {
    // Dynamic import to avoid build errors if SDK is not installed
    // @ts-expect-error - SDK may not be installed
    const module = await import(/* webpackIgnore: true */ "@anthropic-ai/sdk");
    const Anthropic = module.default;
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    return anthropicClient;
  } catch {
    console.log("[getAnthropicClient] SDK not available, using local analysis only");
    return null;
  }
}

export interface SituationAnalysis {
  // Extracted topics
  suggestedTopics: string[];
  suggestedSpecialties: Specialty[];

  // Inferred preferences
  suggestedCommunicationStyle: CommunicationStyle | null;
  suggestedTherapyFocus: TherapyFocus | null;
  suggestedIntensityLevel: IntensityLevel | null;

  // Human-readable summary
  understandingSummary: string; // "Wir haben verstanden: Du suchst..."

  // Specific therapy methods that might help
  suggestedMethods: string[];

  // Keywords for matching
  keywords: string[];
}

const TOPIC_MAPPING: Record<string, string[]> = {
  depression: ["traurig", "hoffnungslos", "antriebslos", "müde", "erschöpft", "leer", "sinnlos", "depressiv", "niedergeschlagen"],
  anxiety: ["angst", "panik", "sorgen", "nervös", "unruhig", "ängstlich", "phob", "befürcht"],
  trauma: ["trauma", "ptbs", "flashback", "missbrauch", "gewalt", "unfall", "verlust", "tod", "trauer"],
  relationships: ["beziehung", "partner", "ehe", "trennung", "scheidung", "konflikt", "kommunikation", "intimität"],
  family: ["familie", "eltern", "kind", "erziehung", "geschwister", "generationen"],
  burnout: ["burnout", "erschöpf", "überarbeit", "stress", "überlast", "ausgebrannt", "work-life"],
  addiction: ["sucht", "alkohol", "drogen", "abhängig", "konsum", "entzug", "spielsucht"],
  eating_disorders: ["essen", "essstörung", "magersucht", "bulimie", "binge", "gewicht", "körperbild"],
  adhd: ["adhd", "adhs", "konzentration", "aufmerksamkeit", "impulsiv", "unaufmerksam", "fokus"],
  self_care: ["selbstwert", "selbstbewusst", "grenzen", "selbstfürsorge", "selbstliebe"],
  stress: ["stress", "druck", "prüfung", "leistung", "überforder"],
  sleep: ["schlaf", "insomnie", "alpträum", "einschlafen", "durchschlafen"],
};

const SPECIALTY_MAPPING: Record<string, Specialty> = {
  depression: "depression",
  anxiety: "anxiety",
  trauma: "trauma",
  relationships: "relationships",
  family: "relationships",
  burnout: "burnout",
  addiction: "addiction",
  eating_disorders: "eating_disorders",
  adhd: "adhd",
  self_care: "burnout",
  stress: "burnout",
  sleep: "anxiety",
};

export async function analyzeSituation(text: string): Promise<SituationAnalysis> {
  if (!text || text.trim().length < 10) {
    return getEmptyAnalysis();
  }

  // First, do local keyword matching for basic topics
  const localTopics = detectTopicsLocally(text);

  // If we have an API key, enhance with AI analysis
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const aiAnalysis = await analyzeWithAI(text, localTopics);
      return aiAnalysis;
    } catch (error) {
      console.error("[analyzeSituation] AI analysis failed, using local only:", error);
      return getLocalOnlyAnalysis(text, localTopics);
    }
  }

  return getLocalOnlyAnalysis(text, localTopics);
}

function detectTopicsLocally(text: string): string[] {
  const lowerText = text.toLowerCase();
  const detectedTopics: string[] = [];

  for (const [topic, keywords] of Object.entries(TOPIC_MAPPING)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      detectedTopics.push(topic);
    }
  }

  return detectedTopics;
}

function getLocalOnlyAnalysis(text: string, localTopics: string[]): SituationAnalysis {
  const specialties = localTopics
    .map(t => SPECIALTY_MAPPING[t])
    .filter((s): s is Specialty => s !== undefined);

  // Simple intensity detection based on urgency words
  const lowerText = text.toLowerCase();
  let intensity: IntensityLevel = "medium";
  if (lowerText.includes("dringend") || lowerText.includes("sofort") || lowerText.includes("nicht mehr")) {
    intensity = "high";
  } else if (lowerText.includes("manchmal") || lowerText.includes("leicht")) {
    intensity = "low";
  }

  return {
    suggestedTopics: localTopics,
    suggestedSpecialties: [...new Set(specialties)],
    suggestedCommunicationStyle: null,
    suggestedTherapyFocus: null,
    suggestedIntensityLevel: intensity,
    understandingSummary: localTopics.length > 0
      ? `Wir haben verstanden, dass du Unterstützung suchst. Basierend auf deiner Beschreibung scheinen die Themen ${localTopics.slice(0, 3).join(", ")} relevant zu sein.`
      : "Danke für deine Offenheit. Wir helfen dir, den passenden Therapeuten zu finden.",
    suggestedMethods: [],
    keywords: extractKeywords(text),
  };
}

async function analyzeWithAI(text: string, localTopics: string[]): Promise<SituationAnalysis> {
  const anthropic = await getAnthropicClient();
  if (!anthropic) {
    throw new Error("Anthropic client not available");
  }

  const systemPrompt = `Du bist ein einfühlsamer Assistent, der Menschen hilft, den passenden Therapeuten zu finden.
Analysiere die Situationsbeschreibung und extrahiere relevante Informationen für das Matching.

Antworte NUR mit einem validen JSON-Objekt (keine Markdown-Formatierung, kein \`\`\`json):
{
  "topics": ["topic1", "topic2"],
  "specialties": ["depression", "anxiety", ...],
  "communicationStyle": "directive" | "empathetic" | "balanced" | null,
  "therapyFocus": "past" | "present" | "future" | null,
  "intensityLevel": "low" | "medium" | "high",
  "summary": "Wir haben verstanden: ...",
  "methods": ["cbt", "emdr", ...],
  "keywords": ["keyword1", "keyword2"]
}

Verfügbare Topics: depression, anxiety, trauma, relationships, family, burnout, addiction, eating_disorders, adhd, self_care, stress, sleep

Verfügbare Specialties: depression, anxiety, trauma, relationships, addiction, eating_disorders, adhd, burnout

Therapie-Methoden: cbt, emdr, exposure, psychoanalysis, systemic, gestalt, dbt, mindfulness, art_therapy

Sei empathisch im Summary. Beginne mit "Wir haben verstanden:" und fasse in 1-2 Sätzen zusammen, was die Person sucht.`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Analysiere diese Situationsbeschreibung einer Person, die einen Therapeuten sucht:\n\n"${text}"`,
      },
    ],
    system: systemPrompt,
  });

  const content = response.content[0];
  if (content.type !== "text" || !content.text) {
    throw new Error("Unexpected response type");
  }

  try {
    // Clean the response - remove any markdown formatting
    let jsonText = (content.text as string).trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    }

    const parsed = JSON.parse(jsonText);

    // Merge AI topics with local topics for better coverage
    const allTopics = [...new Set([...localTopics, ...(parsed.topics || [])])];
    const allSpecialties = [...new Set([...localTopics.map(t => SPECIALTY_MAPPING[t]).filter(Boolean), ...(parsed.specialties || [])])];

    return {
      suggestedTopics: allTopics,
      suggestedSpecialties: allSpecialties as Specialty[],
      suggestedCommunicationStyle: parsed.communicationStyle || null,
      suggestedTherapyFocus: parsed.therapyFocus || null,
      suggestedIntensityLevel: parsed.intensityLevel || "medium",
      understandingSummary: parsed.summary || "Danke für deine Offenheit. Wir helfen dir, den passenden Therapeuten zu finden.",
      suggestedMethods: parsed.methods || [],
      keywords: [...new Set([...extractKeywords(text), ...(parsed.keywords || [])])],
    };
  } catch (parseError) {
    console.error("[analyzeWithAI] Failed to parse AI response:", parseError);
    return getLocalOnlyAnalysis(text, localTopics);
  }
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - words longer than 4 chars, not common words
  const commonWords = new Set(["dass", "sein", "haben", "werden", "können", "müssen", "sollen", "wollen", "diese", "einer", "einem", "einen", "nicht", "auch", "nach", "sich", "noch", "schon", "aber", "oder", "wenn", "weil", "denn", "dann", "immer", "wieder", "mehr", "sehr"]);

  const words = text
    .toLowerCase()
    .replace(/[^\wäöüß\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 4 && !commonWords.has(w));

  return [...new Set(words)].slice(0, 10);
}

function getEmptyAnalysis(): SituationAnalysis {
  return {
    suggestedTopics: [],
    suggestedSpecialties: [],
    suggestedCommunicationStyle: null,
    suggestedTherapyFocus: null,
    suggestedIntensityLevel: null,
    understandingSummary: "",
    suggestedMethods: [],
    keywords: [],
  };
}
