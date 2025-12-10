"use server";

import Groq from "groq-sdk";
import type { Specialty, CommunicationStyle, TherapyFocus } from "@/types/therapist";

export type IntensityLevel = "low" | "medium" | "high";

export interface SituationAnalysis {
  suggestedTopics: string[];
  suggestedSubTopics: string[]; // NEW: SubTopics for precise matching
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
// SUBTOPIC KEYWORDS - For precise matching within topics
// ============================================================================

const SUBTOPIC_KEYWORDS: Record<string, TopicKeywords> = {
  // Anxiety subtopics
  social_anxiety: {
    de: ["soziale angst", "sozialangst", "unter menschen", "menschenmenge", "blamieren", "peinlich", "bewertung", "beurteilt", "beobachtet", "kritisiert", "präsentation", "vortrag", "öffentlich sprechen", "party", "smalltalk", "neue leute", "fremde"],
    en: ["social anxiety", "social situations", "crowd", "embarrass", "judged", "evaluated", "watched", "criticized", "presentation", "public speaking", "party", "small talk", "new people", "strangers"],
  },
  panic_attacks: {
    de: ["panikattacke", "panik", "herzrasen", "atemnot", "ersticken", "sterben", "kontrollverlust", "ohnmacht", "schwindel", "zittern", "schweißausbruch", "brustschmerz", "hyperventilieren", "plötzlich angst"],
    en: ["panic attack", "panic", "racing heart", "can't breathe", "suffocating", "dying", "losing control", "faint", "dizzy", "trembling", "sweating", "chest pain", "hyperventilate", "sudden fear"],
  },
  phobias: {
    de: ["phobie", "höhenangst", "flugangst", "spinnen", "schlangen", "enge räume", "klaustrophobie", "agoraphobie", "spritzenangst", "blut", "zahnarzt", "spezifische angst", "vermeiden", "panik bei"],
    en: ["phobia", "fear of heights", "fear of flying", "spiders", "snakes", "tight spaces", "claustrophobia", "agoraphobia", "needles", "blood", "dentist", "specific fear", "avoid", "panic when"],
  },
  generalized_anxiety: {
    de: ["ständig sorgen", "grübeln", "gedankenkreisen", "was wenn", "worst case", "katastrophe", "angst vor allem", "nicht abschalten", "anspannung", "rastlos", "nervös", "unruhe", "besorgt", "zukunftsangst"],
    en: ["constant worry", "ruminating", "overthinking", "what if", "worst case", "catastrophe", "anxious about everything", "can't switch off", "tense", "restless", "nervous", "uneasy", "worried", "future anxiety"],
  },
  // Depression subtopics
  chronic_sadness: {
    de: ["immer traurig", "ständig traurig", "tiefe traurigkeit", "schwermut", "melancholie", "kein licht", "dunkel", "grau", "freudlos", "keine freude mehr", "nichts macht spaß", "leer", "innerlich leer"],
    en: ["always sad", "constantly sad", "deep sadness", "melancholy", "no light", "dark", "gray", "joyless", "no joy", "nothing fun", "empty", "emotionally empty"],
  },
  lack_motivation: {
    de: ["keine motivation", "antriebslos", "kein antrieb", "nicht aufstehen", "im bett bleiben", "nichts schaffen", "alles zu viel", "keine energie", "erschöpft", "müde", "kraftlos", "prokrastinieren", "aufschieben"],
    en: ["no motivation", "no drive", "can't get up", "stay in bed", "can't do anything", "everything too much", "no energy", "exhausted", "tired", "weak", "procrastinate", "putting off"],
  },
  grief: {
    de: ["trauer", "verlust", "gestorben", "tod", "verstorben", "abschied", "vermissen", "sehnsucht", "nie wieder", "fehlt mir", "trauerarbeit", "beerdigung", "loslassen"],
    en: ["grief", "loss", "died", "death", "passed away", "goodbye", "miss", "longing", "never again", "miss them", "mourning", "funeral", "letting go"],
  },
  loneliness: {
    de: ["einsam", "einsamkeit", "allein", "isoliert", "niemand", "keine freunde", "sozial isoliert", "ausgegrenzt", "nicht dazugehören", "verlassen", "keiner versteht mich", "unverbunden"],
    en: ["lonely", "loneliness", "alone", "isolated", "nobody", "no friends", "socially isolated", "excluded", "don't belong", "abandoned", "no one understands", "disconnected"],
  },
  // Relationships subtopics
  couple_conflicts: {
    de: ["streit", "streiten", "konflikt", "partner streiten", "immer streit", "eskaliert", "kommunikation", "nicht verstehen", "anschreien", "vorwürfe", "kritik", "nörgeln", "beschuldigen"],
    en: ["fight", "fighting", "conflict", "arguing", "always fighting", "escalate", "communication", "don't understand", "yelling", "blame", "criticism", "nagging", "accusing"],
  },
  breakup: {
    de: ["trennung", "getrennt", "ex", "beziehung beendet", "schluss gemacht", "verlassen worden", "zurück", "liebeskummer", "herzschmerz", "nicht darüber hinweg"],
    en: ["breakup", "broke up", "ex", "relationship ended", "dumped", "left", "get back", "heartbreak", "heartache", "can't get over"],
  },
  dating_issues: {
    de: ["dating", "kennenlernen", "single", "niemanden finden", "online dating", "tinder", "erste date", "verlieben", "flirten", "bindungsangst", "commitment", "beziehung eingehen"],
    en: ["dating", "meeting people", "single", "can't find anyone", "online dating", "tinder", "first date", "falling in love", "flirting", "commitment issues", "fear of commitment"],
  },
  intimacy: {
    de: ["intimität", "nähe", "sex", "sexualität", "sexuelle probleme", "kein sex", "lust", "libido", "körperlich", "zärtlichkeit", "berührung", "distanz"],
    en: ["intimacy", "closeness", "sex", "sexuality", "sexual problems", "no sex", "desire", "libido", "physical", "affection", "touch", "distance"],
  },
  // Trauma subtopics
  ptsd: {
    de: ["ptbs", "posttraumatisch", "flashback", "flashbacks", "wiedererlebend", "trigger", "ausgelöst", "albtraum", "albträume", "nicht vergessen", "verfolgt mich", "bilder im kopf"],
    en: ["ptsd", "post-traumatic", "flashback", "flashbacks", "reliving", "trigger", "triggered", "nightmare", "nightmares", "can't forget", "haunts me", "images in my head"],
  },
  childhood_trauma: {
    de: ["kindheit", "kindheitstrauma", "als kind", "eltern", "missbrauch", "misshandlung", "vernachlässigt", "geschlagen", "übergriff", "früher", "aufgewachsen", "familiär"],
    en: ["childhood", "childhood trauma", "as a child", "parents", "abuse", "mistreatment", "neglected", "beaten", "assault", "growing up", "family"],
  },
  accident_trauma: {
    de: ["unfall", "autounfall", "verkehrsunfall", "motorrad", "überfahren", "zusammenstoß", "krankenhaus", "verletzt", "operation", "notfall", "rettungswagen"],
    en: ["accident", "car accident", "traffic accident", "motorcycle", "hit by", "collision", "hospital", "injured", "surgery", "emergency", "ambulance"],
  },
  loss: {
    de: ["verlust", "verloren", "gestorben", "tot", "abschied", "beerdigung", "trauer", "weg", "nie wieder", "fehlt", "vermisse"],
    en: ["loss", "lost", "died", "dead", "goodbye", "funeral", "grief", "gone", "never again", "missing", "miss"],
  },
  // Burnout subtopics
  work_stress: {
    de: ["arbeitsstress", "job stress", "überstunden", "deadline", "druck", "chef", "vorgesetzter", "kollegen", "meeting", "projekt", "workload", "zu viel arbeit", "büro"],
    en: ["work stress", "job stress", "overtime", "deadline", "pressure", "boss", "supervisor", "colleagues", "meeting", "project", "workload", "too much work", "office"],
  },
  exhaustion: {
    de: ["erschöpft", "erschöpfung", "ausgebrannt", "keine kraft", "am ende", "völlig fertig", "kaputt", "zusammenbruch", "nicht mehr können", "leer", "energie weg"],
    en: ["exhausted", "exhaustion", "burned out", "no strength", "at the end", "completely done", "broken", "breakdown", "can't anymore", "empty", "no energy left"],
  },
  work_life_balance: {
    de: ["work-life", "balance", "freizeit", "hobby", "familie vernachlässigt", "nur arbeit", "keine zeit", "privatleben", "wochenende arbeiten", "feierabend", "abschalten"],
    en: ["work-life", "balance", "free time", "hobby", "neglecting family", "only work", "no time", "private life", "working weekends", "after work", "switch off"],
  },
  // Addiction subtopics
  alcohol: {
    de: ["alkohol", "trinken", "betrunken", "saufen", "bier", "wein", "schnaps", "wodka", "kater", "entzug", "trocken", "nüchtern", "alkoholiker"],
    en: ["alcohol", "drinking", "drunk", "booze", "beer", "wine", "liquor", "vodka", "hangover", "withdrawal", "sober", "alcoholic"],
  },
  drugs: {
    de: ["drogen", "kiffen", "cannabis", "kokain", "mdma", "ecstasy", "speed", "heroin", "dealer", "high", "rausch", "substanz", "illegale"],
    en: ["drugs", "weed", "cannabis", "cocaine", "mdma", "ecstasy", "speed", "heroin", "dealer", "high", "substance", "illegal"],
  },
  behavioral_addiction: {
    de: ["spielsucht", "glücksspiel", "casino", "wetten", "sportwetten", "automaten", "online glücksspiel", "verlust", "schulden", "kaufsucht", "shoppen", "pornografie"],
    en: ["gambling", "casino", "betting", "sports betting", "slot machines", "online gambling", "loss", "debt", "shopping addiction", "pornography"],
  },
  gaming: {
    de: ["gaming", "zocken", "videospiele", "computerspiele", "online spiele", "süchtig nach spielen", "nächte durchspielen", "realität", "virtuelle welt"],
    en: ["gaming", "video games", "computer games", "online games", "addicted to games", "playing all night", "reality", "virtual world"],
  },
  // Eating disorder subtopics
  anorexia: {
    de: ["magersucht", "anorexie", "nicht essen", "hungern", "fasten", "kalorien zählen", "zu dünn", "untergewicht", "abnehmen", "gewicht verlieren", "kontrollieren"],
    en: ["anorexia", "not eating", "starving", "fasting", "counting calories", "too thin", "underweight", "lose weight", "control"],
  },
  bulimia: {
    de: ["bulimie", "erbrechen", "kotzen", "finger in hals", "purging", "essen und erbrechen", "kompensieren", "abführmittel", "binge purge"],
    en: ["bulimia", "throwing up", "vomiting", "purging", "binge purge", "compensate", "laxatives"],
  },
  binge_eating: {
    de: ["essanfall", "fressanfall", "binge eating", "unkontrolliert essen", "nicht aufhören", "vollstopfen", "schuldgefühle nach essen", "heimlich essen", "emotional essen"],
    en: ["binge eating", "eating uncontrollably", "can't stop eating", "stuffing", "guilt after eating", "eating in secret", "emotional eating"],
  },
  // ADHD subtopics
  concentration: {
    de: ["konzentration", "konzentrationsprobleme", "nicht konzentrieren", "abgelenkt", "ablenkung", "fokus", "aufmerksamkeit", "vergesslich", "durcheinander"],
    en: ["concentration", "concentration problems", "can't concentrate", "distracted", "distraction", "focus", "attention", "forgetful", "scattered"],
  },
  impulsivity: {
    de: ["impulsiv", "impulsivität", "ohne nachdenken", "spontan", "bereuen", "vorschnell", "ungeduldig", "nicht warten können", "unterbrechen"],
    en: ["impulsive", "impulsivity", "without thinking", "spontaneous", "regret", "hasty", "impatient", "can't wait", "interrupting"],
  },
  adult_adhd: {
    de: ["erwachsenen adhs", "adhs erwachsene", "spät diagnostiziert", "nie gewusst", "endlich diagnose", "erklärung", "immer schon so", "chaos im kopf"],
    en: ["adult adhd", "late diagnosed", "never knew", "finally diagnosed", "explanation", "always been like this", "chaos in head"],
  },
  // Self care subtopics
  self_esteem: {
    de: ["selbstwert", "selbstwertgefühl", "selbstbewusstsein", "minderwertig", "nicht gut genug", "wertlos", "versager", "selbstzweifel", "unsicher"],
    en: ["self-esteem", "self-worth", "confidence", "inferior", "not good enough", "worthless", "failure", "self-doubt", "insecure"],
  },
  boundaries: {
    de: ["grenzen", "grenzen setzen", "nein sagen", "people pleaser", "für alle da", "ausgenutzt", "überfordert", "zu viel für andere", "eigene bedürfnisse"],
    en: ["boundaries", "setting boundaries", "saying no", "people pleaser", "there for everyone", "taken advantage", "overwhelmed", "too much for others", "own needs"],
  },
  life_changes: {
    de: ["veränderung", "neuanfang", "lebenskrise", "midlife", "orientierung", "wer bin ich", "sinn", "lebenssinn", "umbruch", "neuorientierung"],
    en: ["change", "new beginning", "life crisis", "midlife", "direction", "who am i", "meaning", "purpose", "transition", "reorientation"],
  },
  // Stress subtopics
  chronic_stress: {
    de: ["dauerstress", "chronischer stress", "ständig stress", "nie entspannt", "immer angespannt", "keine ruhe", "rastlos"],
    en: ["constant stress", "chronic stress", "always stressed", "never relaxed", "always tense", "no peace", "restless"],
  },
  exam_anxiety: {
    de: ["prüfungsangst", "prüfung", "klausur", "examen", "test", "durchfallen", "versagen", "blackout", "vorbereitung"],
    en: ["exam anxiety", "exam", "test", "finals", "fail", "failing", "blackout", "preparation"],
  },
  performance_pressure: {
    de: ["leistungsdruck", "druck", "erwartungen", "perfektion", "perfektionismus", "nicht genug", "muss funktionieren", "fehler", "versagen"],
    en: ["performance pressure", "pressure", "expectations", "perfection", "perfectionism", "not enough", "must perform", "mistakes", "failure"],
  },
  // Sleep subtopics
  insomnia: {
    de: ["schlaflos", "insomnie", "nicht einschlafen", "nicht durchschlafen", "wachliegen", "stundenlang wach", "müde aber wach"],
    en: ["sleepless", "insomnia", "can't fall asleep", "can't stay asleep", "lying awake", "awake for hours", "tired but awake"],
  },
  nightmares: {
    de: ["albtraum", "albträume", "schlecht träumen", "aufwachen", "schweißgebadet", "angst nachts", "träume verfolgen"],
    en: ["nightmare", "nightmares", "bad dreams", "wake up", "sweating", "fear at night", "dreams haunt"],
  },
  sleep_anxiety: {
    de: ["angst vor schlaf", "schlafangst", "angst einzuschlafen", "nicht schlafen wollen", "gedanken nachts", "grübeln nachts", "nicht zur ruhe kommen"],
    en: ["fear of sleep", "sleep anxiety", "afraid to fall asleep", "don't want to sleep", "thoughts at night", "ruminating at night", "can't calm down"],
  },
  // Family/relationships additional
  divorce: {
    de: ["scheidung", "scheiden", "trennung ehe", "anwalt", "sorgerecht", "unterhalt", "vermögen teilen"],
    en: ["divorce", "divorcing", "separation marriage", "lawyer", "custody", "alimony", "dividing assets"],
  },
  parenting: {
    de: ["erziehung", "kind erziehen", "eltern sein", "elternschaft", "teenager", "pubertät", "kind verstehen", "grenzen setzen kind"],
    en: ["parenting", "raising child", "being parent", "parenthood", "teenager", "puberty", "understand child", "setting limits child"],
  },
  family_conflicts: {
    de: ["familienstreit", "familienkonflikt", "familie streitet", "eltern streiten", "geschwister", "erbschaft", "familienfeier", "zusammenkünfte"],
    en: ["family fight", "family conflict", "family arguing", "parents fighting", "siblings", "inheritance", "family gathering", "reunions"],
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

function detectSubTopics(text: string, lang: "de" | "en"): string[] {
  const lowerText = text.toLowerCase();
  const detectedSubTopics: Map<string, number> = new Map();

  for (const [subTopicId, keywords] of Object.entries(SUBTOPIC_KEYWORDS)) {
    const langKeywords = keywords[lang];
    let matchCount = 0;

    for (const keyword of langKeywords) {
      if (keyword.length <= 4) {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        const matches = lowerText.match(regex);
        if (matches) matchCount += matches.length;
      } else {
        const regex = new RegExp(keyword, "gi");
        const matches = lowerText.match(regex);
        if (matches) matchCount += matches.length;
      }
    }

    if (matchCount > 0) {
      detectedSubTopics.set(subTopicId, matchCount);
    }
  }

  // Sort by match count and return top subtopics
  return Array.from(detectedSubTopics.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([subTopic]) => subTopic);
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

const AVAILABLE_SUBTOPICS = [
  // Anxiety
  "social_anxiety", "panic_attacks", "phobias", "generalized_anxiety",
  // Depression
  "chronic_sadness", "lack_motivation", "grief", "loneliness",
  // Relationships/Family
  "couple_conflicts", "breakup", "dating_issues", "intimacy", "divorce", "parenting", "family_conflicts",
  // Trauma
  "ptsd", "childhood_trauma", "accident_trauma", "loss",
  // Burnout
  "work_stress", "exhaustion", "work_life_balance",
  // Addiction
  "alcohol", "drugs", "behavioral_addiction", "gaming",
  // Eating disorders
  "anorexia", "bulimia", "binge_eating",
  // ADHD
  "concentration", "impulsivity", "adult_adhd",
  // Self care
  "self_esteem", "boundaries", "life_changes",
  // Stress
  "chronic_stress", "exam_anxiety", "performance_pressure",
  // Sleep
  "insomnia", "nightmares", "sleep_anxiety",
];

// Map SubTopics to their parent Topics - ensures consistency
const SUBTOPIC_TO_TOPIC: Record<string, string> = {
  // Anxiety
  social_anxiety: "anxiety", panic_attacks: "anxiety", phobias: "anxiety", generalized_anxiety: "anxiety",
  // Depression
  chronic_sadness: "depression", lack_motivation: "depression", grief: "depression", loneliness: "depression",
  // Relationships
  couple_conflicts: "relationships", breakup: "relationships", dating_issues: "relationships",
  intimacy: "relationships", divorce: "relationships", parenting: "family", family_conflicts: "family",
  // Trauma
  ptsd: "trauma", childhood_trauma: "trauma", accident_trauma: "trauma", loss: "trauma",
  // Burnout
  work_stress: "burnout", exhaustion: "burnout", work_life_balance: "burnout",
  // Addiction
  alcohol: "addiction", drugs: "addiction", behavioral_addiction: "addiction", gaming: "addiction",
  // Eating disorders
  anorexia: "eating_disorders", bulimia: "eating_disorders", binge_eating: "eating_disorders",
  // ADHD
  concentration: "adhd", impulsivity: "adhd", adult_adhd: "adhd",
  // Self care
  self_esteem: "self_care", boundaries: "self_care", life_changes: "self_care",
  // Stress
  chronic_stress: "stress", exam_anxiety: "stress", performance_pressure: "stress",
  // Sleep
  insomnia: "sleep", nightmares: "sleep", sleep_anxiety: "sleep",
};

// Ensures that if a SubTopic is detected, its parent Topic is also included
function ensureParentTopics(topics: string[], subTopics: string[]): string[] {
  const topicSet = new Set(topics);
  for (const subTopic of subTopics) {
    const parentTopic = SUBTOPIC_TO_TOPIC[subTopic];
    if (parentTopic && !topicSet.has(parentTopic)) {
      topicSet.add(parentTopic);
    }
  }
  return Array.from(topicSet);
}

const AI_SYSTEM_PROMPT = `Du bist ein einfühlsamer Psychologie-Assistent, der Menschen hilft, ihre Situation zu verstehen.

DATENSCHUTZ: Der Text wurde bereits anonymisiert. Platzhalter wie [NAME], [ORT], [FIRMA] sind normal.

Analysiere den Text und antworte NUR mit einem JSON-Objekt (keine Erklärung, kein Markdown):

{
  "topics": ["topic1", "topic2"],
  "subTopics": ["subtopic1", "subtopic2"],
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

Verfügbare SubTopics (wähle 1-4 passende, nur wenn spezifisch erkennbar):
- Angst: social_anxiety, panic_attacks, phobias, generalized_anxiety
- Depression: chronic_sadness, lack_motivation, grief, loneliness
- Beziehungen: couple_conflicts, breakup, dating_issues, intimacy, divorce, parenting, family_conflicts
- Trauma: ptsd, childhood_trauma, accident_trauma, loss
- Burnout: work_stress, exhaustion, work_life_balance
- Sucht: alcohol, drugs, behavioral_addiction, gaming
- Essstörungen: anorexia, bulimia, binge_eating
- ADHS: concentration, impulsivity, adult_adhd
- Selbstfürsorge: self_esteem, boundaries, life_changes
- Stress: chronic_stress, exam_anxiety, performance_pressure
- Schlaf: insomnia, nightmares, sleep_anxiety

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
      suggestedSubTopics: [],
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
      suggestedSubTopics: [],
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
    let topics = (aiResult.topics || [])
      .filter((t: string) => AVAILABLE_TOPICS.includes(t))
      .slice(0, 4);

    const intensity = ["low", "medium", "high"].includes(aiResult.intensity)
      ? aiResult.intensity as IntensityLevel
      : "medium";

    // Check if AI detected crisis
    if (aiResult.crisis === true) {
      return {
        suggestedTopics: [],
        suggestedSubTopics: [],
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

    // Validate and sanitize AI subTopics response
    const subTopics = (aiResult.subTopics || [])
      .filter((st: string) => AVAILABLE_SUBTOPICS.includes(st))
      .slice(0, 5);

    // Ensure parent topics are included when subTopics are detected
    topics = ensureParentTopics(topics, subTopics);

    // Map topics to specialties
    const mappedSpecialties = topics
      .map((t: string) => SPECIALTY_MAPPING[t])
      .filter((s: Specialty | undefined): s is Specialty => !!s);
    const specialties = Array.from(new Set(mappedSpecialties)) as Specialty[];

    return {
      suggestedTopics: topics,
      suggestedSubTopics: subTopics,
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
    const detectedTopics = detectTopics(text, lang);
    const subTopics = detectSubTopics(text, lang);
    // Ensure parent topics are included when subTopics are detected
    const topics = ensureParentTopics(detectedTopics, subTopics);
    const intensity = detectIntensity(text, lang);
    const specialties = [...new Set(
      topics.map((t) => SPECIALTY_MAPPING[t]).filter((s): s is Specialty => !!s)
    )];
    const summary = generateSummary(topics, intensity, lang);

    return {
      suggestedTopics: topics,
      suggestedSubTopics: subTopics,
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
