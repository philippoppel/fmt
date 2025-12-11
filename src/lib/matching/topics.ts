import type { Specialty } from "@/types/therapist";

export interface SubTopic {
  id: string;
  labelKey: string;
  weight: number; // 0.5 - 1.0 for score calculation
  unsplashId?: string; // Optional image for visual selection
}

export interface Topic {
  id: string;
  labelKey: string;
  unsplashId: string;
  mappedSpecialties: Specialty[];
  subTopics: SubTopic[];
}

export const MATCHING_TOPICS: Topic[] = [
  {
    id: "family",
    labelKey: "matching.topics.family",
    unsplashId: "photo-1511895426328-dc8714191300",
    mappedSpecialties: ["relationships"],
    subTopics: [
      { id: "divorce", labelKey: "matching.subtopics.divorce", weight: 1.0, unsplashId: "photo-1516589091380-5d8e87df6999" },
      { id: "parenting", labelKey: "matching.subtopics.parenting", weight: 0.8, unsplashId: "photo-1476703993599-0035a21b17a9" },
      { id: "family_conflicts", labelKey: "matching.subtopics.familyConflicts", weight: 0.9, unsplashId: "photo-1511895426328-dc8714191300" },
      { id: "generation_conflicts", labelKey: "matching.subtopics.generationConflicts", weight: 0.7, unsplashId: "photo-1529156069898-49953e39b3ac" },
    ],
  },
  {
    id: "anxiety",
    labelKey: "matching.topics.anxiety",
    unsplashId: "photo-1493836512294-502baa1986e2",
    mappedSpecialties: ["anxiety"],
    subTopics: [
      { id: "social_anxiety", labelKey: "matching.subtopics.socialAnxiety", weight: 1.0, unsplashId: "photo-1529156069898-49953e39b3ac" },
      { id: "panic_attacks", labelKey: "matching.subtopics.panicAttacks", weight: 1.0, unsplashId: "photo-1474552226712-ac0f0961a954" },
      { id: "phobias", labelKey: "matching.subtopics.phobias", weight: 0.8, unsplashId: "photo-1509822929063-6b6cfc9b42f2" },
      { id: "generalized_anxiety", labelKey: "matching.subtopics.generalizedAnxiety", weight: 0.9, unsplashId: "photo-1507003211169-0a1dd7228f2d" },
    ],
  },
  {
    id: "depression",
    labelKey: "matching.topics.depression",
    unsplashId: "photo-1541199249251-f713e6145474",
    mappedSpecialties: ["depression"],
    subTopics: [
      { id: "chronic_sadness", labelKey: "matching.subtopics.chronicSadness", weight: 1.0, unsplashId: "photo-1494790108377-be9c29b29330" },
      { id: "lack_motivation", labelKey: "matching.subtopics.lackMotivation", weight: 0.8, unsplashId: "photo-1508963493744-76fce69379c0" },
      { id: "grief", labelKey: "matching.subtopics.grief", weight: 0.9, unsplashId: "photo-1516585427167-9f4af9627e6c" },
      { id: "loneliness", labelKey: "matching.subtopics.loneliness", weight: 0.8, unsplashId: "photo-1499209974431-9dddcece7f88" },
    ],
  },
  {
    id: "relationships",
    labelKey: "matching.topics.relationships",
    unsplashId: "photo-1516589178581-6cd7833ae3b2",
    mappedSpecialties: ["relationships"],
    subTopics: [
      { id: "couple_conflicts", labelKey: "matching.subtopics.coupleConflicts", weight: 1.0, unsplashId: "photo-1573497019940-1c28c88b4f3e" },
      { id: "breakup", labelKey: "matching.subtopics.breakup", weight: 0.9, unsplashId: "photo-1508214751196-bcfd4ca60f91" },
      { id: "dating_issues", labelKey: "matching.subtopics.datingIssues", weight: 0.7, unsplashId: "photo-1517841905240-472988babdf9" },
      { id: "intimacy", labelKey: "matching.subtopics.intimacy", weight: 0.8, unsplashId: "photo-1518199266791-5375a83190b7" },
    ],
  },
  {
    id: "burnout",
    labelKey: "matching.topics.burnout",
    unsplashId: "photo-1544027993-37dbfe43562a",
    mappedSpecialties: ["burnout"],
    subTopics: [
      { id: "work_stress", labelKey: "matching.subtopics.workStress", weight: 1.0, unsplashId: "photo-1454165804606-c3d57bc86b40" },
      { id: "exhaustion", labelKey: "matching.subtopics.exhaustion", weight: 0.9, unsplashId: "photo-1509909756405-be0199881695" },
      { id: "work_life_balance", labelKey: "matching.subtopics.workLifeBalance", weight: 0.7, unsplashId: "photo-1522202176988-66273c2fd55f" },
    ],
  },
  {
    id: "trauma",
    labelKey: "matching.topics.trauma",
    unsplashId: "photo-1499209974431-9dddcece7f88",
    mappedSpecialties: ["trauma"],
    subTopics: [
      { id: "ptsd", labelKey: "matching.subtopics.ptsd", weight: 1.0, unsplashId: "photo-1518621736915-f3b1c41bfd00" },
      { id: "childhood_trauma", labelKey: "matching.subtopics.childhoodTrauma", weight: 1.0, unsplashId: "photo-1503454537195-1dcabb73ffb9" },
      { id: "accident_trauma", labelKey: "matching.subtopics.accidentTrauma", weight: 0.9, unsplashId: "photo-1590650153855-d9e808231d41" },
      { id: "loss", labelKey: "matching.subtopics.loss", weight: 0.8, unsplashId: "photo-1516585427167-9f4af9627e6c" },
    ],
  },
  {
    id: "addiction",
    labelKey: "matching.topics.addiction",
    unsplashId: "photo-1527137342181-19aab11a8ee8",
    mappedSpecialties: ["addiction"],
    subTopics: [
      { id: "alcohol", labelKey: "matching.subtopics.alcohol", weight: 1.0, unsplashId: "photo-1514362545857-3bc16c4c7d1b" },
      { id: "drugs", labelKey: "matching.subtopics.drugs", weight: 1.0, unsplashId: "photo-1584308666744-24d5c474f2ae" },
      { id: "behavioral_addiction", labelKey: "matching.subtopics.behavioralAddiction", weight: 0.8, unsplashId: "photo-1511512578047-dfb367046420" },
      { id: "gaming", labelKey: "matching.subtopics.gaming", weight: 0.7, unsplashId: "photo-1538481199705-c710c4e965fc" },
    ],
  },
  {
    id: "eating_disorders",
    labelKey: "matching.topics.eatingDisorders",
    unsplashId: "photo-1490645935967-10de6ba17061",
    mappedSpecialties: ["eating_disorders"],
    subTopics: [
      { id: "anorexia", labelKey: "matching.subtopics.anorexia", weight: 1.0, unsplashId: "photo-1490818387583-1baba5e638af" },
      { id: "bulimia", labelKey: "matching.subtopics.bulimia", weight: 1.0, unsplashId: "photo-1484723091739-30a097e8f929" },
      { id: "binge_eating", labelKey: "matching.subtopics.bingeEating", weight: 0.9, unsplashId: "photo-1504674900247-0877df9cc836" },
    ],
  },
  {
    id: "adhd",
    labelKey: "matching.topics.adhd",
    unsplashId: "photo-1434030216411-0b793f4b4173",
    mappedSpecialties: ["adhd"],
    subTopics: [
      { id: "concentration", labelKey: "matching.subtopics.concentration", weight: 1.0, unsplashId: "photo-1456406644174-8ddd4cd52a06" },
      { id: "impulsivity", labelKey: "matching.subtopics.impulsivity", weight: 0.9, unsplashId: "photo-1533227268428-f9ed0900fb3b" },
      { id: "adult_adhd", labelKey: "matching.subtopics.adultAdhd", weight: 0.8, unsplashId: "photo-1522071820081-009f0129c71c" },
    ],
  },
  {
    id: "self_care",
    labelKey: "matching.topics.selfCare",
    unsplashId: "photo-1506126613408-eca07ce68773",
    mappedSpecialties: ["burnout", "depression"],
    subTopics: [
      { id: "self_esteem", labelKey: "matching.subtopics.selfEsteem", weight: 0.8, unsplashId: "photo-1517836357463-d25dfeac3438" },
      { id: "boundaries", labelKey: "matching.subtopics.boundaries", weight: 0.7, unsplashId: "photo-1507003211169-0a1dd7228f2d" },
      { id: "life_changes", labelKey: "matching.subtopics.lifeChanges", weight: 0.7, unsplashId: "photo-1499750310107-5fef28a66643" },
    ],
  },
  {
    id: "stress",
    labelKey: "matching.topics.stress",
    unsplashId: "photo-1621252179027-94459d278660",
    mappedSpecialties: ["burnout"],
    subTopics: [
      { id: "chronic_stress", labelKey: "matching.subtopics.chronicStress", weight: 1.0, unsplashId: "photo-1544027993-37dbfe43562a" },
      { id: "exam_anxiety", labelKey: "matching.subtopics.examAnxiety", weight: 0.8, unsplashId: "photo-1434030216411-0b793f4b4173" },
      { id: "performance_pressure", labelKey: "matching.subtopics.performancePressure", weight: 0.9, unsplashId: "photo-1450101499163-c8848c66ca85" },
    ],
  },
  {
    id: "sleep",
    labelKey: "matching.topics.sleep",
    unsplashId: "photo-1541781774459-bb2af2f05b55",
    mappedSpecialties: ["depression", "anxiety"],
    subTopics: [
      { id: "insomnia", labelKey: "matching.subtopics.insomnia", weight: 1.0, unsplashId: "photo-1515894203077-9cd36032142f" },
      { id: "nightmares", labelKey: "matching.subtopics.nightmares", weight: 0.9, unsplashId: "photo-1518837695005-2083093ee35b" },
      { id: "sleep_anxiety", labelKey: "matching.subtopics.sleepAnxiety", weight: 0.8, unsplashId: "photo-1541781774459-bb2af2f05b55" },
    ],
  },
];

