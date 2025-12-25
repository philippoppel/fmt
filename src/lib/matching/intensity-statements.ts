/**
 * Empathic Intensity Statements
 *
 * Diese Sätze helfen Menschen, ihre Belastung auszudrücken
 * ohne klinische Begriffe wie "mild/moderate/severe" zu verwenden.
 *
 * Jeder Satz ist darauf ausgelegt:
 * 1. Validierend zu sein - keine Wertung
 * 2. Emotional resonant - Menschen fühlen sich verstanden
 * 3. Handlungsorientiert - zeigt dass Hilfe möglich ist
 */

import type { IntensityLevel } from "@/components/matching/matching-context";

export interface IntensityStatement {
  id: string;
  text: {
    de: string;
    en: string;
  };
  level: IntensityLevel;
}

export interface TopicIntensityConfig {
  topicId: string;
  statements: IntensityStatement[];
  // Empathic intro text shown above the statements
  intro: {
    de: string;
    en: string;
  };
}

/**
 * Topic-specific intensity statements
 *
 * Each topic has 3 intensity levels plus a freetext option.
 * The statements are written to be:
 * - Non-judgmental
 * - Emotionally validating
 * - Focused on daily life impact
 */
export const INTENSITY_CONFIGS: TopicIntensityConfig[] = [
  {
    topicId: "depression",
    intro: {
      de: "Wie fühlt sich das gerade für dich an?",
      en: "How does this feel for you right now?",
    },
    statements: [
      {
        id: "depression_low",
        level: "low",
        text: {
          de: "Ich habe manchmal schwere Tage, aber auch gute Momente dazwischen",
          en: "I have some difficult days, but also good moments in between",
        },
      },
      {
        id: "depression_medium",
        level: "medium",
        text: {
          de: "Die Schwere begleitet mich fast täglich und kostet mich viel Kraft",
          en: "The heaviness follows me almost daily and takes a lot of energy",
        },
      },
      {
        id: "depression_high",
        level: "high",
        text: {
          de: "Ich fühle mich wie in einem tiefen Loch gefangen und sehe gerade keinen Ausweg",
          en: "I feel trapped in a deep hole and can't see a way out right now",
        },
      },
    ],
  },
  {
    topicId: "anxiety",
    intro: {
      de: "Wie sehr bestimmt die Angst deinen Alltag?",
      en: "How much does anxiety control your daily life?",
    },
    statements: [
      {
        id: "anxiety_low",
        level: "low",
        text: {
          de: "Ich habe ab und zu Ängste, kann aber meistens damit umgehen",
          en: "I have occasional fears, but can usually manage them",
        },
      },
      {
        id: "anxiety_medium",
        level: "medium",
        text: {
          de: "Meine Ängste hindern mich oft daran, Dinge zu tun die ich eigentlich möchte",
          en: "My fears often stop me from doing things I actually want to do",
        },
      },
      {
        id: "anxiety_high",
        level: "high",
        text: {
          de: "Die Angst hat die Kontrolle übernommen - ich vermeide immer mehr und ziehe mich zurück",
          en: "Anxiety has taken control - I avoid more and more and withdraw",
        },
      },
    ],
  },
  {
    topicId: "trauma",
    intro: {
      de: "Wie sehr beeinflusst dich das Erlebte noch?",
      en: "How much does the experience still affect you?",
    },
    statements: [
      {
        id: "trauma_low",
        level: "low",
        text: {
          de: "Vergangene Erlebnisse beschäftigen mich manchmal, aber ich kann weiterleben",
          en: "Past experiences occupy my mind sometimes, but I can move on",
        },
      },
      {
        id: "trauma_medium",
        level: "medium",
        text: {
          de: "Erinnerungen kommen regelmäßig hoch und belasten mich - manchmal unerwartet",
          en: "Memories come up regularly and burden me - sometimes unexpectedly",
        },
      },
      {
        id: "trauma_high",
        level: "high",
        text: {
          de: "Die Vergangenheit verfolgt mich täglich und lässt mich nicht zur Ruhe kommen",
          en: "The past haunts me daily and won't let me find peace",
        },
      },
    ],
  },
  {
    topicId: "relationships",
    intro: {
      de: "Wie sehr belastet dich die Beziehungssituation?",
      en: "How much is the relationship situation affecting you?",
    },
    statements: [
      {
        id: "relationships_low",
        level: "low",
        text: {
          de: "Es gibt Schwierigkeiten, aber ich kann damit umgehen und meinen Alltag leben",
          en: "There are difficulties, but I can cope and live my daily life",
        },
      },
      {
        id: "relationships_medium",
        level: "medium",
        text: {
          de: "Es nimmt viel Raum in meinem Leben ein - ich denke ständig daran",
          en: "It takes up a lot of space in my life - I think about it constantly",
        },
      },
      {
        id: "relationships_high",
        level: "high",
        text: {
          de: "Der Schmerz ist überwältigend und ich weiß nicht, wie ich weitermachen soll",
          en: "The pain is overwhelming and I don't know how to move forward",
        },
      },
    ],
  },
  {
    topicId: "burnout",
    intro: {
      de: "Wie erschöpft fühlst du dich?",
      en: "How exhausted do you feel?",
    },
    statements: [
      {
        id: "burnout_low",
        level: "low",
        text: {
          de: "Ich bin öfter erschöpft, aber nach Erholung geht es mir besser",
          en: "I'm often tired, but feel better after rest",
        },
      },
      {
        id: "burnout_medium",
        level: "medium",
        text: {
          de: "Die Erschöpfung ist dauerhaft - auch Erholung hilft kaum noch",
          en: "The exhaustion is constant - even rest hardly helps anymore",
        },
      },
      {
        id: "burnout_high",
        level: "high",
        text: {
          de: "Ich bin am Ende meiner Kräfte und funktioniere nur noch irgendwie",
          en: "I'm at the end of my strength and just barely functioning",
        },
      },
    ],
  },
  {
    topicId: "addiction",
    intro: {
      de: "Wie viel Kontrolle hast du noch?",
      en: "How much control do you still have?",
    },
    statements: [
      {
        id: "addiction_low",
        level: "low",
        text: {
          de: "Ich habe ein Verhalten das ich ändern möchte, aber es ist noch kontrollierbar",
          en: "I have a behavior I want to change, but it's still controllable",
        },
      },
      {
        id: "addiction_medium",
        level: "medium",
        text: {
          de: "Es fällt mir schwer aufzuhören, obwohl ich die negativen Folgen sehe",
          en: "I find it hard to stop, even though I see the negative consequences",
        },
      },
      {
        id: "addiction_high",
        level: "high",
        text: {
          de: "Es hat die Kontrolle übernommen und bestimmt mein Leben",
          en: "It has taken control and dominates my life",
        },
      },
    ],
  },
  {
    topicId: "eatingDisorders",
    intro: {
      de: "Wie sehr bestimmt Essen deinen Alltag?",
      en: "How much does food control your daily life?",
    },
    statements: [
      {
        id: "eatingDisorders_low",
        level: "low",
        text: {
          de: "Ich habe ein unruhiges Verhältnis zum Essen, aber es ist noch im Rahmen",
          en: "I have an uneasy relationship with food, but it's still manageable",
        },
      },
      {
        id: "eatingDisorders_medium",
        level: "medium",
        text: {
          de: "Essen und Körperbild beschäftigen mich täglich und beeinflussen meine Entscheidungen",
          en: "Food and body image occupy me daily and influence my decisions",
        },
      },
      {
        id: "eatingDisorders_high",
        level: "high",
        text: {
          de: "Es dominiert mein ganzes Denken und Handeln - ich bin gefangen",
          en: "It dominates all my thinking and actions - I'm trapped",
        },
      },
    ],
  },
  {
    topicId: "adhd",
    intro: {
      de: "Wie sehr beeinflusst es deinen Alltag?",
      en: "How much does it affect your daily life?",
    },
    statements: [
      {
        id: "adhd_low",
        level: "low",
        text: {
          de: "Konzentration und Struktur fallen mir manchmal schwer, aber ich komme zurecht",
          en: "Concentration and structure are sometimes difficult, but I manage",
        },
      },
      {
        id: "adhd_medium",
        level: "medium",
        text: {
          de: "Chaos und Unorganisiertheit prägen meinen Alltag und frustrieren mich",
          en: "Chaos and disorganization shape my daily life and frustrate me",
        },
      },
      {
        id: "adhd_high",
        level: "high",
        text: {
          de: "Ich schaffe es kaum noch, meinen Alltag zu bewältigen - alles bricht zusammen",
          en: "I can barely manage my daily life anymore - everything is falling apart",
        },
      },
    ],
  },
  {
    topicId: "stress",
    intro: {
      de: "Wie gestresst fühlst du dich?",
      en: "How stressed do you feel?",
    },
    statements: [
      {
        id: "stress_low",
        level: "low",
        text: {
          de: "Ich habe Stress, aber finde noch Zeit zum Durchatmen",
          en: "I have stress, but still find time to breathe",
        },
      },
      {
        id: "stress_medium",
        level: "medium",
        text: {
          de: "Der Druck ist dauerhaft und ich finde kaum noch Ruhe",
          en: "The pressure is constant and I barely find peace anymore",
        },
      },
      {
        id: "stress_high",
        level: "high",
        text: {
          de: "Ich stehe ständig unter Strom und habe das Gefühl zusammenzubrechen",
          en: "I'm constantly on edge and feel like I'm going to break down",
        },
      },
    ],
  },
  {
    topicId: "grief",
    intro: {
      de: "Wie geht es dir mit dem Verlust?",
      en: "How are you coping with the loss?",
    },
    statements: [
      {
        id: "grief_low",
        level: "low",
        text: {
          de: "Die Trauer ist da, aber ich finde auch Momente der Ruhe",
          en: "The grief is there, but I also find moments of peace",
        },
      },
      {
        id: "grief_medium",
        level: "medium",
        text: {
          de: "Der Verlust begleitet mich ständig und überwältigt mich oft",
          en: "The loss accompanies me constantly and often overwhelms me",
        },
      },
      {
        id: "grief_high",
        level: "high",
        text: {
          de: "Der Schmerz ist so groß, dass ich nicht weiß wie ich weiterleben soll",
          en: "The pain is so great that I don't know how to go on",
        },
      },
    ],
  },
  {
    topicId: "selfEsteem",
    intro: {
      de: "Wie geht es dir mit dir selbst?",
      en: "How do you feel about yourself?",
    },
    statements: [
      {
        id: "selfEsteem_low",
        level: "low",
        text: {
          de: "Ich zweifle manchmal an mir, aber habe auch gute Momente",
          en: "I sometimes doubt myself, but also have good moments",
        },
      },
      {
        id: "selfEsteem_medium",
        level: "medium",
        text: {
          de: "Negative Gedanken über mich selbst sind oft präsent und belasten mich",
          en: "Negative thoughts about myself are often present and burden me",
        },
      },
      {
        id: "selfEsteem_high",
        level: "high",
        text: {
          de: "Ich kann mich selbst nicht mehr ertragen und hasse wer ich bin",
          en: "I can no longer stand myself and hate who I am",
        },
      },
    ],
  },
  {
    topicId: "sleep",
    intro: {
      de: "Wie ist dein Schlaf?",
      en: "How is your sleep?",
    },
    statements: [
      {
        id: "sleep_low",
        level: "low",
        text: {
          de: "Ich habe ab und zu Schlafprobleme, aber komme zurecht",
          en: "I have occasional sleep problems, but I manage",
        },
      },
      {
        id: "sleep_medium",
        level: "medium",
        text: {
          de: "Schlechter Schlaf ist für mich normal geworden und zehrt an mir",
          en: "Poor sleep has become normal for me and is wearing me down",
        },
      },
      {
        id: "sleep_high",
        level: "high",
        text: {
          de: "Ich bin völlig übermüdet und kann nicht mehr richtig funktionieren",
          en: "I'm completely exhausted and can no longer function properly",
        },
      },
    ],
  },
];

