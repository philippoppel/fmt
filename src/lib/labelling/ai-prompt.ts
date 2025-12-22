/**
 * AI Prompt for Label Suggestions
 *
 * System prompt for Groq to analyze therapy request texts
 * and suggest appropriate labels from the taxonomy.
 */

import { MATCHING_TOPICS } from "@/lib/matching/topics";
import { INTENSITY_STATEMENTS } from "@/lib/matching/intensity";

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
