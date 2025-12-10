"use server";

import Groq from "groq-sdk";
import type { Specialty, CommunicationStyle, TherapyFocus } from "@/types/therapist";

export type IntensityLevel = "low" | "medium" | "high";

export interface SituationAnalysis {
  suggestedTopics: string[];
  suggestedSpecialties: Specialty[];
  suggestedCommunicationStyle: CommunicationStyle | null;
  suggestedTherapyFocus: TherapyFocus | null;
  suggestedIntensityLevel: IntensityLevel | null;
  understandingSummary: string;
  suggestedMethods: string[];
  keywords: string[];
  // Reasoning for topic selection (shown to user)
  topicReasons: string;
  // Crisis detection - triggers immediate intervention
  crisisDetected: boolean;
  crisisType: "suicidal" | "self_harm" | "acute_danger" | null;
}

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ============================================================================
// COMPREHENSIVE BILINGUAL KEYWORD MAPPINGS (DE + EN)
// ============================================================================

interface TopicKeywords {
  de: string[];
  en: string[];
}

const TOPIC_KEYWORDS: Record<string, TopicKeywords> = {
  depression: {
    de: [
      "traurig", "traurigkeit", "hoffnungslos", "hoffnungslosigkeit", "antriebslos",
      "antrieb", "müde", "erschöpft", "leer", "sinnlos", "depressiv", "depression",
      "niedergeschlagen", "freudlos", "dunkel", "schwer", "motivationslos",
      "interesse verloren", "nichts mehr", "aufstehen schwer", "morgens schwer",
      "weinen", "tränen", "melancholisch", "düster", "schwermut", "lebensfreude",
      "grau", "eintönig", "negativ", "pessimistisch", "wertlos", "nutzlos"
    ],
    en: [
      "sad", "sadness", "hopeless", "hopelessness", "no energy", "tired",
      "exhausted", "empty", "meaningless", "depressed", "depression", "down",
      "joyless", "dark", "heavy", "no motivation", "lost interest", "nothing matters",
      "hard to get up", "crying", "tears", "melancholy", "gloomy", "lifeless",
      "gray", "monotonous", "negative", "pessimistic", "worthless", "useless"
    ],
  },
  anxiety: {
    de: [
      "angst", "ängste", "panik", "panikattacke", "sorgen", "nervös", "unruhig",
      "ängstlich", "phobie", "befürchtung", "besorgt", "anspannung", "verkrampft",
      "herzrasen", "atemnot", "schwindel", "schweißausbrüche", "zittern",
      "gedankenkreisen", "grübeln", "katastrophisieren", "worst case",
      "kontrollverlust", "überfordert", "hilflos", "ausweglos", "beklemmung",
      "engegefühl", "flucht", "vermeiden", "vermeidung", "soziale angst"
    ],
    en: [
      "anxiety", "anxious", "panic", "panic attack", "worry", "worried", "nervous",
      "restless", "phobia", "fear", "fearful", "tense", "tension",
      "racing heart", "breathless", "dizzy", "sweating", "shaking", "trembling",
      "overthinking", "ruminating", "catastrophizing", "worst case",
      "losing control", "overwhelmed", "helpless", "hopeless", "suffocating",
      "tightness", "flee", "avoid", "avoidance", "social anxiety"
    ],
  },
  trauma: {
    de: [
      "trauma", "traumatisch", "ptbs", "flashback", "flashbacks", "missbrauch",
      "misshandlung", "gewalt", "unfall", "verlust", "tod", "trauer", "schock",
      "belastung", "albtraum", "albträume", "erinnerung", "erinnerungen",
      "übergriff", "vergewaltigung", "kindheit", "kindheitserfahrung",
      "vernachlässigung", "betäubt", "abgespalten", "dissoziation", "trigger",
      "ausgelöst", "wiedererlebend", "verarbeiten", "nicht vergessen",
      "verfolgt mich", "loslassen", "abschließen", "krieg", "flucht"
    ],
    en: [
      "trauma", "traumatic", "ptsd", "flashback", "flashbacks", "abuse",
      "violence", "accident", "loss", "death", "grief", "shock",
      "burden", "nightmare", "nightmares", "memory", "memories",
      "assault", "rape", "childhood", "childhood experience",
      "neglect", "numb", "dissociation", "trigger", "triggered",
      "reliving", "process", "can't forget", "haunting", "haunts me",
      "let go", "closure", "war", "refugee"
    ],
  },
  relationships: {
    de: [
      "beziehung", "beziehungsprobleme", "partner", "partnerin", "partnerschaft",
      "ehe", "trennung", "scheidung", "konflikt", "konflikte", "kommunikation",
      "intimität", "vertrauen", "eifersucht", "fremdgehen", "betrug", "untreue",
      "liebe", "nähe", "distanz", "bindung", "bindungsangst", "dating",
      "single", "einsamkeit", "verlassen", "verlustangst", "streit", "streiten",
      "toxisch", "abhängig", "co-abhängig", "narzisst", "manipulation"
    ],
    en: [
      "relationship", "relationship problems", "partner", "partnership",
      "marriage", "separation", "divorce", "conflict", "conflicts", "communication",
      "intimacy", "trust", "jealousy", "cheating", "betrayal", "infidelity",
      "love", "closeness", "distance", "attachment", "fear of commitment", "dating",
      "single", "lonely", "loneliness", "abandoned", "fear of loss", "argue", "arguing",
      "toxic", "dependent", "codependent", "narcissist", "manipulation"
    ],
  },
  family: {
    de: [
      "familie", "familiär", "eltern", "mutter", "vater", "kind", "kinder",
      "erziehung", "geschwister", "generation", "großeltern", "schwiegereltern",
      "familienkonflikt", "familienkrise", "patchwork", "stiefeltern",
      "adoption", "pflegekind", "erbschaft", "pflege", "angehörige",
      "familiengeheimnis", "erwartungen", "druck", "tradition", "rollen"
    ],
    en: [
      "family", "parents", "mother", "father", "child", "children",
      "parenting", "sibling", "siblings", "generation", "grandparents", "in-laws",
      "family conflict", "family crisis", "blended family", "stepparent",
      "adoption", "foster", "inheritance", "caregiver", "caregiving",
      "family secret", "expectations", "pressure", "tradition", "roles"
    ],
  },
  burnout: {
    de: [
      "burnout", "burn-out", "ausgebrannt", "erschöpft", "erschöpfung",
      "überarbeitet", "stress", "überlastung", "work-life", "balance",
      "keine kraft", "am ende", "zusammenbruch", "zusammengebrochen",
      "funktionieren", "perfektionismus", "leistungsdruck", "dauerstress",
      "rastlos", "nicht abschalten", "erholung", "urlaub hilft nicht",
      "leer", "zynisch", "distanziert", "job", "arbeit", "karriere", "chef"
    ],
    en: [
      "burnout", "burned out", "exhausted", "exhaustion",
      "overworked", "stress", "overload", "work-life", "balance",
      "no energy", "at my limit", "breakdown", "broke down",
      "functioning", "perfectionism", "pressure", "constant stress",
      "restless", "can't switch off", "recovery", "vacation doesn't help",
      "empty", "cynical", "detached", "job", "work", "career", "boss"
    ],
  },
  addiction: {
    de: [
      "sucht", "süchtig", "abhängig", "abhängigkeit", "alkohol", "trinken",
      "drogen", "konsum", "entzug", "spielsucht", "glücksspiel", "casino",
      "internet", "gaming", "pornografie", "kaufsucht", "medikamente",
      "rückfall", "clean", "nüchtern", "kontrollverlust", "verlangen",
      "craving", "dealer", "kiffen", "kokain", "tabletten", "betäuben"
    ],
    en: [
      "addiction", "addicted", "dependent", "dependency", "alcohol", "drinking",
      "drugs", "substance", "withdrawal", "gambling", "casino",
      "internet", "gaming", "pornography", "shopping addiction", "medication",
      "relapse", "clean", "sober", "loss of control", "craving",
      "dealer", "weed", "cocaine", "pills", "numbing"
    ],
  },
  eating_disorders: {
    de: [
      "essstörung", "essen", "magersucht", "anorexie", "bulimie", "binge",
      "essanfall", "erbrechen", "gewicht", "körperbild", "dünn", "dick",
      "kalorien", "diät", "fasten", "hungern", "übergewicht", "adipositas",
      "purging", "kompensieren", "sport zwang", "waage", "spiegel",
      "körper", "hassen", "ekel", "kontrolle", "essen kontrollieren"
    ],
    en: [
      "eating disorder", "eating", "anorexia", "bulimia", "binge",
      "binge eating", "purging", "vomiting", "weight", "body image", "thin", "fat",
      "calories", "diet", "fasting", "starving", "overweight", "obesity",
      "compensating", "compulsive exercise", "scale", "mirror",
      "body", "hate", "disgust", "control", "controlling food"
    ],
  },
  adhd: {
    de: [
      "adhd", "adhs", "ads", "konzentration", "konzentrationsprobleme",
      "aufmerksamkeit", "impulsiv", "impulsivität", "unaufmerksam", "fokus",
      "abgelenkt", "vergesslich", "chaotisch", "unorganisiert", "prokrastination",
      "aufschieben", "hyperaktiv", "unruhe", "innere unruhe", "gedankenrasen",
      "multitasking", "anfangen", "beenden", "durchhalten", "struktur"
    ],
    en: [
      "adhd", "add", "concentration", "concentration problems",
      "attention", "impulsive", "impulsivity", "inattentive", "focus",
      "distracted", "forgetful", "chaotic", "disorganized", "procrastination",
      "procrastinating", "hyperactive", "restless", "inner restlessness", "racing thoughts",
      "multitasking", "starting", "finishing", "persistence", "structure"
    ],
  },
  self_care: {
    de: [
      "selbstwert", "selbstwertgefühl", "selbstbewusstsein", "selbstvertrauen",
      "grenzen", "grenzen setzen", "selbstfürsorge", "selbstliebe", "selbstakzeptanz",
      "minderwertig", "nicht gut genug", "perfektionist", "people pleaser",
      "nein sagen", "überfordert", "für andere da", "eigene bedürfnisse",
      "identität", "wer bin ich", "sinn", "lebenssinn", "veränderung",
      "neuorientierung", "lebenskrise", "midlife"
    ],
    en: [
      "self-worth", "self-esteem", "self-confidence", "confidence",
      "boundaries", "setting boundaries", "self-care", "self-love", "self-acceptance",
      "inferior", "not good enough", "perfectionist", "people pleaser",
      "saying no", "overwhelmed", "always there for others", "own needs",
      "identity", "who am i", "meaning", "purpose", "change",
      "new direction", "life crisis", "midlife"
    ],
  },
  stress: {
    de: [
      "stress", "stressig", "druck", "prüfung", "prüfungsangst", "leistung",
      "leistungsdruck", "überforderung", "überlastet", "deadline", "zeitdruck",
      "studium", "schule", "uni", "arbeitsstress", "hektisch", "keine zeit",
      "anspannung", "verspannung", "kopfschmerzen", "nicht entspannen",
      "abschalten", "gedanken kreisen", "sorgen", "zukunftsangst"
    ],
    en: [
      "stress", "stressful", "pressure", "exam", "test anxiety", "performance",
      "performance pressure", "overwhelmed", "overloaded", "deadline", "time pressure",
      "studies", "school", "university", "work stress", "hectic", "no time",
      "tension", "tense", "headaches", "can't relax",
      "switch off", "racing thoughts", "worries", "future anxiety"
    ],
  },
  sleep: {
    de: [
      "schlaf", "schlafstörung", "schlafprobleme", "insomnie", "einschlafen",
      "durchschlafen", "aufwachen", "alptraum", "albtraum", "alpträume",
      "müde", "müdigkeit", "tagesmüdigkeit", "erschöpft", "nicht schlafen",
      "wachliegen", "grübeln nachts", "gedanken nachts", "schlafmittel",
      "unausgeschlafen", "schlafrhythmus", "schlaflos", "rastlos"
    ],
    en: [
      "sleep", "sleep disorder", "sleep problems", "insomnia", "falling asleep",
      "staying asleep", "waking up", "nightmare", "nightmares",
      "tired", "tiredness", "daytime fatigue", "exhausted", "can't sleep",
      "lying awake", "ruminating at night", "thoughts at night", "sleeping pills",
      "not rested", "sleep pattern", "sleepless", "restless"
    ],
  },
};

