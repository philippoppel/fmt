/**
 * Empathic Freetext Matcher
 *
 * Dieser Matcher ist darauf ausgelegt, Menschen das Gefühl zu geben,
 * verstanden zu werden - nicht nur Topics zu klassifizieren.
 *
 * Kernprinzipien:
 * 1. Empathische Reflexion - "Ich höre, dass..."
 * 2. Transparente Erklärung - "Deshalb suchen wir..."
 * 3. Sanfte Korrekturmöglichkeit - "Passt das?"
 * 4. Fehlertoleranz - Rechtschreibfehler, Umgangssprache
 */

import Groq from "groq-sdk";
import type { Specialty } from "@/types/therapist";

// Lazy initialization
let groq: Groq | null = null;
function getGroqClient(): Groq {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

export interface EmpathicMatchResult {
  // Die erkannten Specialties
  matchedSpecialties: Specialty[];

  // Empathische Reflexion - zeigt dass wir verstanden haben
  // z.B. "Es klingt so, als würdest du gerade eine sehr schwere Zeit durchmachen..."
  reflection: string;

  // Erklärung warum diese Therapeuten passen
  // z.B. "Therapeuten mit Erfahrung in Beziehungsthemen können dir helfen..."
  explanation: string;

  // Erkannte Themen in natürlicher Sprache
  // z.B. ["Trennung", "Schlafprobleme", "Traurigkeit"]
  recognizedThemes: string[];

  // Intensität der Belastung
  intensity: "mild" | "moderate" | "severe";

  // Confidence
  confidence: "high" | "medium" | "low";

  // Wurde eine Krise erkannt?
  crisisDetected: boolean;
}

// Der Prompt ist das Herzstück - er muss empathisch UND präzise sein
const EMPATHIC_SYSTEM_PROMPT = `Du bist ein einfühlsamer Helfer, der Menschen dabei unterstützt, den richtigen Therapeuten zu finden.

DEINE AUFGABE:
Menschen teilen oft chaotisch, emotional und mit Rechtschreibfehlern mit, was sie belastet.
Deine Aufgabe ist es, sie wirklich zu VERSTEHEN und ihnen das Gefühl zu geben, gehört zu werden.

WICHTIG - SPRACHE:
- Antworte IMMER in der Sprache der Eingabe (Deutsch oder Englisch)
- Verstehe Umgangssprache: "scheiße" = belastend, "hab keine lust auf nix" = Antriebslosigkeit
- Ignoriere Rechtschreibfehler: "panickattaken" = Panikattacken, "depri" = Depression

SPECIALTIES (wähle 1-2):
- depression: Niedergeschlagenheit, Antriebslosigkeit, Hoffnungslosigkeit, Traurigkeit
- anxiety: Angst, Panik, Sorgen, Nervosität, Vermeidung
- trauma: Traumatische Erlebnisse, Flashbacks, Missbrauch, Verlust
- relationships: Beziehungsprobleme, Trennung, Kommunikation, Einsamkeit
- burnout: Erschöpfung, Arbeitsstress, Überlastung, keine Energie
- addiction: Sucht, Alkohol, Drogen, Spielen, Internet
- eating_disorders: Essprobleme, Körperbild, Gewicht
- adhd: Konzentration, Chaos, Impulsivität, Prokrastination

OUTPUT FORMAT (JSON):
{
  "specialties": ["specialty1"],
  "reflection": "Empathische Reflexion in 1-2 Sätzen, die zeigt dass du verstehst was die Person durchmacht. Beginne mit 'Es klingt so, als...' oder 'Ich höre, dass...' NIEMALS mit 'Basierend auf deiner Beschreibung'",
  "explanation": "1 Satz warum diese Therapeuten helfen können. Konkret und hoffnungsvoll.",
  "themes": ["Thema1", "Thema2"],
  "intensity": "moderate",
  "crisis": false
}

BEISPIELE:

Input: "ich weiß nicht mehr weiter alles ist so scheiße grad mein freund hat schluss gemacht und ich kann nicht schlafen und heule nur noch"
Output: {
  "specialties": ["relationships", "depression"],
  "reflection": "Es klingt so, als würde dich die Trennung gerade völlig aus der Bahn werfen. Schlafprobleme und ständiges Weinen zeigen, wie sehr dich das mitnimmt.",
  "explanation": "Therapeuten mit Erfahrung in Trennungssituationen wissen, wie man durch diese intensive Zeit kommt - und dass es besser wird.",
  "themes": ["Trennung", "Schlafprobleme", "Traurigkeit"],
  "intensity": "severe",
  "crisis": false
}

Input: "hab panickattaken seit wochen kann nicht mehr zur arbeit gehen"
Output: {
  "specialties": ["anxiety"],
  "reflection": "Panikattacken über Wochen, die dich sogar von der Arbeit fernhalten - das ist wirklich belastend und du brauchst Unterstützung.",
  "explanation": "Therapeuten die auf Angst spezialisiert sind können dir konkrete Techniken zeigen, um Panikattacken zu bewältigen.",
  "themes": ["Panikattacken", "Arbeit", "Vermeidung"],
  "intensity": "severe",
  "crisis": false
}

Input: "keine ahnung was los ist fühl mich einfach scheiße"
Output: {
  "specialties": ["depression"],
  "reflection": "Manchmal ist es schwer zu benennen, was genau los ist - man fühlt sich einfach nur schlecht. Das ist okay und trotzdem ein guter Grund, Hilfe zu suchen.",
  "explanation": "Ein Therapeut kann dir helfen herauszufinden, was dahinter steckt und gemeinsam Wege zu finden.",
  "themes": ["Unwohlsein", "Unklarheit"],
  "intensity": "moderate",
  "crisis": false
}

Input: "will nicht mehr leben"
Output: {
  "specialties": ["depression"],
  "reflection": "Was du sagst, macht mir Sorgen. Solche Gedanken sind ein Zeichen, dass du jetzt sofort Unterstützung brauchst.",
  "explanation": "Bitte wende dich an die Telefonseelsorge (0800 111 0 111) - dort ist rund um die Uhr jemand für dich da.",
  "themes": ["Suizidgedanken"],
  "intensity": "severe",
  "crisis": true
}

REGELN:
1. Die Reflexion muss PERSÖNLICH sein - beziehe dich auf das was die Person KONKRET geschrieben hat
2. Validiere die Gefühle - "das ist verständlich", "das ist wirklich schwer"
3. Gib Hoffnung - "Therapeuten können helfen", "es kann besser werden"
4. Bei Krisen-Signalen (Suizid, Selbstverletzung): crisis=true und auf Telefonseelsorge hinweisen
5. NIEMALS urteilen oder bewerten
6. NIEMALS "Basierend auf deiner Beschreibung" oder andere roboterhafte Formulierungen`;

/**
 * Empathisches Matching mit LLM
 *
 * Warum LLM statt Keywords?
 * - Versteht Rechtschreibfehler ("panickattaken")
 * - Versteht Umgangssprache ("scheiße", "hab keine lust")
 * - Kann empathische, personalisierte Antworten geben
 * - Erkennt Nuancen und Kontext
 *
 * Mit temperature=0 ist das Ergebnis nahezu 100% reproduzierbar.
 */
export async function matchWithEmpathy(
  userInput: string
): Promise<EmpathicMatchResult> {
  const defaultResult: EmpathicMatchResult = {
    matchedSpecialties: [],
    reflection: "",
    explanation: "",
    recognizedThemes: [],
    intensity: "moderate",
    confidence: "low",
    crisisDetected: false,
  };

  if (!userInput || userInput.trim().length < 10) {
    return defaultResult;
  }

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: EMPATHIC_SYSTEM_PROMPT },
        { role: "user", content: userInput.trim() }
      ],
      temperature: 0, // Für Reproduzierbarkeit
      max_tokens: 400,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return defaultResult;
    }

    const result = JSON.parse(content);

    // Validate specialties
    const validSpecialties: Specialty[] = [
      "depression", "anxiety", "trauma", "relationships",
      "burnout", "addiction", "eating_disorders", "adhd"
    ];

    const matchedSpecialties = (result.specialties || [])
      .filter((s: string) => validSpecialties.includes(s as Specialty))
      .slice(0, 2) as Specialty[];

    // Determine confidence based on response quality
    const confidence = matchedSpecialties.length > 0 && result.reflection
      ? (result.intensity === "severe" ? "high" : "medium")
      : "low";

    return {
      matchedSpecialties,
      reflection: result.reflection || "",
      explanation: result.explanation || "",
      recognizedThemes: result.themes || [],
      intensity: ["mild", "moderate", "severe"].includes(result.intensity)
        ? result.intensity
        : "moderate",
      confidence,
      crisisDetected: result.crisis === true,
    };

  } catch (error) {
    console.error("Empathic matching failed:", error);
    return defaultResult;
  }
}

