/**
 * Shared constants for labelling - 40 category system
 */

// German labels for all topics (40 categories)
export const TOPIC_LABELS_DE: Record<string, string> = {
  // A) Acute Flags (6)
  suicideSelfHarm: "Suizidgedanken / Selbstverletzung",
  psychosisMania: "Psychose / (Hypo-)Manie",
  violenceAbuse: "Gewalt / Missbrauch / Unsicherheit",
  severeSubstanceWithdrawal: "Akuter Entzug / schwere Intoxikation",
  medicallySevereEating: "Medizinisch kritische Essstörung",
  childProtection: "Kindeswohlgefährdung / Familienkrise",

  // B) Clinical Problem Fields (23)
  depressionMood: "Depression / depressive Verstimmung",
  bipolarMood: "Bipolar / Stimmungsschwankungen",
  anxietyGAD: "Angst / Sorgen (generalisiert)",
  panicAgoraphobia: "Panik / Agoraphobie",
  socialAnxiety: "Soziale Angst",
  specificPhobias: "Spezifische Phobien",
  healthAnxiety: "Krankheitsangst / Somatisierung",
  ocdRelated: "Zwang (OCD) & verwandte Störungen",
  traumaPTSD: "Trauma / PTBS / Traumafolgen",
  dissociation: "Dissoziation / Depersonalisation",
  addictionSubstances: "Substanzkonsum (Alkohol, Drogen)",
  addictionBehavioral: "Verhaltenssüchte (Gaming, Glücksspiel)",
  eatingDisorders: "Essstörungen / Körperbild",
  sleepDisorders: "Schlafprobleme / Insomnie",
  stressBurnout: "Stress / Burnout / Erschöpfung",
  angerImpulse: "Ärger / Impulskontrolle",
  selfEsteemIdentity: "Selbstwert / Scham / Identität",
  emotionRegulationPersonality: "Emotionsregulation / Instabilität",
  adhdExecutive: "ADHS / Exekutivfunktionen",
  autismNeurodiversity: "Autismus / Neurodiversität",
  griefLoss: "Trauer / Verlust / Abschied",
  chronicIllnessPain: "Chronische Krankheit / Schmerzen",
  sexualityIntimacy: "Sexualität / Intimität",

  // C) Life Areas & Situations (9)
  relationshipsCouple: "Partnerschaft / Paarprobleme",
  familyOfOrigin: "Herkunftsfamilie / Generationenkonflikte",
  parentingPerinatal: "Elternschaft / Schwangerschaft / postpartal",
  workCareer: "Arbeit / Karriere / Mobbing",
  schoolUniversity: "Schule / Studium / Leistungsdruck",
  lifeTransitions: "Lebensübergänge (Umzug, Trennung, etc.)",
  socialLoneliness: "Einsamkeit / soziale Isolation",
  decisionMakingValues: "Entscheidungen / Werte / Lebensrichtung",
  financialHousingStress: "Existenzstress (Finanzen, Wohnen)",

  // D) Meta Categories (2)
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

// No more subtopics - categories are now granular enough
export const SUBTOPIC_LABELS_DE: Record<string, string> = {};