// ============================================================================
// THERAPY METHOD KEYWORDS
// ============================================================================

interface MethodKeywords {
  de: string[];
  en: string[];
}

const METHOD_KEYWORDS: Record<string, MethodKeywords> = {
  cbt: {
    de: [
      "gedanken", "denkmuster", "gedankenmuster", "überzeugung", "glaubenssätze",
      "verhalten", "verhaltenstherapie", "umstrukturieren", "rational", "logisch",
      "übung", "hausaufgabe", "praktisch", "konkret", "techniken", "strategien"
    ],
    en: [
      "thoughts", "thinking patterns", "thought patterns", "beliefs", "belief",
      "behavior", "behavioral", "restructure", "rational", "logical",
      "exercise", "homework", "practical", "concrete", "techniques", "strategies"
    ],
  },
  psychodynamic: {
    de: [
      "kindheit", "vergangenheit", "früher", "eltern", "prägung", "muster",
      "unbewusst", "unterbewusst", "tiefe", "wurzeln", "ursprung", "verstehen warum",
      "zusammenhänge", "biografie", "lebensgeschichte", "inneres kind"
    ],
    en: [
      "childhood", "past", "before", "parents", "upbringing", "patterns",
      "unconscious", "subconscious", "deep", "roots", "origin", "understand why",
      "connections", "biography", "life story", "inner child"
    ],
  },
  mindfulness: {
    de: [
      "achtsamkeit", "meditation", "entspannung", "atmen", "atmung", "yoga",
      "präsent", "gegenwart", "hier und jetzt", "akzeptanz", "annehmen",
      "beobachten", "körperwahrnehmung", "spüren", "ruhe", "gelassen"
    ],
    en: [
      "mindfulness", "meditation", "relaxation", "breathing", "breath", "yoga",
      "present", "moment", "here and now", "acceptance", "accepting",
      "observing", "body awareness", "feeling", "calm", "peaceful"
    ],
  },
  emdr: {
    de: [
      "emdr", "augenbewegung", "trauma verarbeiten", "flashback", "erinnerung verarbeiten",
      "belastende erinnerung", "desensibilisierung", "reprocessing"
    ],
    en: [
      "emdr", "eye movement", "process trauma", "flashback", "process memory",
      "distressing memory", "desensitization", "reprocessing"
    ],
  },
  systemic: {
    de: [
      "system", "systemisch", "familie", "beziehung", "dynamik", "rolle",
      "kommunikation", "interaktion", "umfeld", "kontext", "ressourcen",
      "lösungsorientiert", "perspektive", "perspektivwechsel"
    ],
    en: [
      "system", "systemic", "family", "relationship", "dynamics", "role",
      "communication", "interaction", "environment", "context", "resources",
      "solution-focused", "perspective", "change perspective"
    ],
  },
};

