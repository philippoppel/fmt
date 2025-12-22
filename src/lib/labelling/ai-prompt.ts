/**
 * AI Prompt for Label Suggestions
 *
 * System prompt for Groq to analyze therapy request texts
 * and suggest appropriate labels from the taxonomy.
 */

import { MATCHING_TOPICS } from "@/lib/matching/topics";
import { INTENSITY_STATEMENTS } from "@/lib/matching/intensity";

// German labels for topics (used in prompts)
const TOPIC_LABELS_DE: Record<string, string> = {
  family: "Familie",
  anxiety: "Angst",
  depression: "Depression",
  relationships: "Beziehungen",
  burnout: "Burnout",
  trauma: "Trauma",
  addiction: "Sucht",
  eating_disorders: "Essstörungen",
  adhd: "ADHS",
  self_care: "Selbstfürsorge",
  stress: "Stress",
  sleep: "Schlaf",
};

// Build dynamic taxonomy reference from existing definitions
function buildTaxonomyReference(): string {
  const mainCategories = MATCHING_TOPICS.filter((t) => t.id !== "other")
    .map((t) => t.id)
    .join(", ");

  const subcategoriesSection = MATCHING_TOPICS.filter((t) => t.id !== "other")
    .map((topic) => {
      const subs = topic.subTopics.map((st) => st.id).join(", ");
      return `${topic.id}: ${subs}`;
    })
    .join("\n");

  const intensitySection = Object.entries(INTENSITY_STATEMENTS)
    .map(([topicId, statements]) => {
      const ids = statements.map((s) => s.id).join(", ");
      return `${topicId}: ${ids}`;
    })
    .join("\n");

  return `
### Verfügbare Hauptkategorien
${mainCategories}

### Subkategorien pro Hauptkategorie
${subcategoriesSection}

### Intensitätsfragen pro Hauptkategorie
${intensitySection}
`.trim();
}

export const LABEL_SUGGESTION_SYSTEM_PROMPT = `Du bist ein Experte für psychische Gesundheit und hilfst beim Klassifizieren von Therapie-Anfragen für ein Matching-System.

### Aufgabe
Analysiere den Text einer hilfesuchenden Person und schlage passende Kategorien vor. Du klassifizierst NUR - du gibst KEINE Therapieempfehlungen oder Ratschläge.

${buildTaxonomyReference()}

### Regeln für die Klassifikation

1. **Hauptkategorien (main)**
   - Wähle 1-3 Kategorien, priorisiert nach Relevanz
   - rank 1 = wichtigste/offensichtlichste Kategorie
   - confidence: 0.0-1.0 basierend auf Textklarheit
   - Nur Kategorien aus der obigen Liste verwenden

2. **Subkategorien (sub)**
   - Nur für gewählte Hauptkategorien
   - Nur wenn im Text klar erkennbar
   - Leeres Objekt {} wenn nichts erkennbar

3. **Intensitätsfragen (intensity)**
   - Nur für gewählte Hauptkategorien
   - Nur Fragen markieren, deren Antwort im Text erkennbar ist
   - Leeres Objekt {} wenn nichts erkennbar

4. **Verwandte Themen (related)**
   - Themen die oft mit den Hauptkategorien zusammenhängen
   - NICHT die Hauptkategorien selbst
   - strength: "OFTEN" (häufig zusammen) oder "SOMETIMES" (gelegentlich)
   - Leeres Array [] wenn keine

5. **Unsicherheit (uncertainSuggested)**
   - true wenn Text mehrdeutig ist
   - true wenn mehrere Interpretationen möglich
   - false wenn Kategorie klar erkennbar

6. **Begründung (rationaleShort)**
   - Genau 1 Satz auf Deutsch
   - Erklärt die Hauptkategorie-Wahl
   - Keine Therapieempfehlungen
   - Beispiel: "Der Text beschreibt Symptome von Erschöpfung und Überforderung am Arbeitsplatz."

### Output Format
Antworte AUSSCHLIESSLICH mit validem JSON in folgendem Format:

{
  "main": [
    {"key": "depression", "rank": 1, "confidence": 0.95},
    {"key": "sleep", "rank": 2, "confidence": 0.72}
  ],
  "sub": {
    "depression": ["chronic_sadness", "lack_motivation"]
  },
  "intensity": {
    "depression": ["dep_daily"]
  },
  "related": [
    {"key": "stress", "strength": "OFTEN"}
  ],
  "uncertainSuggested": false,
  "rationaleShort": "Der Text beschreibt typische Symptome einer Depression mit begleitenden Schlafproblemen."
}

### Wichtig
- KEINE Markdown-Formatierung
- KEINE Erklärungen außerhalb des JSON
- KEINE Therapieempfehlungen
- Nur Keys aus der Taxonomie verwenden
- Bei unklarem Text: weniger Kategorien, höhere Unsicherheit`;

