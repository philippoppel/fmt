"use server";

import Groq from "groq-sdk";
import { headers } from "next/headers";
import type { Specialty } from "@/types/therapist";
import {
  type IntensityLevel,
  type CrisisType,
  TOPIC_KEYWORDS,
  SUBTOPIC_KEYWORDS,
  detectLanguage,
  detectTopics,
  detectSubTopics,
  detectCrisis,
  detectIntensity,
} from "@/lib/matching/situation-detection";

// Re-export types for consumers
export type { IntensityLevel, CrisisType } from "@/lib/matching/situation-detection";
export type { CrisisDetectionResult } from "@/lib/matching/situation-detection";

// ============================================================================
// RATE LIMITING & INPUT PROTECTION
// ============================================================================

const MAX_INPUT_LENGTH = 1000; // Max characters for input text
const RATE_LIMIT_REQUESTS = 5; // Max requests per IP
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window

// In-memory rate limit store (Note: resets on server restart, consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

async function getClientIP(): Promise<string> {
  try {
    const headersList = await headers();
    // Check common headers for real IP (behind proxies/load balancers)
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIP = headersList.get("x-real-ip");
    if (realIP) {
      return realIP;
    }
    return "unknown";
  } catch {
    // headers() only works in request context (not in tests or server components without request)
    return "test-environment";
  }
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  // Skip rate limiting for test environment
  if (ip === "test-environment") {
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (record.count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_REQUESTS - record.count, resetIn: record.resetTime - now };
}

function sanitizeAndTruncateInput(text: string): string {
  // Remove excessive whitespace
  let sanitized = text.trim().replace(/\s+/g, " ");

  // Truncate to max length
  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_INPUT_LENGTH);
  }

  return sanitized;
}

export interface SituationAnalysis {
  suggestedTopics: string[];
  suggestedSubTopics: string[];
  suggestedSpecialties: Specialty[];
  suggestedCommunicationStyle: string | null;
  suggestedTherapyFocus: string | null;
  suggestedIntensityLevel: IntensityLevel | null;
  understandingSummary: string;
  suggestedMethods: string[];
  keywords: string[];
  topicReasons: string;
  crisisDetected: boolean;
  crisisType: CrisisType | null;
}