// ============================================================================
// INTENSITY MARKERS
// ============================================================================

interface IntensityMarkers {
  de: string[];
  en: string[];
}

const INTENSITY_MARKERS: Record<IntensityLevel, IntensityMarkers> = {
  high: {
    de: [
      "dringend", "sofort", "nicht mehr", "kann nicht mehr", "halte nicht mehr aus",
      "verzweifelt", "hoffnungslos", "ausweg", "keinen ausweg", "ertrage nicht",
      "zusammenbruch", "krise", "notfall", "suizid", "selbstverletzung", "ritzen",
      "sterben", "nicht leben", "aufhören", "ende", "schluss", "ständig",
      "jeden tag", "permanent", "extrem", "unerträglich", "hölle", "gefangen",
      "akut", "eskaliert", "verschlimmert", "kritisch", "am limit"
    ],
    en: [
      "urgent", "immediately", "can't anymore", "can't take it", "can't handle",
      "desperate", "hopeless", "no way out", "can't bear", "unbearable",
      "breakdown", "crisis", "emergency", "suicide", "self-harm", "cutting",
      "die", "don't want to live", "stop", "end", "constantly",
      "every day", "permanent", "extreme", "unbearable", "hell", "trapped",
      "acute", "escalated", "worsened", "critical", "at my limit"
    ],
  },
  low: {
    de: [
      "manchmal", "gelegentlich", "ab und zu", "leicht", "ein bisschen",
      "kleinigkeit", "optimieren", "verbessern", "wachsen", "entwickeln",
      "neugierig", "interessiert", "ausprobieren", "präventiv", "vorsorge",
      "bevor", "coaching", "selbstoptimierung", "potenzial", "stärken"
    ],
    en: [
      "sometimes", "occasionally", "once in a while", "slightly", "a little",
      "minor", "optimize", "improve", "grow", "develop",
      "curious", "interested", "try out", "preventive", "prevention",
      "before", "coaching", "self-improvement", "potential", "strengths"
    ],
  },
  medium: {
    de: [], // Default fallback
    en: [],
  },
};

