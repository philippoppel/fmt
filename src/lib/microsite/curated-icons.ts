import type { CuratedIcon, IconCategory, IconCategoryInfo } from "@/types/microsite";

/**
 * Icon categories with labels
 */
export const ICON_CATEGORIES: IconCategoryInfo[] = [
  { id: "psyche", label: "Mental Health", labelDe: "Psychische Gesundheit" },
  { id: "relationships", label: "Relationships", labelDe: "Beziehungen" },
  { id: "wellness", label: "Wellness", labelDe: "Wohlbefinden" },
  { id: "growth", label: "Growth", labelDe: "Wachstum" },
  { id: "body", label: "Body", labelDe: "Körper" },
  { id: "general", label: "General", labelDe: "Allgemein" },
];

/**
 * Curated icons for therapy competencies
 * Each icon is from lucide-react
 */
export const CURATED_ICONS: CuratedIcon[] = [
  // === PSYCHE / MENTAL HEALTH ===
  { name: "Brain", keywords: ["gehirn", "denken", "kognition", "gedanken", "mental"], category: "psyche" },
  { name: "Sparkles", keywords: ["klarheit", "einsicht", "erkenntnis", "aha"], category: "psyche" },
  { name: "Sun", keywords: ["positiv", "energie", "lebensfreude", "licht"], category: "psyche" },
  { name: "Moon", keywords: ["ruhe", "schlaf", "traum", "nacht", "entspannung"], category: "psyche" },
  { name: "Cloud", keywords: ["gedanken", "wolke", "leicht", "frei"], category: "psyche" },
  { name: "CloudRain", keywords: ["trauer", "depression", "schwer", "regen"], category: "psyche" },
  { name: "Zap", keywords: ["energie", "antrieb", "motivation", "kraft"], category: "psyche" },
  { name: "Flame", keywords: ["leidenschaft", "wut", "burnout", "feuer"], category: "psyche" },
  { name: "Eye", keywords: ["wahrnehmung", "achtsamkeit", "sehen", "erkennen"], category: "psyche" },
  { name: "EyeOff", keywords: ["vermeidung", "nicht sehen wollen", "blind"], category: "psyche" },
  { name: "Focus", keywords: ["fokus", "konzentration", "aufmerksamkeit", "adhs"], category: "psyche" },
  { name: "Puzzle", keywords: ["verstehen", "zusammenhänge", "lösung", "komplexität"], category: "psyche" },

  // === RELATIONSHIPS ===
  { name: "Heart", keywords: ["liebe", "gefühl", "emotion", "herz", "beziehung"], category: "relationships" },
  { name: "HeartHandshake", keywords: ["verbindung", "vertrauen", "beziehung", "partnerschaft"], category: "relationships" },
  { name: "Users", keywords: ["gruppe", "team", "familie", "menschen", "sozial"], category: "relationships" },
  { name: "UsersRound", keywords: ["gruppe", "kreis", "gemeinschaft", "zusammen"], category: "relationships" },
  { name: "Handshake", keywords: ["einigung", "zusammenarbeit", "vertrauen", "abkommen"], category: "relationships" },
  { name: "Baby", keywords: ["kind", "eltern", "geburt", "anfang", "familie"], category: "relationships" },
  { name: "UserRound", keywords: ["person", "individuum", "selbst", "ich"], category: "relationships" },
  { name: "MessageCircle", keywords: ["kommunikation", "gespräch", "dialog", "reden"], category: "relationships" },
  { name: "MessagesSquare", keywords: ["kommunikation", "austausch", "gespräche"], category: "relationships" },
  { name: "Home", keywords: ["zuhause", "familie", "geborgenheit", "sicherheit"], category: "relationships" },
  { name: "CircleUser", keywords: ["identität", "selbst", "person", "profil"], category: "relationships" },

  // === WELLNESS ===
  { name: "Leaf", keywords: ["natur", "wachstum", "ruhe", "grün", "balance"], category: "wellness" },
  { name: "TreePine", keywords: ["natur", "stabilität", "verwurzelung", "wald"], category: "wellness" },
  { name: "Flower2", keywords: ["blühen", "entwicklung", "schönheit", "wachstum"], category: "wellness" },
  { name: "Waves", keywords: ["entspannung", "fluss", "wellen", "meer", "ruhe"], category: "wellness" },
  { name: "Mountain", keywords: ["herausforderung", "ziel", "gipfel", "stärke"], category: "wellness" },
  { name: "Wind", keywords: ["atmen", "freiheit", "loslassen", "leichtigkeit"], category: "wellness" },
  { name: "Droplets", keywords: ["tränen", "reinigung", "emotion", "wasser"], category: "wellness" },
  { name: "Bird", keywords: ["freiheit", "leichtigkeit", "fliegen", "perspektive"], category: "wellness" },
  { name: "Feather", keywords: ["leicht", "sanft", "sensibel", "feder"], category: "wellness" },
  { name: "Infinity", keywords: ["unendlich", "kreislauf", "balance", "ewigkeit"], category: "wellness" },

  // === GROWTH ===
  { name: "TrendingUp", keywords: ["fortschritt", "wachstum", "verbesserung", "entwicklung"], category: "growth" },
  { name: "Target", keywords: ["ziel", "fokus", "erreichen", "vision"], category: "growth" },
  { name: "Compass", keywords: ["richtung", "orientierung", "weg", "navigation"], category: "growth" },
  { name: "Lightbulb", keywords: ["idee", "erkenntnis", "einsicht", "lösung"], category: "growth" },
  { name: "Rocket", keywords: ["start", "aufbruch", "veränderung", "dynamik"], category: "growth" },
  { name: "Flag", keywords: ["ziel", "meilenstein", "erreichen", "markierung"], category: "growth" },
  { name: "Route", keywords: ["weg", "pfad", "reise", "prozess"], category: "growth" },
  { name: "Milestone", keywords: ["fortschritt", "etappe", "erfolg", "schritt"], category: "growth" },
  { name: "Footprints", keywords: ["weg", "schritte", "fortschritt", "reise"], category: "growth" },
  { name: "RefreshCw", keywords: ["erneuerung", "neuanfang", "veränderung", "zyklus"], category: "growth" },
  { name: "ArrowUpCircle", keywords: ["aufwärts", "besser", "wachstum", "positiv"], category: "growth" },

  // === BODY ===
  { name: "Activity", keywords: ["aktivität", "puls", "leben", "energie", "körper"], category: "body" },
  { name: "HeartPulse", keywords: ["herzschlag", "leben", "gesundheit", "puls"], category: "body" },
  { name: "Bed", keywords: ["schlaf", "ruhe", "erholung", "entspannung"], category: "body" },
  { name: "BedDouble", keywords: ["paar", "intimität", "beziehung", "schlaf"], category: "body" },
  { name: "Utensils", keywords: ["essen", "ernährung", "essstörung", "nahrung"], category: "body" },
  { name: "Apple", keywords: ["ernährung", "gesundheit", "essen", "körper"], category: "body" },
  { name: "Wine", keywords: ["sucht", "alkohol", "genuss", "abhängigkeit"], category: "body" },
  { name: "Cigarette", keywords: ["sucht", "rauchen", "abhängigkeit", "gewohnheit"], category: "body" },
  { name: "Pill", keywords: ["medikamente", "behandlung", "therapie", "hilfe"], category: "body" },
  { name: "Syringe", keywords: ["medizin", "behandlung", "injektion", "sucht"], category: "body" },
  { name: "Dumbbell", keywords: ["sport", "bewegung", "kraft", "training"], category: "body" },
  { name: "PersonStanding", keywords: ["körper", "haltung", "präsenz", "selbst"], category: "body" },

  // === GENERAL ===
  { name: "Shield", keywords: ["schutz", "sicherheit", "stärke", "abwehr"], category: "general" },
  { name: "ShieldCheck", keywords: ["sicherheit", "vertrauen", "geprüft", "schutz"], category: "general" },
  { name: "Key", keywords: ["lösung", "zugang", "schlüssel", "geheimnis"], category: "general" },
  { name: "Lock", keywords: ["verschlossen", "blockade", "sicherheit", "schutz"], category: "general" },
  { name: "Unlock", keywords: ["öffnen", "befreien", "lösen", "frei"], category: "general" },
  { name: "Star", keywords: ["stern", "besonders", "leuchten", "hoffnung"], category: "general" },
  { name: "Award", keywords: ["erfolg", "anerkennung", "leistung", "preis"], category: "general" },
  { name: "Medal", keywords: ["erfolg", "gewinn", "anerkennung", "leistung"], category: "general" },
  { name: "Gem", keywords: ["wertvoll", "kostbar", "einzigartig", "schatz"], category: "general" },
  { name: "Crown", keywords: ["selbstwert", "stärke", "würde", "kraft"], category: "general" },
  { name: "Scale", keywords: ["balance", "gleichgewicht", "abwägen", "gerechtigkeit"], category: "general" },
  { name: "Clock", keywords: ["zeit", "geduld", "prozess", "dauer"], category: "general" },
  { name: "Hourglass", keywords: ["zeit", "warten", "geduld", "vergänglichkeit"], category: "general" },
  { name: "Calendar", keywords: ["termine", "planung", "zeit", "organisation"], category: "general" },
  { name: "BookOpen", keywords: ["lernen", "wissen", "bildung", "lesen"], category: "general" },
  { name: "Bookmark", keywords: ["merken", "wichtig", "speichern", "markieren"], category: "general" },
  { name: "FileHeart", keywords: ["therapie", "dokument", "plan", "herz"], category: "general" },
  { name: "ClipboardList", keywords: ["liste", "aufgaben", "plan", "organisation"], category: "general" },
  { name: "CircleHelp", keywords: ["frage", "hilfe", "unterstützung", "unsicherheit"], category: "general" },
  { name: "Anchor", keywords: ["stabilität", "halt", "sicherheit", "grund"], category: "general" },
  { name: "Umbrella", keywords: ["schutz", "sicherheit", "vorsorge", "bedeckt"], category: "general" },
  { name: "Tent", keywords: ["rückzug", "schutz", "raum", "temporär"], category: "general" },
  { name: "Construction", keywords: ["aufbau", "arbeit", "prozess", "veränderung"], category: "general" },
  { name: "Wrench", keywords: ["reparieren", "anpassen", "werkzeug", "fix"], category: "general" },
  { name: "Layers", keywords: ["schichten", "tiefe", "komplexität", "ebenen"], category: "general" },
  { name: "HandHeart", keywords: ["fürsorge", "unterstützung", "geben", "hilfe"], category: "general" },
];

