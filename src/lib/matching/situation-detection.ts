/**
 * Keyword-based situation detection utilities
 * These are synchronous utility functions used for fallback detection
 * and are also exported for testing purposes.
 */

import type { CommunicationStyle, TherapyFocus } from "@/types/therapist";

export type IntensityLevel = "low" | "medium" | "high";
export type CrisisType = "suicidal" | "self_harm" | "acute_danger";

export interface CrisisDetectionResult {
  crisisDetected: boolean;
  crisisType: CrisisType | null;
  matchedKeyword: string | null;
}

// ============================================================================
// COMPREHENSIVE BILINGUAL KEYWORD MAPPINGS (DE + EN)
// ============================================================================

interface TopicKeywords {
  de: string[];
  en: string[];
}

export const TOPIC_KEYWORDS: Record<string, TopicKeywords> = {
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
// SUBTOPIC KEYWORDS
// ============================================================================

export const SUBTOPIC_KEYWORDS: Record<string, TopicKeywords> = {
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
// CRISIS KEYWORDS
// ============================================================================

export const CRISIS_KEYWORDS: Record<CrisisType, { de: string[]; en: string[] }> = {
  suicidal: {
    de: [
      "suizid", "selbstmord", "umbringen", "mich umbringen", "das leben nehmen",
      "nicht mehr leben", "will nicht mehr leben", "möchte nicht mehr leben",
      "will sterben", "möchte sterben", "sterben wollen",
      "dem leben ein ende", "allem ein ende setzen", "allem ein ende machen",
      "keinen sinn mehr zu leben", "warum noch leben",
      "nicht mehr aufwachen", "einschlafen und nicht mehr aufwachen",
      "wäre besser tot", "besser ohne mich", "welt ohne mich",
      "allen eine last", "niemandem mehr zur last",
      "abschiedsbrief", "testament schreiben", "sachen verschenken",
      "wie man stirbt", "methoden",
      "alles beenden", "für immer weg", "endgültig schluss"
    ],
    en: [
      "suicide", "suicidal", "kill myself", "end my life", "take my life",
      "don't want to live", "want to die", "wish i was dead",
      "better off dead", "end it all", "no reason to live",
      "why keep living", "no point living",
      "not wake up", "fall asleep and never wake up",
      "world without me", "everyone better off without me",
      "burden to everyone", "burden to my family",
      "suicide note", "goodbye letter", "giving away my things",
      "how to die", "methods to",
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
      "will mir was antun", "werde mir was antun", "mir etwas antun",
      "heute nacht", "heute noch", "gleich", "jetzt sofort",
      "halte es nicht mehr aus", "ertrage es nicht mehr",
      "kann nicht mehr weitermachen", "schaffe es nicht mehr",
      "am ende", "völlig am ende", "total am ende",
      "keinen ausweg", "kein ausweg mehr", "ausweglos",
      "hoffnungslos", "völlig hoffnungslos", "keine hoffnung mehr",
      "niemand kann mir helfen", "nichts hilft mehr"
    ],
    en: [
      "going to hurt myself", "about to hurt myself", "harm myself tonight",
      "tonight", "right now", "immediately",
      "can't take it anymore", "can't bear it anymore",
      "can't go on", "can't do this anymore",
      "at the end", "completely done",
      "no way out", "no escape", "trapped",
      "hopeless", "completely hopeless", "no hope left",
      "nobody can help", "nothing helps anymore"
    ],
  },
};

// ============================================================================
// INTENSITY MARKERS
// ============================================================================

export const INTENSITY_MARKERS: Record<IntensityLevel, { de: string[]; en: string[] }> = {
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
    de: [],
    en: [],
  },
};

// ============================================================================
// METHOD KEYWORDS
// ============================================================================

export const METHOD_KEYWORDS: Record<string, { de: string[]; en: string[] }> = {
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
// COMMUNICATION STYLE MARKERS
// ============================================================================

export const COMMUNICATION_STYLE_MARKERS: Record<CommunicationStyle, { de: string[]; en: string[] }> = {
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

export const THERAPY_FOCUS_MARKERS: Record<TherapyFocus, { de: string[]; en: string[] }> = {
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
// DETECTION FUNCTIONS
// ============================================================================

export function detectLanguage(text: string): "de" | "en" {
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

  if (/[äöüß]/.test(lowerText)) germanScore += 3;

  return germanScore >= englishScore ? "de" : "en";
}

export function detectTopics(text: string, lang: "de" | "en"): string[] {
  const lowerText = text.toLowerCase();
  const detectedTopics: Map<string, number> = new Map();

  for (const [topicId, keywords] of Object.entries(TOPIC_KEYWORDS)) {
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
      detectedTopics.set(topicId, matchCount);
    }
  }

  return Array.from(detectedTopics.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([topic]) => topic);
}

export function detectSubTopics(text: string, lang: "de" | "en"): string[] {
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

  return Array.from(detectedSubTopics.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([subTopic]) => subTopic);
}

export function detectCrisis(text: string, lang: "de" | "en"): CrisisDetectionResult {
  const lowerText = text.toLowerCase();

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

export function detectIntensity(text: string, lang: "de" | "en"): IntensityLevel {
  const lowerText = text.toLowerCase();

  const highMarkers = INTENSITY_MARKERS.high[lang];
  for (const marker of highMarkers) {
    if (lowerText.includes(marker)) {
      return "high";
    }
  }

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

export function detectMethods(text: string, lang: "de" | "en"): string[] {
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

export function detectCommunicationStyle(
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

export function detectTherapyFocus(text: string, lang: "de" | "en"): TherapyFocus | null {
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