export function getTopicById(id: string): Topic | undefined {
  return MATCHING_TOPICS.find((topic) => topic.id === id);
}

export function getSpecialtiesFromTopics(topicIds: string[]): Specialty[] {
  const specialties = new Set<Specialty>();
  for (const topicId of topicIds) {
    const topic = getTopicById(topicId);
    if (topic) {
      topic.mappedSpecialties.forEach((s) => specialties.add(s));
    }
  }
  return Array.from(specialties);
}

export function getSubTopicsForTopics(topicIds: string[]): SubTopic[] {
  const subTopics: SubTopic[] = [];
  for (const topicId of topicIds) {
    const topic = getTopicById(topicId);
    if (topic) {
      subTopics.push(...topic.subTopics);
    }
  }
  return subTopics;
}

export function getTopicImageUrl(
  unsplashId: string,
  width = 400,
  height = 300
): string {
  return `https://images.unsplash.com/${unsplashId}?w=${width}&h=${height}&fit=crop&crop=faces,center&auto=format&q=80`;
}

/**
 * Get all SubTopics that belong to a given Specialty
 */
export function getSubTopicsForSpecialty(specialty: Specialty): SubTopic[] {
  const subTopics: SubTopic[] = [];
  for (const topic of MATCHING_TOPICS) {
    if (topic.mappedSpecialties.includes(specialty)) {
      subTopics.push(...topic.subTopics);
    }
  }
  return subTopics;
}

/**
 * Get all SubTopic IDs as a Set (for validation)
 */
export function getAllSubTopicIds(): Set<string> {
  const ids = new Set<string>();
  for (const topic of MATCHING_TOPICS) {
    topic.subTopics.forEach((st) => ids.add(st.id));
  }
  return ids;
}

/**
 * Get the parent Specialty for a given SubTopic ID
 */
export function getSpecialtyForSubTopic(subTopicId: string): Specialty | undefined {
  for (const topic of MATCHING_TOPICS) {
    const found = topic.subTopics.find((st) => st.id === subTopicId);
    if (found && topic.mappedSpecialties.length > 0) {
      return topic.mappedSpecialties[0];
    }
  }
  return undefined;
}