// ============================================================================
// CRISIS DETECTION KEYWORDS - IMMEDIATE INTERVENTION REQUIRED
// These keywords trigger immediate display of crisis resources
// ============================================================================

type CrisisType = "suicidal" | "self_harm" | "acute_danger";

const CRISIS_KEYWORDS: Record<CrisisType, { de: string[]; en: string[] }> = {
  suicidal: {
    de: [
      // Direct expressions
      "suizid", "selbstmord", "umbringen", "mich umbringen", "das leben nehmen",
      "nicht mehr leben", "will nicht mehr leben", "möchte nicht mehr leben",
      "will sterben", "möchte sterben", "sterben wollen",
      "dem leben ein ende", "allem ein ende setzen", "allem ein ende machen",
      "keinen sinn mehr zu leben", "warum noch leben",
      // Passive expressions
      "nicht mehr aufwachen", "einschlafen und nicht mehr aufwachen",
      "wäre besser tot", "besser ohne mich", "welt ohne mich",
      "allen eine last", "niemandem mehr zur last",
      // Planning indicators
      "abschiedsbrief", "testament schreiben", "sachen verschenken",
      "wie man stirbt", "methoden",
      // Indirect but clear
      "alles beenden", "für immer weg", "endgültig schluss"
    ],
    en: [
      // Direct expressions
      "suicide", "suicidal", "kill myself", "end my life", "take my life",
      "don't want to live", "want to die", "wish i was dead",
      "better off dead", "end it all", "no reason to live",
      "why keep living", "no point living",
      // Passive expressions
      "not wake up", "fall asleep and never wake up",
      "world without me", "everyone better off without me",
      "burden to everyone", "burden to my family",
      // Planning indicators
      "suicide note", "goodbye letter", "giving away my things",
      "how to die", "methods to",
      // Indirect but clear
      "end everything", "gone forever", "final goodbye"
    ],
  },
  self_harm: {
    de: [
      "selbstverletzung", "selbst verletzen", "mich verletzen", "mich selbst verletzen",
      "ritzen", "schneiden", "mich schneiden", "mich ritzen",
      "mir weh tun", "mir selbst weh tun", "mir schmerzen zufügen",
      "bluten sehen", "narben", "mich bestrafen",
      "verbrennen", "mich verbrennen", "haare ausreißen"
    ],
    en: [
      "self-harm", "self harm", "hurt myself", "hurting myself",
      "cutting", "cut myself", "cutting myself",
      "cause myself pain", "inflict pain", "make myself bleed",
      "see blood", "scars", "punish myself",
      "burn myself", "burning myself", "pull out hair"
    ],
  },
  acute_danger: {
    de: [
      // Immediate danger
      "will mir was antun", "werde mir was antun", "mir etwas antun",
      "heute nacht", "heute noch", "gleich", "jetzt sofort",
      "halte es nicht mehr aus", "ertrage es nicht mehr",
      "kann nicht mehr weitermachen", "schaffe es nicht mehr",
      "am ende", "völlig am ende", "total am ende",
      // Desperation
      "keinen ausweg", "kein ausweg mehr", "ausweglos",
      "hoffnungslos", "völlig hoffnungslos", "keine hoffnung mehr",
      "niemand kann mir helfen", "nichts hilft mehr"
    ],
    en: [
      // Immediate danger
      "going to hurt myself", "about to hurt myself", "harm myself tonight",
      "tonight", "right now", "immediately",
      "can't take it anymore", "can't bear it anymore",
      "can't go on", "can't do this anymore",
      "at the end", "completely done",
      // Desperation
      "no way out", "no escape", "trapped",
      "hopeless", "completely hopeless", "no hope left",
      "nobody can help", "nothing helps anymore"
    ],
  },
};

