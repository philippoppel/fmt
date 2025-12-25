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
import { matchWithEmbeddings } from "@/lib/matching/embedding-matcher";
import { matchWithEmpathy, type EmpathicMatchResult } from "@/lib/matching/empathic-matcher";

// Re-export types for consumers
export type { IntensityLevel, CrisisType } from "@/lib/matching/situation-detection";
export type { CrisisDetectionResult } from "@/lib/matching/situation-detection";

// ============================================================================
// RATE LIMITING & INPUT PROTECTION
// ============================================================================

const MAX_INPUT_LENGTH = 1000; // Max characters for input text
const RATE_LIMIT_REQUESTS = 20; // Max requests per IP (increased for better UX during exploration)
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

export type ConfidenceLevel = "high" | "medium" | "low";

export interface SituationAnalysis {
  suggestedTopics: string[];
  suggestedSubTopics: string[];
  suggestedSpecialties: Specialty[];
  suggestedCommunicationStyle: string | null;
  suggestedTherapyFocus: string | null;
  suggestedIntensityLevel: IntensityLevel | null;
  understandingSummary: string;
  recommendation: string;
  confidence: ConfidenceLevel;
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

// OPTIMIZED PROMPT - Focused on matching, not therapy advice
const AI_SYSTEM_PROMPT = `Therapeuten-Matching-Assistent. Ordne psychische Themen zu. NUR JSON.

Topics: ${AVAILABLE_TOPICS.join(",")}
SubTopics: social_anxiety,panic_attacks,phobias,generalized_anxiety,chronic_sadness,lack_motivation,grief,loneliness,couple_conflicts,breakup,dating_issues,intimacy,divorce,parenting,family_conflicts,ptsd,childhood_trauma,accident_trauma,loss,work_stress,exhaustion,work_life_balance,alcohol,drugs,behavioral_addiction,gaming,anorexia,bulimia,binge_eating,concentration,impulsivity,adult_adhd,self_esteem,boundaries,life_changes,chronic_stress,exam_anxiety,performance_pressure,insomnia,nightmares,sleep_anxiety

Regeln:
- confidence: high (klar psychisches Thema), medium (könnte passen), low (unklar/off-topic)
- Bei körperlichen Beschwerden (Blähungen, Kopfschmerzen etc.) ohne psychischen Bezug: topics=[], confidence=low
- understanding: 1 kurzer Satz, direkt, KEINE Floskeln ("Hey", "Ich höre", "Das klingt")
- recommendation: NUR wenn confidence=high, 1 Satz warum diese Topics passen

Output: {"topics":[],"subTopics":[],"understanding":"...","recommendation":"","confidence":"medium","intensity":"medium"}

Beispiele:
"Erschöpft, kann nicht schlafen" → {"topics":["burnout","sleep"],"subTopics":["exhaustion","insomnia"],"understanding":"Erschöpfung und Schlafprobleme können zusammenhängen.","recommendation":"Burnout und Schlaf-Spezialisierung passen, da beides oft verbunden ist.","confidence":"high","intensity":"medium"}

"Ich habe Blähungen" → {"topics":[],"subTopics":[],"understanding":"Das klingt nach einem körperlichen Thema.","recommendation":"","confidence":"low","intensity":"low"}

"Mein Chef nervt mich" → {"topics":["stress","burnout"],"subTopics":["work_stress"],"understanding":"Konflikte am Arbeitsplatz können belasten.","recommendation":"","confidence":"medium","intensity":"low"}`;

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
      recommendation: "",
      confidence: "low",
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
      recommendation: "",
      confidence: "low",
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
      recommendation: "",
      confidence: "high",
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
    // Temperature set to 0 for reproducible results
    const completion = await getGroqClient().chat.completions.create({
      messages: [
        { role: "system", content: AI_SYSTEM_PROMPT },
        { role: "user", content: anonymizedText }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0, // Set to 0 for maximum reproducibility
      max_tokens: 250, // Reduced from 500 - we only need topics, subtopics, reasoning, intensity
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const aiResult = JSON.parse(responseText);

    // Validate AI response
    let topics = (aiResult.topics || [])
      .filter((t: string) => AVAILABLE_TOPICS.includes(t))
      .slice(0, 4);

    const subTopics = (aiResult.subTopics || [])
      .filter((st: string) => AVAILABLE_SUBTOPICS.includes(st))
      .slice(0, 5);

    const intensity = ["low", "medium", "high"].includes(aiResult.intensity)
      ? aiResult.intensity as IntensityLevel
      : "medium";

    const confidence = ["high", "medium", "low"].includes(aiResult.confidence)
      ? aiResult.confidence as ConfidenceLevel
      : "medium";

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
      understandingSummary: aiResult.understanding || "",
      recommendation: aiResult.recommendation || "",
      confidence,
      suggestedMethods: [],
      keywords: [],
      topicReasons: "",
      crisisDetected: false, // Crisis handled by keywords before AI call
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
      recommendation: "",
      confidence: topics.length > 0 ? "medium" : "low",
      suggestedMethods: [],
      keywords: [],
      topicReasons: "",
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
      temperature: 0, // Set to 0 for maximum reproducibility
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

  // OPTIMIZED PROMPT - ~150 tokens (down from ~350)
  const systemPrompt = lang === "de"
    ? `Bewerte Intensität. Antworte NUR mit JSON.
Levels: low (leicht/präventiv), medium (belastend), high (akut/dringend)
Output: {"level":"medium","explanation":"Kurze Begründung"}
Beispiel: "manchmal gestresst" → {"level":"low","explanation":"Leichte Belastung."}`
    : `Rate intensity. Reply ONLY with JSON.
Levels: low (mild/preventive), medium (distressing), high (acute/urgent)
Output: {"level":"medium","explanation":"Brief reason"}
Example: "sometimes stressed" → {"level":"low","explanation":"Mild distress."}`;

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: sanitizedDesc }
      ],
      temperature: 0, // Set to 0 for maximum reproducibility
      max_tokens: 80, // Reduced - only need level + short explanation
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

// ============================================================================
// SPECIALTY MATCHING - For "Other" topic
// ============================================================================

const ALL_SPECIALTIES = [
  { id: "depression", de: "Depression & Niedergeschlagenheit", en: "Depression & Low Mood" },
  { id: "anxiety", de: "Angst & Panik", en: "Anxiety & Panic" },
  { id: "trauma", de: "Trauma & Belastung", en: "Trauma & Stress" },
  { id: "relationships", de: "Beziehungen & Familie", en: "Relationships & Family" },
  { id: "addiction", de: "Sucht & Abhängigkeit", en: "Addiction" },
  { id: "eating_disorders", de: "Essstörungen", en: "Eating Disorders" },
  { id: "adhd", de: "ADHS & Konzentration", en: "ADHD & Concentration" },
  { id: "burnout", de: "Burnout & Stress", en: "Burnout & Stress" },
];

export interface SpecialtyMatchResult {
  matchedSpecialties: string[];
  explanation: string;
  confidence: "high" | "medium" | "low";
  // Empathische Reflexion die zeigt, dass wir verstanden haben
  reflection?: string;
  // Erkannte Themen in natürlicher Sprache
  recognizedThemes?: string[];
  // Intensität der Belastung
  intensity?: "mild" | "moderate" | "severe";
  // Krise erkannt?
  crisisDetected?: boolean;
}

/**
 * Deterministic keyword-based specialty matching.
 * Maps detected topics to therapist specialties.
 */
function matchSpecialtiesFromKeywords(
  text: string,
  lang: "de" | "en"
): { specialties: string[]; confidence: "high" | "medium" | "low" } {
  const detectedTopics = detectTopics(text, lang);

  if (detectedTopics.length === 0) {
    return { specialties: [], confidence: "low" };
  }

  // Map topics to specialties
  const specialtySet = new Set<string>();
  for (const topic of detectedTopics) {
    const specialty = SPECIALTY_MAPPING[topic];
    if (specialty) {
      specialtySet.add(specialty);
    }
  }

  const specialties = Array.from(specialtySet).slice(0, 2);
  const confidence = detectedTopics.length >= 2 ? "high" : "medium";

  return { specialties, confidence };
}

/**
 * Match freetext description against all available therapist specialties.
 *
 * NEUER ANSATZ: Empathisches LLM-Matching als Primary
 *
 * Warum LLM statt Keywords?
 * - Menschen schreiben chaotisch, emotional, mit Rechtschreibfehlern
 * - Sie müssen sich VERSTANDEN fühlen, nicht nur klassifiziert
 * - LLM versteht "panickattaken", "hab keine lust auf nix", "alles scheiße"
 * - Mit temperature=0 ist es reproduzierbar
 *
 * Fallback auf Keywords nur wenn LLM nicht verfügbar
 */
export async function matchFreetextToSpecialties(
  description: string
): Promise<SpecialtyMatchResult> {
  // PROTECTION: Sanitize and truncate input
  const sanitizedDesc = sanitizeAndTruncateInput(description);

  if (!sanitizedDesc || sanitizedDesc.length < 10) {
    return { matchedSpecialties: [], explanation: "", confidence: "low" };
  }

  const lang = detectLanguage(sanitizedDesc);

  // PRIVACY: Anonymize text before sending to external AI
  const anonymizedDesc = anonymizeText(sanitizedDesc);

  // PRIMARY: Empathisches LLM-Matching
  // - Versteht Rechtschreibfehler und Umgangssprache
  // - Gibt personalisierte, empathische Antworten
  // - Mit temperature=0 reproduzierbar
  const clientIP = await getClientIP();
  const rateLimit = checkRateLimit(clientIP);

  if (rateLimit.allowed) {
    try {
      const empathicResult = await matchWithEmpathy(anonymizedDesc);

      if (empathicResult.matchedSpecialties.length > 0) {
        return {
          matchedSpecialties: empathicResult.matchedSpecialties,
          explanation: empathicResult.explanation,
          confidence: empathicResult.confidence,
          reflection: empathicResult.reflection,
          recognizedThemes: empathicResult.recognizedThemes,
          intensity: empathicResult.intensity,
          crisisDetected: empathicResult.crisisDetected,
        };
      }
    } catch (error) {
      console.error("Empathic matching failed, falling back:", error);
    }
  }

  // FALLBACK: Keyword + Embedding Matching (wenn LLM nicht verfügbar)
  const keywordResult = matchSpecialtiesFromKeywords(sanitizedDesc, lang);
  const embeddingResult = matchWithEmbeddings(sanitizedDesc);

  // Merge results
  const mergedSpecialties = [...new Set([
    ...keywordResult.specialties,
    ...embeddingResult.matchedSpecialties,
  ])].slice(0, 2);

  if (mergedSpecialties.length > 0) {
    const specialtyLabels = mergedSpecialties
      .map(id => ALL_SPECIALTIES.find(s => s.id === id)?.[lang] || id)
      .join(lang === "de" ? " und " : " and ");

    // Generiere eine einfache empathische Nachricht als Fallback
    const fallbackReflection = lang === "de"
      ? "Danke, dass du das mit uns teilst."
      : "Thank you for sharing this with us.";

    return {
      matchedSpecialties: mergedSpecialties,
      explanation: lang === "de"
        ? `Therapeuten mit Erfahrung in ${specialtyLabels} können dir helfen.`
        : `Therapists experienced in ${specialtyLabels} can help you.`,
      confidence: keywordResult.confidence === "high" || embeddingResult.confidence === "high"
        ? "high"
        : "medium",
      reflection: fallbackReflection,
    };
  }

  return { matchedSpecialties: [], explanation: "", confidence: "low" };
}


/**
 * Get specialty label for display (exported via SpecialtyMatchResult)
 */
export async function getSpecialtyLabels(specialtyIds: string[], lang: "de" | "en" = "de"): Promise<Record<string, string>> {
  const labels: Record<string, string> = {};
  for (const id of specialtyIds) {
    const specialty = ALL_SPECIALTIES.find(s => s.id === id);
    labels[id] = specialty ? specialty[lang] : id;
  }
  return labels;
}