/**
 * User prompt template for label suggestion
 */
export function buildUserPrompt(text: string): string {
  return `Analysiere und klassifiziere folgenden Text:

"${text}"

Antworte nur mit dem JSON-Objekt.`;
}

/**
 * Get all valid category keys for validation
 */
export function getValidCategoryKeys(): Set<string> {
  return new Set(
    MATCHING_TOPICS.filter((t) => t.id !== "other").map((t) => t.id)
  );
}

/**
 * Get all valid subcategory keys for validation
 */
export function getValidSubcategoryKeys(): Set<string> {
  const keys = new Set<string>();
  MATCHING_TOPICS.forEach((topic) => {
    topic.subTopics.forEach((st) => keys.add(st.id));
  });
  return keys;
}

/**
 * Get all valid intensity keys for validation
 */
export function getValidIntensityKeys(): Set<string> {
  const keys = new Set<string>();
  Object.values(INTENSITY_STATEMENTS).forEach((statements) => {
    statements.forEach((s) => keys.add(s.id));
  });
  return keys;
}

/**
 * Get subcategory keys for a specific category
 */
export function getSubcategoryKeysForCategory(categoryKey: string): Set<string> {
  const topic = MATCHING_TOPICS.find((t) => t.id === categoryKey);
  if (!topic) return new Set();
  return new Set(topic.subTopics.map((st) => st.id));
}

/**
 * Get intensity keys for a specific category
 */
export function getIntensityKeysForCategory(categoryKey: string): Set<string> {
  const statements = INTENSITY_STATEMENTS[categoryKey];
  if (!statements) return new Set();
  return new Set(statements.map((s) => s.id));
}

/**
 * System prompt for generating realistic therapy request cases
 */
export const CASE_GENERATION_SYSTEM_PROMPT = `Du bist ein Experte für psychische Gesundheit und generierst realistische Fallbeschreibungen für ein Trainings-Dataset.

### Aufgabe
Generiere eine authentische Fallbeschreibung aus der Ich-Perspektive einer hilfesuchenden Person. Die Person beschreibt ihre Situation so, wie sie es in einem Erstgespräch oder einer Therapie-Anfrage tun würde.

### Verfügbare Themen
${MATCHING_TOPICS.filter((t) => t.id !== "other").map((t) => `- ${t.id}: ${TOPIC_LABELS_DE[t.id] || t.id}`).join("\n")}

### Regeln für die Generierung

1. **Perspektive**: Immer Ich-Perspektive ("Ich fühle mich...", "Seit einiger Zeit...")
2. **Länge**: 50-150 Wörter, 2-4 Sätze
3. **Authentizität**: Alltagssprache, keine Fachbegriffe
4. **Emotionen**: Beschreibe Gefühle konkret ("antriebslos", "ängstlich", "überfordert")
5. **Kontext**: Erwähne Auslöser oder Lebensumstände wenn passend
6. **Variation**: Jeder Fall soll einzigartig sein (verschiedene Altersgruppen, Situationen)

### Beispiele

Beispiel 1 (Depression):
"Ich weiß nicht mehr weiter. Seit meiner Trennung vor drei Monaten fühle ich mich nur noch leer. Morgens aus dem Bett zu kommen ist ein Kampf, und selbst Dinge, die mir früher Spaß gemacht haben, interessieren mich nicht mehr."

Beispiel 2 (Angst):
"Jedes Mal wenn ich zur Arbeit fahre, bekomme ich Herzrasen und kann kaum atmen. Letzte Woche musste ich mitten im Meeting rausgehen. Ich habe Angst, dass meine Kollegen denken, ich bin nicht belastbar."

Beispiel 3 (Beziehung):
"Mein Partner und ich streiten uns ständig über Kleinigkeiten. Wir reden aneinander vorbei und am Ende fühle ich mich immer schuldig. Ich liebe ihn, aber so kann es nicht weitergehen."

### Output Format
Antworte NUR mit der Fallbeschreibung als reiner Text. Keine Überschriften, keine Labels, keine Erklärungen.`;

/**
 * User prompt for case generation with optional topic focus
 */
export function buildCaseGenerationPrompt(focusTopic?: string): string {
  if (focusTopic) {
    const topicLabel = TOPIC_LABELS_DE[focusTopic] || focusTopic;
    return `Generiere eine Fallbeschreibung mit Fokus auf das Thema "${topicLabel}". Die Person soll Symptome oder Situationen beschreiben, die zu diesem Thema passen, aber das Thema nicht direkt benennen.`;
  }
  return `Generiere eine neue, einzigartige Fallbeschreibung. Wähle zufällig 1-2 Themen aus der Liste und kombiniere sie realistisch.`;
}
