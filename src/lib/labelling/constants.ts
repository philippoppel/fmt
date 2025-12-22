/**
 * Shared constants for labelling - uses subtopics as granular categories
 */

// German labels for all labeling categories
// This includes: acute flags, all subtopics, and meta categories
export const TOPIC_LABELS_DE: Record<string, string> = {
  // A) Acute Flags (6)
  suicideSelfHarm: "Suizidgedanken / Selbstverletzung",
  psychosisMania: "Psychose / (Hypo-)Manie",
  violenceAbuse: "Gewalt / Missbrauch / Unsicherheit",
  severeSubstanceWithdrawal: "Akuter Entzug / schwere Intoxikation",
  medicallySevereEating: "Medizinisch kritische Essstörung",
  childProtection: "Kindeswohlgefährdung / Familienkrise",

  // B) Depression subtopics
  depressionMood: "Depressive Verstimmung / Niedergeschlagenheit",
  bipolarMood: "Bipolare Stimmungsschwankungen",
  griefLoss: "Trauer & Verlust",
  socialLoneliness: "Einsamkeit / soziale Isolation",

  // C) Anxiety subtopics
  anxietyGAD: "Generalisierte Angst / ständiges Sorgen",
  panicAgoraphobia: "Panikattacken / Platzangst",
  socialAnxiety: "Soziale Angst / Schüchternheit",
  specificPhobias: "Spezifische Phobien",
  healthAnxiety: "Krankheitsangst / Hypochondrie",
  ocdRelated: "Zwangsstörung (OCD) / Zwangsgedanken",

  // D) Trauma subtopics
  traumaPTSD: "PTBS / Traumafolgestörung",
  dissociation: "Dissoziation / Depersonalisation",

  // E) Addiction subtopics
  addictionSubstances: "Alkohol / Drogen / Medikamente",
  addictionBehavioral: "Gaming / Glücksspiel / Internet",

  // F) Eating disorder subtopics
  eatingAnorexia: "Magersucht (Anorexie)",
  eatingBulimia: "Bulimie / Ess-Brech-Sucht",
  eatingBinge: "Binge Eating / Essanfälle",
  eatingBodyImage: "Körperbild / Unzufriedenheit",

  // G) ADHD subtopics
  adhdExecutive: "ADHS / Konzentration / Organisation",
  autismNeurodiversity: "Autismus-Spektrum / Neurodiversität",

  // H) Stress/Burnout subtopics
  burnoutExhaustion: "Erschöpfung / Burnout",
  chronicStress: "Chronischer Stress / Überlastung",
  workOverload: "Arbeitsüberlastung",

  // I) Sleep subtopics
  sleepInsomnia: "Einschlaf- / Durchschlafprobleme",
  sleepNightmares: "Albträume / Schlafstörungen",
  sleepDisrupted: "Unruhiger Schlaf / frühes Erwachen",

  // J) Self-esteem subtopics
  selfEsteemIdentity: "Selbstwert / Scham / Identität",
  emotionRegulationPersonality: "Emotionsregulation / Stimmungsschwankungen",
  angerImpulse: "Wut / Impulskontrolle",

  // K) Chronic illness subtopics
  chronicIllnessPain: "Chronische Schmerzen / Krankheit",
  chronicIllnessCoping: "Umgang mit Diagnose / Krankheitsbewältigung",

  // L) Sexuality subtopics
  sexualityIntimacy: "Sexuelle Probleme / Lustlosigkeit",
  sexualityIdentity: "Sexuelle Identität / Orientierung",

  // M) Relationship subtopics
  relationshipsCouple: "Paarkonflikte / Kommunikation",
  relationshipsTrust: "Vertrauensprobleme / Eifersucht",
  relationshipsSeparation: "Trennung / Scheidung",

  // N) Family subtopics
  familyOfOrigin: "Herkunftsfamilie / alte Muster",
  parentingPerinatal: "Elternschaft / Schwangerschaft / Baby",
  familyConflicts: "Familienkonflikte / Generationen",

  // O) Work subtopics
  workCareer: "Karriere / berufliche Neuorientierung",
  workMobbing: "Mobbing / Konflikte am Arbeitsplatz",
  workLifeBalance: "Work-Life-Balance",

  // P) School subtopics
  schoolUniversity: "Studium / Ausbildung",
  schoolExamAnxiety: "Prüfungsangst",
  schoolPressure: "Leistungsdruck / Überforderung",

  // Q) Life transitions subtopics
  lifeTransitionsChange: "Umzug / Neuanfang / Veränderung",
  lifeTransitionsDecisions: "Entscheidungsfindung / Lebensziele",

  // R) Existential subtopics
  financialHousingStress: "Geldsorgen / Wohnungssuche",
  existentialMeaning: "Sinnfragen / Lebensorientierung",

  // S) Meta categories (2)
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