// Initialize Groq client lazily to avoid errors during test imports
let groq: Groq | null = null;
function getGroqClient(): Groq {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

function extractKeywords(text: string, lang: "de" | "en"): string[] {
  const stopWords: Record<"de" | "en", Set<string>> = {
    de: new Set([
      "und", "oder", "aber", "dass", "wenn", "weil", "denn", "dann",
      "ich", "du", "er", "sie", "es", "wir", "ihr", "mein", "dein", "sein",
      "haben", "werden", "können", "müssen", "sollen", "wollen",
      "der", "die", "das", "ein", "eine", "einer", "einem", "einen",
      "nicht", "auch", "noch", "schon", "sehr", "mehr", "immer", "wieder",
      "nach", "sich", "mit", "für", "auf", "aus", "bei", "von", "zum", "zur",
      "über", "unter", "durch", "gegen", "ohne", "um", "an", "in", "vor",
    ]),
    en: new Set([
      "and", "or", "but", "that", "if", "because", "then",
      "i", "you", "he", "she", "it", "we", "they", "my", "your", "his", "her",
      "have", "has", "had", "been", "be", "being", "am", "is", "are", "was", "were",
      "can", "could", "will", "would", "should", "must", "may", "might",
      "the", "a", "an", "this", "that", "these", "those",
      "not", "also", "still", "already", "very", "more", "always", "again",
      "after", "with", "for", "on", "from", "at", "of", "to",
      "about", "into", "through", "during", "before", "between", "without",
    ]),
  };

  const words = text
    .toLowerCase()
    .replace(/[^\wäöüß\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords[lang].has(w));

  return [...new Set(words)].slice(0, 10);
}

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

// ============================================================================
// SUMMARY GENERATION
// ============================================================================

interface TopicLabel {
  de: string;
  en: string;
}

const TOPIC_LABELS: Record<string, TopicLabel> = {
  depression: { de: "Depression & Niedergeschlagenheit", en: "Depression & Low Mood" },
  anxiety: { de: "Angst & Panik", en: "Anxiety & Panic" },
  trauma: { de: "Trauma & Belastung", en: "Trauma & Stress" },
  relationships: { de: "Beziehungen & Partnerschaft", en: "Relationships & Partnership" },
  family: { de: "Familie & Angehörige", en: "Family" },
  burnout: { de: "Burnout & Erschöpfung", en: "Burnout & Exhaustion" },
  addiction: { de: "Sucht & Abhängigkeit", en: "Addiction" },
  eating_disorders: { de: "Essstörungen", en: "Eating Disorders" },
  adhd: { de: "ADHS & Konzentration", en: "ADHD & Concentration" },
  self_care: { de: "Selbstwert & Persönlichkeit", en: "Self-Worth & Personal Growth" },
  stress: { de: "Stress & Überlastung", en: "Stress & Overwhelm" },
  sleep: { de: "Schlafprobleme", en: "Sleep Issues" },
};

function generateSummary(
  topics: string[],
  intensity: IntensityLevel,
  lang: "de" | "en"
): string {
  if (topics.length === 0) {
    return lang === "de"
      ? "Danke für deine Offenheit. Wir helfen dir, den passenden Therapeuten zu finden."
      : "Thank you for sharing. We'll help you find the right therapist.";
  }

  const topicLabels = topics
    .slice(0, 3)
    .map((t) => TOPIC_LABELS[t]?.[lang] || t)
    .join(lang === "de" ? " und " : " and ");

  if (lang === "de") {
    const intensityText =
      intensity === "high"
        ? "Wir verstehen, dass du gerade eine schwierige Zeit durchmachst."
        : intensity === "low"
          ? "Es ist gut, dass du frühzeitig Unterstützung suchst."
          : "Wir verstehen deine Situation.";

    return `${intensityText} Basierend auf deiner Beschreibung konzentrieren wir uns auf: ${topicLabels}.`;
  } else {
    const intensityText =
      intensity === "high"
        ? "We understand you're going through a difficult time."
        : intensity === "low"
          ? "It's great that you're seeking support early."
          : "We understand your situation.";

    return `${intensityText} Based on your description, we'll focus on: ${topicLabels}.`;
  }
}

// ============================================================================
// ANONYMIZATION - Remove personal data before sending to AI
// ============================================================================

function anonymizeText(text: string): string {
  let anonymized = text;

  // Remove email addresses
  anonymized = anonymized.replace(/[\w.-]+@[\w.-]+\.\w+/gi, "[E-MAIL]");

  // Remove phone numbers (various formats)
  anonymized = anonymized.replace(/(\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,6}/g, "[TELEFON]");

  // Remove URLs
  anonymized = anonymized.replace(/https?:\/\/[^\s]+/gi, "[URL]");

  // Remove German postal codes + city patterns (e.g., "80331 München")
  anonymized = anonymized.replace(/\b\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+/g, "[ORT]");

  // Remove street addresses (German pattern: "Musterstraße 12" or "Hauptstr. 5a")
  anonymized = anonymized.replace(/[A-ZÄÖÜ][a-zäöüß]+(straße|strasse|str\.|weg|platz|gasse|allee)\s*\d+[a-z]?/gi, "[ADRESSE]");

  // Common German first names (expanded list)
  const germanNames = [
    "Anna", "Maria", "Lisa", "Laura", "Julia", "Sarah", "Lena", "Sophie", "Emma", "Mia",
    "Thomas", "Michael", "Stefan", "Andreas", "Christian", "Markus", "Daniel", "Martin", "Peter", "Klaus",
    "Max", "Felix", "Paul", "Leon", "Jonas", "Tim", "Jan", "Lukas", "David", "Alexander",
    "Sandra", "Nicole", "Kathrin", "Sabine", "Petra", "Andrea", "Claudia", "Susanne", "Monika", "Karin",
    "Hans", "Frank", "Wolfgang", "Jürgen", "Dieter", "Werner", "Helmut", "Gerhard", "Heinrich", "Karl",
    "Mama", "Papa", "Mutti", "Vati", "Oma", "Opa", "Mutter", "Vater"
  ];
  const namePattern = new RegExp(`\\b(${germanNames.join("|")})\\b`, "gi");
  anonymized = anonymized.replace(namePattern, "[NAME]");

  // Remove patterns like "mein Mann Peter" or "meine Frau Anna"
  anonymized = anonymized.replace(/\b(mein|meine|der|die)\s+(mann|frau|freund|freundin|partner|partnerin|chef|chefin|kollege|kollegin|bruder|schwester|sohn|tochter)\s+[A-ZÄÖÜ][a-zäöüß]+/gi, "$1 $2 [NAME]");

  // Remove "Herr/Frau + Name" patterns
  anonymized = anonymized.replace(/\b(herr|frau|dr\.|prof\.)\s+[A-ZÄÖÜ][a-zäöüß]+/gi, "[NAME]");

  // Remove company/institution names after "bei" or "in der/im"
  anonymized = anonymized.replace(/\b(bei|bei der|beim|in der|im)\s+[A-ZÄÖÜ][a-zäöüß]+\s*(GmbH|AG|KG|e\.V\.|Inc\.)?/gi, "$1 [FIRMA]");

  // Remove city names (major German cities)
  const cities = [
    "Berlin", "Hamburg", "München", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig",
    "Dortmund", "Essen", "Bremen", "Dresden", "Hannover", "Nürnberg", "Duisburg", "Bochum",
    "Wuppertal", "Bielefeld", "Bonn", "Münster", "Mannheim", "Karlsruhe", "Augsburg", "Wiesbaden",
    "Wien", "Zürich", "Salzburg", "Graz", "Linz", "Innsbruck", "Bern", "Basel"
  ];
  const cityPattern = new RegExp(`\\b(${cities.join("|")})\\b`, "gi");
  anonymized = anonymized.replace(cityPattern, "[STADT]");

  // Remove dates in various formats
  anonymized = anonymized.replace(/\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g, "[DATUM]");

  // Remove age mentions like "ich bin 34" or "34 Jahre"
  anonymized = anonymized.replace(/\b(\d{1,2})\s*(jahre|j\.|jährig)/gi, "[ALTER] Jahre");
  anonymized = anonymized.replace(/\bbin\s+(\d{1,2})\b/gi, "bin [ALTER]");

  return anonymized;
}

// ============================================================================
// AI-POWERED ANALYSIS FUNCTION (using Groq)
// ============================================================================

const AVAILABLE_TOPICS = [
  "depression", "anxiety", "trauma", "relationships", "family",
  "burnout", "addiction", "eating_disorders", "adhd", "self_care", "stress", "sleep"
];

const AVAILABLE_SUBTOPICS = [
  // Anxiety
  "social_anxiety", "panic_attacks", "phobias", "generalized_anxiety",
  // Depression
  "chronic_sadness", "lack_motivation", "grief", "loneliness",
  // Relationships/Family
  "couple_conflicts", "breakup", "dating_issues", "intimacy", "divorce", "parenting", "family_conflicts",
  // Trauma
  "ptsd", "childhood_trauma", "accident_trauma", "loss",
  // Burnout
  "work_stress", "exhaustion", "work_life_balance",
  // Addiction
  "alcohol", "drugs", "behavioral_addiction", "gaming",
  // Eating disorders
  "anorexia", "bulimia", "binge_eating",
  // ADHD
  "concentration", "impulsivity", "adult_adhd",
  // Self care
  "self_esteem", "boundaries", "life_changes",
  // Stress
  "chronic_stress", "exam_anxiety", "performance_pressure",
  // Sleep
  "insomnia", "nightmares", "sleep_anxiety",
];

// Map SubTopics to their parent Topics - ensures consistency
const SUBTOPIC_TO_TOPIC: Record<string, string> = {
  // Anxiety
  social_anxiety: "anxiety", panic_attacks: "anxiety", phobias: "anxiety", generalized_anxiety: "anxiety",
  // Depression
  chronic_sadness: "depression", lack_motivation: "depression", grief: "depression", loneliness: "depression",
  // Relationships
  couple_conflicts: "relationships", breakup: "relationships", dating_issues: "relationships",
  intimacy: "relationships", divorce: "relationships", parenting: "family", family_conflicts: "family",
  // Trauma
  ptsd: "trauma", childhood_trauma: "trauma", accident_trauma: "trauma", loss: "trauma",
  // Burnout
  work_stress: "burnout", exhaustion: "burnout", work_life_balance: "burnout",
  // Addiction
  alcohol: "addiction", drugs: "addiction", behavioral_addiction: "addiction", gaming: "addiction",
  // Eating disorders
  anorexia: "eating_disorders", bulimia: "eating_disorders", binge_eating: "eating_disorders",
  // ADHD
  concentration: "adhd", impulsivity: "adhd", adult_adhd: "adhd",
  // Self care
  self_esteem: "self_care", boundaries: "self_care", life_changes: "self_care",
  // Stress
  chronic_stress: "stress", exam_anxiety: "stress", performance_pressure: "stress",
  // Sleep
  insomnia: "sleep", nightmares: "sleep", sleep_anxiety: "sleep",
};

// Ensures that if a SubTopic is detected, its parent Topic is also included
function ensureParentTopics(topics: string[], subTopics: string[]): string[] {
  const topicSet = new Set(topics);
  for (const subTopic of subTopics) {
    const parentTopic = SUBTOPIC_TO_TOPIC[subTopic];
    if (parentTopic && !topicSet.has(parentTopic)) {
      topicSet.add(parentTopic);
    }
  }
  return Array.from(topicSet);
}

// ============================================================================
// AI PROMPTS - Optimized according to Groq Best Practices
// ============================================================================

const AI_SYSTEM_PROMPT = `### Role
Du bist ein einfühlsamer Psychologie-Assistent für die Analyse von Situationsbeschreibungen.

### Instructions
- Analysiere den Text und extrahiere psychologische Themen
- Prüfe ZUERST auf Krisenindikatoren (Suizid, Selbstverletzung, akute Gefahr)
- Wähle 1-3 passende Topics aus der verfügbaren Liste
- Wähle 1-4 passende SubTopics nur wenn spezifisch erkennbar
- Bestimme die Intensität (low/medium/high)
- WICHTIG für "reasoning": Beziehe dich DIREKT auf die Worte des Nutzers. Erkläre in 1-2 Sätzen, WARUM die erkannten Themen zur Beschreibung passen.
- Antworte NUR mit validem JSON, keine Erklärung, kein Markdown

### Context
DATENSCHUTZ: Der Text wurde bereits anonymisiert. Platzhalter wie [NAME], [ORT], [FIRMA] sind normal.

Verfügbare Topics: ${AVAILABLE_TOPICS.join(", ")}

SubTopics nach Kategorie:
- Angst: social_anxiety, panic_attacks, phobias, generalized_anxiety
- Depression: chronic_sadness, lack_motivation, grief, loneliness
- Beziehungen: couple_conflicts, breakup, dating_issues, intimacy, divorce, parenting, family_conflicts
- Trauma: ptsd, childhood_trauma, accident_trauma, loss
- Burnout: work_stress, exhaustion, work_life_balance
- Sucht: alcohol, drugs, behavioral_addiction, gaming
- Essstörungen: anorexia, bulimia, binge_eating
- ADHS: concentration, impulsivity, adult_adhd
- Selbstfürsorge: self_esteem, boundaries, life_changes
- Stress: chronic_stress, exam_anxiety, performance_pressure
- Schlaf: insomnia, nightmares, sleep_anxiety

Intensitäts-Kriterien:
- "high": Dringend, akute Belastung, kann nicht mehr, Krise
- "medium": Belastend aber bewältigbar, beeinträchtigt Alltag
- "low": Leichte Beschwerden, präventiv, Selbstoptimierung

### WICHTIG: Krisen-Erkennung
Setze crisis=true NUR bei EXPLIZITEN Hinweisen auf:
- "suicidal": DIREKTE Äußerungen zu Suizid, Sterben wollen, Abschiedsbrief
- "self_harm": DIREKTE Äußerungen zu Selbstverletzung, Ritzen, sich weh tun
- "acute_danger": DIREKTE Äußerungen wie "ich kann nicht mehr", "keinen Ausweg", "hoffnungslos"

KEINE Krise bei:
- Burnout, Erschöpfung, Überlastung → Das sind Topics, keine Krisen
- Panikattacken, Angst → Das sind Topics, keine Krisen
- Beziehungsprobleme, Trauer → Das sind Topics, keine Krisen
- Allgemeiner Stress → Das ist ein Topic, keine Krise

crisis=true bedeutet SOFORTIGE Hilfsanzeige - nur bei echten Krisenindikatoren setzen!

### Expected Output Format
{"topics":["topic1","topic2"],"subTopics":["subtopic1"],"reasoning":"1-2 Sätze die sich DIREKT auf die Eingabe beziehen","intensity":"medium","summary":"Einfühlsame Zusammenfassung","crisis":false,"crisisType":null}

### Examples
Input: "Ich bin bei der Arbeit völlig erschöpft und kann nachts nicht schlafen."
Output: {"topics":["burnout","sleep"],"subTopics":["exhaustion","insomnia"],"reasoning":"Du sprichst von Erschöpfung bei der Arbeit und Schlafproblemen - das sind typische Anzeichen für Burnout.","intensity":"medium","summary":"Du erlebst gerade eine belastende Phase mit Erschöpfung und Schlafproblemen.","crisis":false,"crisisType":null}

Input: "Meine Freundin mobbt mich ständig."
Output: {"topics":["relationships"],"subTopics":["couple_conflicts"],"reasoning":"Mobbing durch deine Freundin ist ein Beziehungskonflikt, der sehr belastend sein kann.","intensity":"medium","summary":"Konflikte in der Beziehung können sehr belastend sein. Es ist gut, dass du Unterstützung suchst.","crisis":false,"crisisType":null}

Input: "Ich habe Panikattacken in der U-Bahn."
Output: {"topics":["anxiety"],"subTopics":["panic_attacks","phobias"],"reasoning":"Deine Panikattacken in der U-Bahn deuten auf Angststörung mit einer möglichen Phobie hin.","intensity":"medium","summary":"Panikattacken in bestimmten Situationen sind behandelbar.","crisis":false,"crisisType":null}`;

export async function analyzeSituation(text: string): Promise<SituationAnalysis> {
  // PROTECTION: Rate limiting per IP
  const clientIP = await getClientIP();
  const rateLimit = checkRateLimit(clientIP);
  if (!rateLimit.allowed) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    // Return empty result instead of throwing to avoid exposing rate limit info
    return {
      suggestedTopics: [],
      suggestedSubTopics: [],
      suggestedSpecialties: [],
      suggestedCommunicationStyle: null,
      suggestedTherapyFocus: null,
      suggestedIntensityLevel: null,
      understandingSummary: "Bitte warte einen Moment bevor du eine weitere Analyse startest.",
      suggestedMethods: [],
      keywords: [],
      topicReasons: "",
      crisisDetected: false,
      crisisType: null,
    };
  }

  // PROTECTION: Sanitize and truncate input
  const sanitizedText = sanitizeAndTruncateInput(text);

  if (!sanitizedText || sanitizedText.length < 10) {
    return {
      suggestedTopics: [],
      suggestedSubTopics: [],
      suggestedSpecialties: [],
      suggestedCommunicationStyle: null,
      suggestedTherapyFocus: null,
      suggestedIntensityLevel: null,
      understandingSummary: "",
      suggestedMethods: [],
      keywords: [],
      topicReasons: "",
      crisisDetected: false,
      crisisType: null,
    };
  }

  // Detect language for fallback
  const lang = detectLanguage(sanitizedText);

  // SAFETY: Always check for crisis with keywords first (fast, reliable)
  const keywordCrisis = detectCrisis(sanitizedText, lang);
  if (keywordCrisis.crisisDetected) {
    return {
      suggestedTopics: [],
      suggestedSubTopics: [],
      suggestedSpecialties: [],
      suggestedCommunicationStyle: null,
      suggestedTherapyFocus: null,
      suggestedIntensityLevel: "high",
      understandingSummary: "",
      suggestedMethods: [],
      keywords: [],
      topicReasons: "",
      crisisDetected: true,
      crisisType: keywordCrisis.crisisType,
    };
  }

  try {
    // PRIVACY: Anonymize text before sending to external AI
    const anonymizedText = anonymizeText(sanitizedText);

    // Use Groq AI for analysis (optimized settings per Groq Best Practices)
    // Note: Using response_format: json_object guarantees JSON output,
    // so assistant prefilling is not needed and can cause parsing issues
    const completion = await getGroqClient().chat.completions.create({
      messages: [
        { role: "system", content: AI_SYSTEM_PROMPT },
        { role: "user", content: anonymizedText }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.2, // Lower temperature for data extraction tasks
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const aiResult = JSON.parse(responseText);

    // Validate and sanitize AI response
    let topics = (aiResult.topics || [])
      .filter((t: string) => AVAILABLE_TOPICS.includes(t))
      .slice(0, 4);

    const intensity = ["low", "medium", "high"].includes(aiResult.intensity)
      ? aiResult.intensity as IntensityLevel
      : "medium";

    // Check if AI detected crisis
    if (aiResult.crisis === true) {
      return {
        suggestedTopics: [],
        suggestedSubTopics: [],
        suggestedSpecialties: [],
        suggestedCommunicationStyle: null,
        suggestedTherapyFocus: null,
        suggestedIntensityLevel: "high",
        understandingSummary: "",
        suggestedMethods: [],
        keywords: [],
        topicReasons: "",
        crisisDetected: true,
        crisisType: aiResult.crisisType || "acute_danger",
      };
    }

    // Validate and sanitize AI subTopics response
    const subTopics = (aiResult.subTopics || [])
      .filter((st: string) => AVAILABLE_SUBTOPICS.includes(st))
      .slice(0, 5);

    // Ensure parent topics are included when subTopics are detected
    topics = ensureParentTopics(topics, subTopics);

    // Map topics to specialties
    const mappedSpecialties = topics
      .map((t: string) => SPECIALTY_MAPPING[t])
      .filter((s: Specialty | undefined): s is Specialty => !!s);
    const specialties = Array.from(new Set(mappedSpecialties)) as Specialty[];

    return {
      suggestedTopics: topics,
      suggestedSubTopics: subTopics,
      suggestedSpecialties: specialties,
      suggestedCommunicationStyle: null,
      suggestedTherapyFocus: null,
      suggestedIntensityLevel: intensity,
      understandingSummary: aiResult.summary || "",
      suggestedMethods: [],
      keywords: [],
      topicReasons: aiResult.reasoning || "",
      crisisDetected: false,
      crisisType: null,
    };

  } catch (error) {
    console.error("Groq AI analysis failed, using fallback:", error);

    // Fallback to keyword-based analysis
    const detectedTopics = detectTopics(sanitizedText, lang);
    const subTopics = detectSubTopics(sanitizedText, lang);
    // Ensure parent topics are included when subTopics are detected
    const topics = ensureParentTopics(detectedTopics, subTopics);
    const intensity = detectIntensity(sanitizedText, lang);
    const specialties = [...new Set(
      topics.map((t) => SPECIALTY_MAPPING[t]).filter((s): s is Specialty => !!s)
    )];
    const summary = generateSummary(topics, intensity, lang);

    return {
      suggestedTopics: topics,
      suggestedSubTopics: subTopics,
      suggestedSpecialties: specialties,
      suggestedCommunicationStyle: null,
      suggestedTherapyFocus: null,
      suggestedIntensityLevel: intensity,
      understandingSummary: summary,
      suggestedMethods: [],
      keywords: [],
      topicReasons: "Basierend auf Schlüsselwörtern in deiner Beschreibung.",
      crisisDetected: false,
      crisisType: null,
    };
  }
}

// ============================================================================
// AI CLOSEST MATCH - For custom descriptions
// ============================================================================

export interface ClosestMatchResult {
  matchedIds: string[];
  explanation: string;
  confidence: "high" | "medium" | "low";
}

/**
 * Find the closest matching SubTopics for a custom description
 */
export async function findClosestSubTopics(
  description: string,
  availableSubTopics: { id: string; label: string }[]
): Promise<ClosestMatchResult> {
  // PROTECTION: Rate limiting per IP
  const clientIP = await getClientIP();
  const rateLimit = checkRateLimit(clientIP);
  if (!rateLimit.allowed) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return { matchedIds: [], explanation: "Bitte warte einen Moment.", confidence: "low" };
  }

  // PROTECTION: Sanitize and truncate input
  const sanitizedDesc = sanitizeAndTruncateInput(description);

  if (!sanitizedDesc || availableSubTopics.length === 0) {
    return { matchedIds: [], explanation: "", confidence: "low" };
  }

  const lang = detectLanguage(sanitizedDesc);
  const subTopicList = availableSubTopics.map(st => `- ${st.id}: ${st.label}`).join("\n");

  const systemPrompt = lang === "de"
    ? `### Role
Du bist ein Experte für psychische Gesundheit, der Nutzerbeschreibungen den passendsten Kategorien zuordnet.

### Instructions
- Analysiere die Beschreibung und finde 1-3 passende Kategorien
- Bewerte deine Zuversicht: high (klar erkennbar), medium (wahrscheinlich), low (unsicher)
- WICHTIG: Die Begründung muss sich DIREKT auf die Worte des Nutzers beziehen - erkläre WARUM diese spezifische Beschreibung zu den gewählten Kategorien passt
- Antworte NUR mit validem JSON

### Available Categories
${subTopicList}

### Expected Output
{"matchedIds":["id1","id2"],"explanation":"Personalisierte Begründung basierend auf der Nutzereingabe","confidence":"high"}

### Example
Input: "Ich habe ständig Herzrasen und Angst unter Menschen"
Output: {"matchedIds":["panic_attacks","social_anxiety"],"explanation":"Dein Herzrasen deutet auf Panikattacken hin, und die Angst unter Menschen weist auf soziale Ängste hin.","confidence":"high"}

Input: "Meine Freundin mobbt mich"
Output: {"matchedIds":["couple_conflicts"],"explanation":"Mobbing durch eine Freundin beschreibt einen Beziehungskonflikt, der belastend sein kann.","confidence":"high"}`
    : `### Role
You are a mental health expert who matches user descriptions to the most appropriate categories.

### Instructions
- Analyze the description and find 1-3 matching categories
- Rate your confidence: high (clearly identifiable), medium (likely), low (uncertain)
- IMPORTANT: The explanation must DIRECTLY reference the user's words - explain WHY this specific description matches the chosen categories
- Respond ONLY with valid JSON

### Available Categories
${subTopicList}

### Expected Output
{"matchedIds":["id1","id2"],"explanation":"Personalized reasoning based on user input","confidence":"high"}

### Example
Input: "I have constant racing heart and fear of being around people"
Output: {"matchedIds":["panic_attacks","social_anxiety"],"explanation":"Your racing heart suggests panic attacks, and fear around people points to social anxiety.","confidence":"high"}

Input: "My friend is bullying me"
Output: {"matchedIds":["couple_conflicts"],"explanation":"Being bullied by a friend describes a relationship conflict that can be distressing.","confidence":"high"}`;

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: sanitizedDesc }
      ],
      temperature: 0.2,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { matchedIds: [], explanation: "", confidence: "low" };
    }

    const result = JSON.parse(content);
    const validIds = availableSubTopics.map(st => st.id);
    const matchedIds = (result.matchedIds || []).filter((id: string) => validIds.includes(id));

    return {
      matchedIds,
      explanation: result.explanation || "",
      confidence: result.confidence || "medium",
    };
  } catch {
    return { matchedIds: [], explanation: "", confidence: "low" };
  }
}

