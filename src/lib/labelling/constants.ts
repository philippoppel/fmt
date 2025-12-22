/**
 * Shared constants for labelling
 */

// German labels for main topics
export const TOPIC_LABELS_DE: Record<string, string> = {
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

// German labels for subtopics
export const SUBTOPIC_LABELS_DE: Record<string, string> = {
  // Family
  divorce: "Scheidung/Trennung",
  parenting: "Erziehung",
  family_conflicts: "Familienkonflikte",
  generation_conflicts: "Generationenkonflikte",
  // Anxiety
  social_anxiety: "Soziale Angst",
  panic_attacks: "Panikattacken",
  phobias: "Phobien",
  generalized_anxiety: "Generalisierte Angst",
  // Depression
  chronic_sadness: "Chronische Traurigkeit",
  lack_motivation: "Antriebslosigkeit",
  grief: "Trauer",
  loneliness: "Einsamkeit",
  // Relationships
  couple_conflicts: "Paarkonflikte",
  breakup: "Trennung",
  dating_issues: "Dating-Probleme",
  intimacy: "Intimität",
  // Burnout
  work_stress: "Arbeitsstress",
  exhaustion: "Erschöpfung",
  work_life_balance: "Work-Life-Balance",
  // Trauma
  ptsd: "PTBS",
  childhood_trauma: "Kindheitstrauma",
  accident_trauma: "Unfalltrauma",
  loss: "Verlust",
  // Addiction
  alcohol: "Alkohol",
  drugs: "Drogen",
  behavioral_addiction: "Verhaltenssucht",
  gaming: "Gaming",
  // Eating disorders
  anorexia: "Magersucht",
  bulimia: "Bulimie",
  binge_eating: "Essanfälle",
  // ADHD
  concentration: "Konzentration",
  impulsivity: "Impulsivität",
  adult_adhd: "ADHS Erwachsene",
  // Self care
  self_esteem: "Selbstwert",
  boundaries: "Grenzen setzen",
  life_changes: "Lebensveränderungen",
  // Stress
  chronic_stress: "Chronischer Stress",
  exam_anxiety: "Prüfungsangst",
  performance_pressure: "Leistungsdruck",
  // Sleep
  insomnia: "Schlaflosigkeit",
  nightmares: "Albträume",
  sleep_anxiety: "Schlafangst",
};

// Combined labels for search
export const ALL_LABELS_DE: Record<string, string> = {
  ...TOPIC_LABELS_DE,
  ...SUBTOPIC_LABELS_DE,
};

// Alias for backwards compatibility
export const TOPIC_LABELS = TOPIC_LABELS_DE;
