"use server";

import Groq from "groq-sdk";
import type {
  LabelSuggestion,
  CategorySuggestion,
  RelatedTopicSuggestion,
  SubcategoriesMap,
  IntensityMap,
} from "@/types/labelling";
import {
  LABEL_SUGGESTION_SYSTEM_PROMPT,
  CASE_GENERATION_SYSTEM_PROMPT,
  buildUserPrompt,
  buildCaseGenerationPrompt,
  getValidCategoryKeys,
  getValidSubcategoryKeys,
  getValidIntensityKeys,
  getSubcategoryKeysForCategory,
  getIntensityKeysForCategory,
} from "@/lib/labelling/ai-prompt";
import { MATCHING_TOPICS } from "@/lib/matching/topics";

// Lazy init Groq client
let groq: Groq | null = null;
function getGroqClient(): Groq {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

/**
 * Get empty suggestion (fallback for errors)
 */
function getEmptySuggestion(): LabelSuggestion {
  return {
    main: [],
    sub: {},
    intensity: {},
    related: [],
    uncertainSuggested: true,
    rationaleShort: "",
  };
}

/**
 * Validate and normalize the AI suggestion response
 */
function validateAndNormalizeSuggestion(raw: unknown): LabelSuggestion {
  if (!raw || typeof raw !== "object") {
    return getEmptySuggestion();
  }

  const data = raw as Record<string, unknown>;
  const validCategoryKeys = getValidCategoryKeys();
  const validSubcategoryKeys = getValidSubcategoryKeys();
  const validIntensityKeys = getValidIntensityKeys();

  // Validate main categories
  let mainCategories: CategorySuggestion[] = [];
  if (Array.isArray(data.main)) {
    mainCategories = data.main
      .filter(
        (item): item is { key: string; rank: number; confidence: number } =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as Record<string, unknown>).key === "string" &&
          validCategoryKeys.has((item as Record<string, unknown>).key as string)
      )
      .map((item, index) => ({
        key: item.key,
        rank: Math.min(Math.max(index + 1, 1), 3) as 1 | 2 | 3,
        confidence: Math.min(
          Math.max(typeof item.confidence === "number" ? item.confidence : 0.5, 0),
          1
        ),
      }))
      .slice(0, 3); // Max 3 categories
  }

  // Assign proper ranks
  mainCategories = mainCategories.map((cat, index) => ({
    ...cat,
    rank: (index + 1) as 1 | 2 | 3,
  }));

  const selectedCategories = new Set(mainCategories.map((c) => c.key));

  // Validate subcategories
  const subcategories: SubcategoriesMap = {};
  if (data.sub && typeof data.sub === "object" && !Array.isArray(data.sub)) {
    const subData = data.sub as Record<string, unknown>;
    for (const [categoryKey, subKeys] of Object.entries(subData)) {
      if (!selectedCategories.has(categoryKey)) continue;
      if (!Array.isArray(subKeys)) continue;

      const validCategorySubs = getSubcategoryKeysForCategory(categoryKey);
      const validSubs = subKeys.filter(
        (key): key is string =>
          typeof key === "string" &&
          validSubcategoryKeys.has(key) &&
          validCategorySubs.has(key)
      );

      if (validSubs.length > 0) {
        subcategories[categoryKey] = validSubs;
      }
    }
  }

  // Validate intensity
  const intensity: IntensityMap = {};
  if (
    data.intensity &&
    typeof data.intensity === "object" &&
    !Array.isArray(data.intensity)
  ) {
    const intData = data.intensity as Record<string, unknown>;
    for (const [categoryKey, intKeys] of Object.entries(intData)) {
      if (!selectedCategories.has(categoryKey)) continue;
      if (!Array.isArray(intKeys)) continue;

      const validCategoryIntensity = getIntensityKeysForCategory(categoryKey);
      const validInts = intKeys.filter(
        (key): key is string =>
          typeof key === "string" &&
          validIntensityKeys.has(key) &&
          validCategoryIntensity.has(key)
      );

      if (validInts.length > 0) {
        intensity[categoryKey] = validInts;
      }
    }
  }

  // Validate related topics
  let related: RelatedTopicSuggestion[] = [];
  if (Array.isArray(data.related)) {
    related = data.related
      .filter(
        (item): item is { key: string; strength: string } =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as Record<string, unknown>).key === "string" &&
          validCategoryKeys.has((item as Record<string, unknown>).key as string) &&
          !selectedCategories.has((item as Record<string, unknown>).key as string)
      )
      .map((item): RelatedTopicSuggestion => ({
        key: item.key,
        strength:
          item.strength === "SOMETIMES" ? "SOMETIMES" : "OFTEN",
      }))
      .slice(0, 5); // Max 5 related topics
  }

  // Validate uncertain flag
  const uncertainSuggested =
    typeof data.uncertainSuggested === "boolean"
      ? data.uncertainSuggested
      : mainCategories.length === 0 ||
        mainCategories.some((c) => c.confidence < 0.5);

  // Validate rationale
  const rationaleShort =
    typeof data.rationaleShort === "string"
      ? data.rationaleShort.slice(0, 500) // Limit length
      : "";

  return {
    main: mainCategories,
    sub: subcategories,
    intensity,
    related,
    uncertainSuggested,
    rationaleShort,
  };
}

