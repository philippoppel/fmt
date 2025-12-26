/**
 * Shared constants for labelling - synchronized with matching topics
 */

// German labels for all labeling categories
// Keys must match the IDs from src/lib/matching/topics.ts
export const TOPIC_LABELS_DE: Record<string, string> = {
  // ============================================================================
  // ACUTE FLAGS (6)
  // ============================================================================
  suicideSelfHarm: "Suizidgedanken / Selbstverletzung",
  psychosisMania: "Psychose / (Hypo-)Manie",
  violenceAbuse: "Gewalt / Missbrauch / Unsicherheit",
  severeSubstanceWithdrawal: "Akuter Entzug / schwere Intoxikation",
  medicallySevereEating: "Medizinisch kritische Essstörung",
  childProtection: "Kindeswohlgefährdung / Familienkrise",

  // ============================================================================
  // CLINICAL TOPICS - SUBTOPICS
  // ============================================================================

  // Depression subtopics
  depressiveMood: "Depressive Verstimmung / Niedergeschlagenheit",
  bipolarMood: "Bipolare Stimmungsschwankungen",
  griefLoss: "Trauer & Verlust",
  loneliness: "Einsamkeit / soziale Isolation",

  // Anxiety subtopics
  generalizedAnxiety: "Generalisierte Angst / ständiges Sorgen",
  panicAgoraphobia: "Panikattacken / Platzangst",
  socialAnxiety: "Soziale Angst / Schüchternheit",
  specificPhobias: "Spezifische Phobien",

  // Trauma subtopics
  childhoodTrauma: "Kindheitstrauma",
  relationshipTrauma: "Beziehungstrauma",
  acuteTrauma: "Akutes Trauma / Schockerlebnis",
  complexPtsd: "Komplexe PTBS",

  // Burnout subtopics
  workOverload: "Arbeitsüberlastung",
  exhaustionDepression: "Erschöpfungsdepression",
  workLifeBalance: "Work-Life-Balance",
  chronicFatigue: "Chronische Erschöpfung",

  // OCD subtopics
  obsessiveThoughts: "Zwangsgedanken",
  compulsiveBehaviors: "Zwangshandlungen",
  hoarding: "Messie / Horten",
  trichotillomania: "Trichotillomanie / Dermatillomanie",

  // Addiction subtopics
  alcoholAddiction: "Alkoholabhängigkeit",
  drugAddiction: "Drogenabhängigkeit",
  gamblingAddiction: "Spielsucht",
  internetMediaAddiction: "Internet- / Mediensucht",

  // Eating disorder subtopics
  anorexia: "Magersucht (Anorexie)",
  bulimia: "Bulimie",
  bingeEating: "Binge Eating / Essanfälle",
  orthorexia: "Orthorexie / zwanghaft gesundes Essen",

  // Sleep subtopics
  insomnia: "Einschlafprobleme",
  sleepMaintenance: "Durchschlafprobleme",
  nightmares: "Albträume",
  sleepApnea: "Schlafapnoe / Atemaussetzer",

  // Stress subtopics
  chronicStress: "Chronischer Stress",
  examAnxiety: "Prüfungsangst",
  performancePressure: "Leistungsdruck",
  dailyOverwhelm: "Alltägliche Überforderung",

  // ADHD subtopics
  attentionProblems: "Aufmerksamkeitsprobleme",
  hyperactivity: "Hyperaktivität",
  impulsivity: "Impulsivität",
  organizationStructure: "Organisation / Struktur",

  // Autism subtopics
  socialInteraction: "Soziale Interaktion",
  sensoryProcessing: "Sensorische Verarbeitung",
  routinesFlexibility: "Routinen / Flexibilität",
  communicationAutism: "Kommunikation (Autismus)",

  // Psychosomatic subtopics
  chronicPain: "Chronische Schmerzen",
  somatoformDisorders: "Somatoforme Störungen",
  bodyRelatedFears: "Körperbezogene Ängste",
  stressRelatedSymptoms: "Stressbedingte Symptome",

  // Self-esteem subtopics
  selfWorthProblems: "Selbstwertprobleme",
  identityFinding: "Identitätsfindung",
  perfectionism: "Perfektionismus",
  shameGuilt: "Scham / Schuld",

  // ============================================================================
  // LIFE TOPICS - SUBTOPICS
  // ============================================================================

  // Relationships subtopics
  communicationProblems: "Kommunikationsprobleme",
  trustIssues: "Vertrauensprobleme",
  separationDivorce: "Trennung / Scheidung",
  relationshipFears: "Beziehungsängste",

  // Family subtopics
  parentChildConflicts: "Eltern-Kind-Konflikte",
  siblingRivalry: "Geschwisterrivalität",
  patchworkFamily: "Patchwork-Familie",
  parentingQuestions: "Erziehungsfragen",

  // LGBTQ+ subtopics
  comingOut: "Coming-Out",
  genderIdentity: "Geschlechtsidentität",
  discriminationExperiences: "Diskriminierungserfahrungen",
  lgbtqRelationships: "LGBTQ+ Beziehungen",

  // Migration subtopics
  culturalAdaptation: "Kulturelle Anpassung",
  homesicknessUprooting: "Heimweh / Entwurzelung",
  languageBarriers: "Sprachbarrieren",
  interculturalConflicts: "Interkulturelle Konflikte",

  // Career subtopics
  careerReorientation: "Berufliche Neuorientierung",
  workplaceConflicts: "Konflikte am Arbeitsplatz",
  terminationUnemployment: "Kündigung / Arbeitslosigkeit",
  careerPlanning: "Karriereplanung",

  // Children & Youth subtopics
  schoolProblems: "Schulprobleme",
  bullying: "Mobbing",
  developmentalCrises: "Entwicklungskrisen",
  familyProblemsYouth: "Familienprobleme (Jugend)",

  // Elderly subtopics
  ageRelatedDepression: "Altersdepression",
  lonelinessInAge: "Einsamkeit im Alter",
  lifeReview: "Lebensrückblick",
  lossGriefElderly: "Verlust / Trauer (Ältere)",

  // ============================================================================
  // META CATEGORIES (2)
  // ============================================================================
  assessmentClarification: "Abklärung / Diagnostik-Wunsch",
  unsureOther: "Unsicher / Sonstiges",
};

// Section labels
export const SECTION_LABELS_DE: Record<string, string> = {
  flags: "Akute Flags",
  clinical: "Klinische Themen",
  life: "Lebensbereiche",
  meta: "Sonstiges",
};

// Combined labels for search (backwards compatibility)
export const ALL_LABELS_DE: Record<string, string> = {
  ...TOPIC_LABELS_DE,
};

// Alias for backwards compatibility
export const TOPIC_LABELS = TOPIC_LABELS_DE;

// No more subtopics needed - subtopics are now the main categories for labeling
export const SUBTOPIC_LABELS_DE: Record<string, string> = {};