/**
 * Find the closest matching intensity level for a custom description
 */
export async function findClosestIntensity(
  description: string
): Promise<{ level: IntensityLevel; explanation: string }> {
  // PROTECTION: Rate limiting per IP
  const clientIP = await getClientIP();
  const rateLimit = checkRateLimit(clientIP);
  if (!rateLimit.allowed) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return { level: "medium", explanation: "Bitte warte einen Moment." };
  }

  // PROTECTION: Sanitize and truncate input
  const sanitizedDesc = sanitizeAndTruncateInput(description);

  if (!sanitizedDesc) {
    return { level: "medium", explanation: "" };
  }

  const lang = detectLanguage(sanitizedDesc);

  const systemPrompt = lang === "de"
    ? `### Role
Du bist ein Experte für psychische Gesundheit, der die Intensität von Problemen einschätzt.

### Instructions
- Bewerte die Dringlichkeit/Intensität des beschriebenen Problems
- Wähle: low, medium oder high
- Antworte NUR mit validem JSON

### Intensity Levels
- low: Leichte Belastung, präventiv, Selbstoptimierung, "manchmal", "gelegentlich"
- medium: Moderate Belastung, beeinträchtigt Alltag teilweise, "oft", "belastend"
- high: Starke Belastung, dringend, akute Symptome, "kann nicht mehr", "verzweifelt"

### Expected Output
{"level":"medium","explanation":"Begründung"}

### Example
Input: "Ich bin manchmal gestresst bei der Arbeit"
Output: {"level":"low","explanation":"Gelegentlicher Arbeitsstress ist normal und deutet auf leichte, bewältigbare Belastung hin."}`
    : `### Role
You are a mental health expert who assesses the intensity of problems.

### Instructions
- Evaluate the urgency/intensity of the described issue
- Choose: low, medium or high
- Respond ONLY with valid JSON

### Intensity Levels
- low: Mild distress, preventive, self-improvement, "sometimes", "occasionally"
- medium: Moderate distress, partially affects daily life, "often", "stressful"
- high: Severe distress, urgent, acute symptoms, "can't cope", "desperate"

### Expected Output
{"level":"medium","explanation":"Reasoning"}

### Example
Input: "I'm sometimes stressed at work"
Output: {"level":"low","explanation":"Occasional work stress is normal and indicates mild, manageable distress."}`;

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: sanitizedDesc }
      ],
      temperature: 0.2,
      max_tokens: 150,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { level: "medium", explanation: "" };
    }

    const result = JSON.parse(content);
    const validLevels: IntensityLevel[] = ["low", "medium", "high"];
    const level = validLevels.includes(result.level) ? result.level : "medium";

    return {
      level,
      explanation: result.explanation || "",
    };
  } catch {
    return { level: "medium", explanation: "" };
  }
}