// ============================================================================
// COMMUNICATION STYLE MARKERS
// ============================================================================

const COMMUNICATION_STYLE_MARKERS: Record<CommunicationStyle, { de: string[]; en: string[] }> = {
  directive: {
    de: [
      "anleitung", "struktur", "plan", "vorgabe", "konkret", "klar",
      "direkt", "anweisungen", "ratschlag", "tipps", "was tun", "was soll ich",
      "lösung", "praktisch", "handlung", "schritte", "maßnahmen"
    ],
    en: [
      "guidance", "structure", "plan", "clear", "concrete",
      "direct", "instructions", "advice", "tips", "what to do", "what should i",
      "solution", "practical", "action", "steps", "measures"
    ],
  },
  empathetic: {
    de: [
      "verstanden werden", "zuhören", "gefühle", "emotional", "einfühlsam",
      "verständnis", "mitgefühl", "reden", "erzählen", "aussprechen",
      "abladen", "teilen", "gehört werden", "nicht allein", "warmherzig"
    ],
    en: [
      "understood", "listen", "feelings", "emotional", "empathetic",
      "understanding", "compassion", "talk", "share", "express",
      "vent", "heard", "not alone", "warmhearted"
    ],
  },
  balanced: {
    de: [],
    en: [],
  },
};