/**
 * Default/fallback intensity statements for topics not explicitly defined
 */
export const DEFAULT_INTENSITY_STATEMENTS: IntensityStatement[] = [
  {
    id: "default_low",
    level: "low",
    text: {
      de: "Es beschäftigt mich, aber ich komme im Alltag zurecht",
      en: "It's on my mind, but I manage in daily life",
    },
  },
  {
    id: "default_medium",
    level: "medium",
    text: {
      de: "Es beeinflusst meinen Alltag deutlich und nimmt viel Raum ein",
      en: "It significantly affects my daily life and takes up a lot of space",
    },
  },
  {
    id: "default_high",
    level: "high",
    text: {
      de: "Es überwältigt mich und ich weiß nicht mehr weiter",
      en: "It overwhelms me and I don't know what to do anymore",
    },
  },
];

/**
 * Get intensity config for a specific topic
 */
export function getIntensityConfig(topicId: string): TopicIntensityConfig | null {
  return INTENSITY_CONFIGS.find((c) => c.topicId === topicId) || null;
}

/**
 * Get intensity statements for a topic (with fallback to default)
 */
export function getIntensityStatements(topicId: string): IntensityStatement[] {
  const config = getIntensityConfig(topicId);
  return config?.statements || DEFAULT_INTENSITY_STATEMENTS;
}

/**
 * Get the intro text for a topic's intensity section
 */
export function getIntensityIntro(topicId: string, lang: "de" | "en"): string {
  const config = getIntensityConfig(topicId);
  if (config) {
    return config.intro[lang];
  }
  return lang === "de"
    ? "Wie sehr belastet dich das gerade?"
    : "How much is this affecting you right now?";
}

/**
 * Convert intensity level to numeric score for matching
 */
export function intensityToScore(level: IntensityLevel): number {
  switch (level) {
    case "low":
      return 30;
    case "medium":
      return 60;
    case "high":
      return 90;
    default:
      return 50;
  }
}
