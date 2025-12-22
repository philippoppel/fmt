/**
 * AI Prompt for Label Suggestions
 *
 * System prompt for Groq to analyze therapy request texts
 * and suggest appropriate labels from the granular labeling taxonomy.
 */

import { getAllLabelingTopics, getLabelingTopicsBySection, type TopicSection } from "@/lib/matching/topics";
import { TOPIC_LABELS_DE, SECTION_LABELS_DE } from "@/lib/labelling/constants";

// Get all labeling topics (flat list of granular categories)
const ALL_LABELING_TOPICS = getAllLabelingTopics();
const LABELING_TOPICS_BY_SECTION = getLabelingTopicsBySection();

// Build dynamic taxonomy reference from existing definitions
function buildTaxonomyReference(): string {
  const sections: TopicSection[] = ["flags", "clinical", "life", "meta"];

  const categoryList = sections.map((section) => {
    const sectionLabel = SECTION_LABELS_DE[section];
    const topics = LABELING_TOPICS_BY_SECTION[section];
    const topicList = topics
      .map((t) => `  - ${t.id}: ${TOPIC_LABELS_DE[t.id]}`)
      .join("\n");
    return `### ${sectionLabel}\n${topicList}`;
  }).join("\n\n");

  return categoryList;
}

// All valid category keys (granular labeling categories)
function getAllCategoryKeys(): string {
  return ALL_LABELING_TOPICS.map((t) => t.id).join(", ");
}

export const LABEL_SUGGESTION_SYSTEM_PROMPT = `Du bist ein Experte für psychische Gesundheit und hilfst beim Klassifizieren von Therapie-Anfragen für ein Matching-System.

### Aufgabe
Analysiere den Text einer hilfesuchenden Person und schlage passende Kategorien vor. Du klassifizierst NUR - du gibst KEINE Therapieempfehlungen oder Ratschläge.

${buildTaxonomyReference()}

### Regeln für die Klassifikation

1. **Kategorien (main)**
   - Wähle 1-3 Kategorien, priorisiert nach Relevanz
   - rank 1 = wichtigste/offensichtlichste Kategorie
   - confidence: 0.0-1.0 basierend auf Textklarheit
   - Nur Kategorien aus der obigen Liste verwenden

2. **Akute Flags (Sektion A)**
   - WICHTIG: Flags aus der Sektion "Akute Flags" nur bei klaren Hinweisen wählen
   - Suizid/Selbstverletzung, Psychose, Gewalt etc. nur wenn explizit erwähnt
   - Bei Unsicherheit: lieber nicht als Flag markieren

3. **Unsicherheit (uncertainSuggested)**
   - true wenn Text mehrdeutig ist
   - true wenn mehrere Interpretationen möglich
   - false wenn Kategorie klar erkennbar

4. **Begründung (rationaleShort)**
   - Genau 1 Satz auf Deutsch
   - Erklärt die Hauptkategorie-Wahl
   - Keine Therapieempfehlungen

### Output Format
Antworte AUSSCHLIESSLICH mit validem JSON in folgendem Format:

{
  "main": [
    {"key": "depressionMood", "rank": 1, "confidence": 0.95},
    {"key": "sleepDisorders", "rank": 2, "confidence": 0.72}
  ],
  "sub": {},
  "intensity": {},
  "related": [],
  "uncertainSuggested": false,
  "rationaleShort": "Der Text beschreibt typische Symptome einer Depression mit begleitenden Schlafproblemen."
}

### Gültige Kategorie-Keys
${getAllCategoryKeys()}

### Wichtig
- KEINE Markdown-Formatierung
- KEINE Erklärungen außerhalb des JSON
- KEINE Therapieempfehlungen
- Nur Keys aus der Taxonomie verwenden
- Bei unklarem Text: weniger Kategorien, höhere Unsicherheit
- sub, intensity und related können leer bleiben ({}, {}, [])`;

/**
 * User prompt template for label suggestion
 */
export function buildUserPrompt(text: string): string {
  return `Analysiere und klassifiziere folgenden Text:

"${text}"

Antworte nur mit dem JSON-Objekt.`;
}

/**
 * Get all valid category keys for validation (granular labeling categories)
 */
export function getValidCategoryKeys(): Set<string> {
  return new Set(ALL_LABELING_TOPICS.map((t) => t.id));
}

/**
 * Get all valid subcategory keys for validation (empty - no subcategories anymore)
 */
export function getValidSubcategoryKeys(): Set<string> {
  return new Set();
}

/**
 * Get all valid intensity keys for validation (empty - no intensity anymore)
 */
export function getValidIntensityKeys(): Set<string> {
  return new Set();
}

/**
 * Get subcategory keys for a specific category (empty - no subcategories anymore)
 */
export function getSubcategoryKeysForCategory(_categoryKey: string): Set<string> {
  return new Set();
}

/**
 * Get intensity keys for a specific category (empty - no intensity anymore)
 */
export function getIntensityKeysForCategory(_categoryKey: string): Set<string> {
  return new Set();
}

/**
 * System prompt for generating realistic therapy request cases
 */
export const CASE_GENERATION_SYSTEM_PROMPT = `Du bist ein Experte für psychische Gesundheit und generierst realistische Fallbeschreibungen für ein Trainings-Dataset.

### Aufgabe
Generiere eine authentische Fallbeschreibung aus der Ich-Perspektive einer hilfesuchenden Person. Die Person beschreibt ihre Situation so, wie sie es in einem Erstgespräch oder einer Therapie-Anfrage tun würde.

${buildTaxonomyReference()}

### Regeln für die Generierung

1. **Perspektive**: Immer Ich-Perspektive ("Ich fühle mich...", "Seit einiger Zeit...")
2. **Länge**: 50-150 Wörter, 2-4 Sätze
3. **Authentizität**: Alltagssprache, keine Fachbegriffe
4. **Emotionen**: Beschreibe Gefühle konkret ("antriebslos", "ängstlich", "überfordert")
5. **Kontext**: Erwähne Auslöser oder Lebensumstände wenn passend
6. **Variation**: Jeder Fall soll einzigartig sein (verschiedene Altersgruppen, Situationen)
7. **KEINE akuten Flags**: Generiere KEINE Fälle mit Suizid, Gewalt, Psychose etc.

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
  return `Generiere eine neue, einzigartige Fallbeschreibung. Wähle zufällig 1-2 Themen aus den Bereichen "Klinische Themen" oder "Lebensbereiche" und kombiniere sie realistisch.`;
}