// ============================================================================
// THERAPY FOCUS MARKERS
// ============================================================================

const THERAPY_FOCUS_MARKERS: Record<TherapyFocus, { de: string[]; en: string[] }> = {
  past: {
    de: [
      "kindheit", "früher", "vergangenheit", "damals", "eltern", "aufgewachsen",
      "prägung", "ursprung", "wurzeln", "erfahrung", "erlebt", "trauma",
      "missbrauch", "vernachlässigt", "biografie", "lebensgeschichte"
    ],
    en: [
      "childhood", "before", "past", "back then", "parents", "grew up",
      "upbringing", "origin", "roots", "experience", "experienced", "trauma",
      "abuse", "neglected", "biography", "life story"
    ],
  },
  present: {
    de: [
      "aktuell", "jetzt", "gerade", "momentan", "situation", "alltag",
      "bewältigen", "umgehen", "heute", "derzeit", "konkret", "praktisch"
    ],
    en: [
      "current", "now", "right now", "at the moment", "situation", "daily life",
      "cope", "deal with", "today", "currently", "concrete", "practical"
    ],
  },
  future: {
    de: [
      "zukunft", "ziel", "ziele", "veränderung", "entwicklung", "wachsen",
      "werden", "planen", "erreichen", "vision", "wünsche", "träume",
      "potenzial", "möglichkeiten", "perspektive", "neustart"
    ],
    en: [
      "future", "goal", "goals", "change", "development", "grow",
      "become", "plan", "achieve", "vision", "wishes", "dreams",
      "potential", "possibilities", "perspective", "fresh start"
    ],
  },
  holistic: {
    de: [
      "ganzheitlich", "körper und geist", "körper", "seele", "verbindung",
      "alles zusammen", "verschiedene bereiche", "komplex"
    ],
    en: [
      "holistic", "body and mind", "body", "soul", "connection",
      "everything together", "different areas", "complex"
    ],
  },
};

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

function detectLanguage(text: string): "de" | "en" {
  const germanIndicators = ["ich", "und", "der", "die", "das", "ist", "bin", "habe", "mich", "mir", "meine", "für", "nicht", "auch", "sehr"];
  const englishIndicators = ["i", "and", "the", "is", "am", "have", "my", "me", "for", "not", "also", "very", "with", "been", "feeling"];

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  let germanScore = 0;
  let englishScore = 0;

  for (const word of words) {
    if (germanIndicators.includes(word)) germanScore++;
    if (englishIndicators.includes(word)) englishScore++;
  }

  // German umlauts are a strong indicator
  if (/[äöüß]/.test(lowerText)) germanScore += 3;

  return germanScore >= englishScore ? "de" : "en";
}