/**
 * Suggest labels for a given text using Groq AI
 */
export async function suggestLabels(text: string): Promise<LabelSuggestion> {
  // Validate input
  if (!text || text.trim().length < 20) {
    return getEmptySuggestion();
  }

  // Sanitize and limit input
  const sanitizedText = text.trim().slice(0, 2000);

  try {
    const client = getGroqClient();

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: LABEL_SUGGESTION_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(sanitizedText) },
      ],
      temperature: 0.2, // Low for consistent labeling
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      console.error("Empty response from Groq");
      return getEmptySuggestion();
    }

    // Parse JSON response
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse Groq response as JSON:", content);
      return getEmptySuggestion();
    }

    return validateAndNormalizeSuggestion(parsed);
  } catch (error) {
    console.error("Label suggestion error:", error);
    return getEmptySuggestion();
  }
}

/**
 * Check if Groq API is available
 */
export async function checkGroqAvailability(): Promise<boolean> {
  try {
    const client = getGroqClient();
    await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: "test" }],
      max_tokens: 5,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a new case text using AI
 * Optionally focus on underrepresented categories
 */
export async function generateCase(focusTopic?: string): Promise<{
  text: string;
  focusTopic?: string;
}> {
  try {
    const client = getGroqClient();

    // If no focus topic provided, pick a random one for variety
    let selectedTopic = focusTopic;
    if (!selectedTopic) {
      const topics = MATCHING_TOPICS.filter((t) => t.id !== "other");
      selectedTopic = topics[Math.floor(Math.random() * topics.length)]?.id;
    }

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: CASE_GENERATION_SYSTEM_PROMPT },
        { role: "user", content: buildCaseGenerationPrompt(selectedTopic) },
      ],
      temperature: 0.9, // High for creative variation
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content || content.length < 30) {
      throw new Error("Generated case too short or empty");
    }

    // Clean up any potential formatting artifacts
    const cleanedText = content
      .replace(/^["']|["']$/g, "") // Remove quotes
      .replace(/^\*\*.*?\*\*\s*/g, "") // Remove bold headers
      .replace(/^#.*$/gm, "") // Remove markdown headers
      .trim();

    return {
      text: cleanedText,
      focusTopic: selectedTopic,
    };
  } catch (error) {
    console.error("Case generation error:", error);
    // Return a fallback case
    return {
      text: "Ich fühle mich in letzter Zeit sehr überfordert. Die Arbeit wächst mir über den Kopf und zu Hause finde ich auch keine Ruhe. Ich weiß nicht, wie ich das alles schaffen soll.",
      focusTopic: "stress",
    };
  }
}

/**
 * Generate a case and immediately get label suggestions
 * Combined for efficiency
 */
export async function generateCaseWithSuggestions(): Promise<{
  text: string;
  suggestions: LabelSuggestion;
  focusTopic?: string;
}> {
  const caseResult = await generateCase();
  const suggestions = await suggestLabels(caseResult.text);

  return {
    text: caseResult.text,
    suggestions,
    focusTopic: caseResult.focusTopic,
  };
}