/**
 * Get icons by category
 */
export function getIconsByCategory(category: IconCategory): CuratedIcon[] {
  return CURATED_ICONS.filter((icon) => icon.category === category);
}

/**
 * Search icons by keyword
 */
export function searchIcons(query: string): CuratedIcon[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return CURATED_ICONS;
  }

  return CURATED_ICONS.filter((icon) => {
    // Search in icon name
    if (icon.name.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Search in keywords
    return icon.keywords.some((keyword) =>
      keyword.toLowerCase().includes(normalizedQuery)
    );
  });
}

/**
 * Get a single icon by name
 */
export function getIconByName(name: string): CuratedIcon | undefined {
  return CURATED_ICONS.find(
    (icon) => icon.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get all icon names for a category
 */
export function getIconNamesForCategory(category: IconCategory): string[] {
  return getIconsByCategory(category).map((icon) => icon.name);
}

/**
 * Check if an icon name is valid/curated
 */
export function isValidIconName(name: string): boolean {
  return CURATED_ICONS.some(
    (icon) => icon.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get category info by id
 */
export function getCategoryInfo(categoryId: IconCategory): IconCategoryInfo | undefined {
  return ICON_CATEGORIES.find((cat) => cat.id === categoryId);
}

/**
 * Get all unique categories that have icons
 */
export function getActiveCategories(): IconCategoryInfo[] {
  const activeCategories = new Set(CURATED_ICONS.map((icon) => icon.category));
  return ICON_CATEGORIES.filter((cat) => activeCategories.has(cat.id));
}