function detectTopics(text: string, lang: "de" | "en"): string[] {
  const lowerText = text.toLowerCase();
  const detectedTopics: Map<string, number> = new Map();

  for (const [topicId, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const langKeywords = keywords[lang];
    let matchCount = 0;

    for (const keyword of langKeywords) {
      // Use word boundary for short keywords to avoid false positives
      if (keyword.length <= 4) {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        const matches = lowerText.match(regex);
        if (matches) matchCount += matches.length;
      } else {
        // For longer keywords, substring matching is fine
        const regex = new RegExp(keyword, "gi");
        const matches = lowerText.match(regex);
        if (matches) matchCount += matches.length;
      }
    }

    if (matchCount > 0) {
      detectedTopics.set(topicId, matchCount);
    }
  }

  // Sort by match count and return top topics
  return Array.from(detectedTopics.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([topic]) => topic);
}

function detectMethods(text: string, lang: "de" | "en"): string[] {
  const lowerText = text.toLowerCase();
  const detectedMethods: string[] = [];

  for (const [method, keywords] of Object.entries(METHOD_KEYWORDS)) {
    const langKeywords = keywords[lang];
    const hasMatch = langKeywords.some((keyword) => lowerText.includes(keyword));
    if (hasMatch) {
      detectedMethods.push(method);
    }
  }

  return detectedMethods.slice(0, 3);
}

function detectIntensity(text: string, lang: "de" | "en"): IntensityLevel {
  const lowerText = text.toLowerCase();

  // Check for high intensity markers first
  const highMarkers = INTENSITY_MARKERS.high[lang];
  for (const marker of highMarkers) {
    if (lowerText.includes(marker)) {
      return "high";
    }
  }

  // Check for low intensity markers
  const lowMarkers = INTENSITY_MARKERS.low[lang];
  let lowCount = 0;
  for (const marker of lowMarkers) {
    if (lowerText.includes(marker)) {
      lowCount++;
    }
  }
  if (lowCount >= 2) {
    return "low";
  }

  return "medium";
}

// ============================================================================
// CRISIS DETECTION - Priority check before all other analysis
// ============================================================================

interface CrisisDetectionResult {
  crisisDetected: boolean;
  crisisType: CrisisType | null;
  matchedKeyword: string | null;
}

function detectCrisis(text: string, lang: "de" | "en"): CrisisDetectionResult {
  const lowerText = text.toLowerCase();

  // Check each crisis type in order of severity
  const crisisTypes: CrisisType[] = ["suicidal", "self_harm", "acute_danger"];

  for (const crisisType of crisisTypes) {
    const keywords = CRISIS_KEYWORDS[crisisType][lang];
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return {
          crisisDetected: true,
          crisisType,
          matchedKeyword: keyword,
        };
      }
    }
  }

  return {
    crisisDetected: false,
    crisisType: null,
    matchedKeyword: null,
  };
}

function detectCommunicationStyle(
  text: string,
  lang: "de" | "en"
): CommunicationStyle | null {
  const lowerText = text.toLowerCase();

  let directiveScore = 0;
  let empatheticScore = 0;

  for (const marker of COMMUNICATION_STYLE_MARKERS.directive[lang]) {
    if (lowerText.includes(marker)) directiveScore++;
  }

  for (const marker of COMMUNICATION_STYLE_MARKERS.empathetic[lang]) {
    if (lowerText.includes(marker)) empatheticScore++;
  }

  if (directiveScore > empatheticScore && directiveScore >= 2) {
    return "directive";
  }
  if (empatheticScore > directiveScore && empatheticScore >= 2) {
    return "empathetic";
  }
  if (directiveScore > 0 && empatheticScore > 0) {
    return "balanced";
  }

  return null;
}

function detectTherapyFocus(text: string, lang: "de" | "en"): TherapyFocus | null {
  const lowerText = text.toLowerCase();

  const scores: Record<TherapyFocus, number> = {
    past: 0,
    present: 0,
    future: 0,
    holistic: 0,
  };

  for (const [focus, markers] of Object.entries(THERAPY_FOCUS_MARKERS)) {
    for (const marker of markers[lang as "de" | "en"]) {
      if (lowerText.includes(marker)) {
        scores[focus as TherapyFocus]++;
      }
    }
  }

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore < 2) return null;

  const winner = Object.entries(scores).find(([, score]) => score === maxScore);
  return winner ? (winner[0] as TherapyFocus) : null;
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

const AI_SYSTEM_PROMPT = `Du bist ein einfühlsamer Psychologie-Assistent, der Menschen hilft, ihre Situation zu verstehen.

DATENSCHUTZ: Der Text wurde bereits anonymisiert. Platzhalter wie [NAME], [ORT], [FIRMA] sind normal.

Analysiere den Text und antworte NUR mit einem JSON-Objekt (keine Erklärung, kein Markdown):

{
  "topics": ["topic1", "topic2"],
  "reasoning": "1-2 Sätze auf Deutsch, warum diese Themen erkannt wurden",
  "intensity": "low" | "medium" | "high",
  "summary": "Kurze, einfühlsame Zusammenfassung auf Deutsch (1-2 Sätze)",
  "crisis": false,
  "crisisType": null
}

WICHTIG - Krisenprüfung (höchste Priorität):
- Setze "crisis": true wenn Suizidgedanken, Selbstverletzung oder akute Gefahr erkennbar sind
- crisisType: "suicidal" | "self_harm" | "acute_danger" | null

Verfügbare Topics (wähle 1-3 passende):
${AVAILABLE_TOPICS.join(", ")}

Intensität:
- "high": Dringend, akute Belastung, kann nicht mehr
- "medium": Belastend aber bewältigbar
- "low": Leichte Beschwerden, präventiv

Beispiel für "reasoning":
- "Du beschreibst Erschöpfung und fehlende Motivation bei der Arbeit – typische Anzeichen für Burnout. Die Schlafprobleme deuten auf zusätzliche Belastung hin."

Antworte IMMER auf Deutsch, auch wenn der Input auf Englisch ist.`;