/**
 * Formatiert das Ergebnis für die UI
 */
export function formatForUI(result: EmpathicMatchResult, lang: "de" | "en"): {
  title: string;
  message: string;
  specialtyLabels: string[];
} {
  // Partial mapping for common specialties used in matching
  const specialtyNames: Partial<Record<Specialty, { de: string; en: string }>> = {
    depression: { de: "Depression & Stimmung", en: "Depression & Mood" },
    anxiety: { de: "Angst & Panik", en: "Anxiety & Panic" },
    trauma: { de: "Trauma & Belastung", en: "Trauma & Stress" },
    relationships: { de: "Beziehungen", en: "Relationships" },
    burnout: { de: "Burnout & Erschöpfung", en: "Burnout & Exhaustion" },
    addiction: { de: "Sucht", en: "Addiction" },
    eating_disorders: { de: "Essstörungen", en: "Eating Disorders" },
    adhd: { de: "ADHS", en: "ADHD" },
    autism: { de: "Autismus", en: "Autism" },
    ocd: { de: "Zwänge", en: "OCD" },
    psychosomatic: { de: "Psychosomatik", en: "Psychosomatic" },
    lgbtq: { de: "LGBTQ+", en: "LGBTQ+" },
    couples: { de: "Paartherapie", en: "Couples Therapy" },
    children: { de: "Kinder & Jugend", en: "Children & Youth" },
    elderly: { de: "Ältere Menschen", en: "Elderly" },
    migration: { de: "Migration", en: "Migration" },
    grief: { de: "Trauer", en: "Grief" },
    sleep: { de: "Schlaf", en: "Sleep" },
    stress: { de: "Stress", en: "Stress" },
    identity: { de: "Identität & Selbstwert", en: "Identity & Self-Esteem" },
    family: { de: "Familie", en: "Family" },
    career: { de: "Karriere", en: "Career" },
    divorce: { de: "Trennung", en: "Divorce" },
    parenting: { de: "Erziehung", en: "Parenting" },
    phobias: { de: "Phobien", en: "Phobias" },
    panic: { de: "Panik", en: "Panic" },
    bipolar: { de: "Bipolare Störung", en: "Bipolar" },
  };

  const specialtyLabels = result.matchedSpecialties.map(
    s => specialtyNames[s]?.[lang] || s
  );

  const title = lang === "de"
    ? "Wir haben dich verstanden"
    : "We understand you";

  const message = result.reflection + "\n\n" + result.explanation;

  return { title, message, specialtyLabels };
}