export async function analyzeSituation(text: string): Promise<SituationAnalysis> {
  if (!text || text.trim().length < 10) {
    return {
      suggestedTopics: [],
      suggestedSpecialties: [],
      suggestedCommunicationStyle: null,
      suggestedTherapyFocus: null,
      suggestedIntensityLevel: null,
      understandingSummary: "",
      suggestedMethods: [],
      keywords: [],
      topicReasons: "",
      crisisDetected: false,
      crisisType: null,
    };
  }

  // Detect language for fallback
  const lang = detectLanguage(text);

  // SAFETY: Always check for crisis with keywords first (fast, reliable)
  const keywordCrisis = detectCrisis(text, lang);
  if (keywordCrisis.crisisDetected) {
    return {
      suggestedTopics: [],
      suggestedSpecialties: [],
      suggestedCommunicationStyle: null,
      suggestedTherapyFocus: null,
      suggestedIntensityLevel: "high",
      understandingSummary: "",
      suggestedMethods: [],
      keywords: [],
      topicReasons: "",
      crisisDetected: true,
      crisisType: keywordCrisis.crisisType,
    };
  }

  try {
    // PRIVACY: Anonymize text before sending to external AI
    const anonymizedText = anonymizeText(text);

    // Use Groq AI for analysis
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: AI_SYSTEM_PROMPT },
        { role: "user", content: anonymizedText }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const aiResult = JSON.parse(responseText);

    // Validate and sanitize AI response
    const topics = (aiResult.topics || [])
      .filter((t: string) => AVAILABLE_TOPICS.includes(t))
      .slice(0, 4);

    const intensity = ["low", "medium", "high"].includes(aiResult.intensity)
      ? aiResult.intensity as IntensityLevel
      : "medium";

    // Check if AI detected crisis
    if (aiResult.crisis === true) {
      return {
        suggestedTopics: [],
        suggestedSpecialties: [],
        suggestedCommunicationStyle: null,
        suggestedTherapyFocus: null,
        suggestedIntensityLevel: "high",
        understandingSummary: "",
        suggestedMethods: [],
        keywords: [],
        topicReasons: "",
        crisisDetected: true,
        crisisType: aiResult.crisisType || "acute_danger",
      };
    }

    // Map topics to specialties
    const mappedSpecialties = topics
      .map((t: string) => SPECIALTY_MAPPING[t])
      .filter((s: Specialty | undefined): s is Specialty => !!s);
    const specialties = Array.from(new Set(mappedSpecialties)) as Specialty[];

    return {
      suggestedTopics: topics,
      suggestedSpecialties: specialties,
      suggestedCommunicationStyle: null,
      suggestedTherapyFocus: null,
      suggestedIntensityLevel: intensity,
      understandingSummary: aiResult.summary || "",
      suggestedMethods: [],
      keywords: [],
      topicReasons: aiResult.reasoning || "",
      crisisDetected: false,
      crisisType: null,
    };

  } catch (error) {
    console.error("Groq AI analysis failed, using fallback:", error);

    // Fallback to keyword-based analysis
    const topics = detectTopics(text, lang);
    const intensity = detectIntensity(text, lang);
    const specialties = [...new Set(
      topics.map((t) => SPECIALTY_MAPPING[t]).filter((s): s is Specialty => !!s)
    )];
    const summary = generateSummary(topics, intensity, lang);

    return {
      suggestedTopics: topics,
      suggestedSpecialties: specialties,
      suggestedCommunicationStyle: null,
      suggestedTherapyFocus: null,
      suggestedIntensityLevel: intensity,
      understandingSummary: summary,
      suggestedMethods: [],
      keywords: [],
      topicReasons: "Basierend auf Schlüsselwörtern in deiner Beschreibung.",
      crisisDetected: false,
      crisisType: null,
    };
  }
}
