import type { Specialty } from "@/types/therapist";

export interface SubTopic {
  id: string;
  labelKey: string;
  weight: number; // 0.5 - 1.0 for score calculation
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
      { id: "divorce", labelKey: "matching.subtopics.divorce", weight: 1.0 },
      { id: "parenting", labelKey: "matching.subtopics.parenting", weight: 0.8 },
      {
        id: "family_conflicts",
        labelKey: "matching.subtopics.familyConflicts",
        weight: 0.9,
      },
      {
        id: "generation_conflicts",
        labelKey: "matching.subtopics.generationConflicts",
        weight: 0.7,
      },
    ],
  },
  {
    id: "anxiety",
    labelKey: "matching.topics.anxiety",
    unsplashId: "photo-1493836512294-502baa1986e2",
    mappedSpecialties: ["anxiety"],
    subTopics: [
      {
        id: "social_anxiety",
        labelKey: "matching.subtopics.socialAnxiety",
        weight: 1.0,
      },
      {
        id: "panic_attacks",
        labelKey: "matching.subtopics.panicAttacks",
        weight: 1.0,
      },
      { id: "phobias", labelKey: "matching.subtopics.phobias", weight: 0.8 },
      {
        id: "generalized_anxiety",
        labelKey: "matching.subtopics.generalizedAnxiety",
        weight: 0.9,
      },
    ],
  },
  {
    id: "depression",
    labelKey: "matching.topics.depression",
    unsplashId: "photo-1541199249251-f713e6145474",
    mappedSpecialties: ["depression"],
    subTopics: [
      {
        id: "chronic_sadness",
        labelKey: "matching.subtopics.chronicSadness",
        weight: 1.0,
      },
      {
        id: "lack_motivation",
        labelKey: "matching.subtopics.lackMotivation",
        weight: 0.8,
      },
      { id: "grief", labelKey: "matching.subtopics.grief", weight: 0.9 },
      {
        id: "loneliness",
        labelKey: "matching.subtopics.loneliness",
        weight: 0.8,
      },
    ],
  },
  {
    id: "relationships",
    labelKey: "matching.topics.relationships",
    unsplashId: "photo-1516589178581-6cd7833ae3b2",
    mappedSpecialties: ["relationships"],
    subTopics: [
      {
        id: "couple_conflicts",
        labelKey: "matching.subtopics.coupleConflicts",
        weight: 1.0,
      },
      { id: "breakup", labelKey: "matching.subtopics.breakup", weight: 0.9 },
      {
        id: "dating_issues",
        labelKey: "matching.subtopics.datingIssues",
        weight: 0.7,
      },
      { id: "intimacy", labelKey: "matching.subtopics.intimacy", weight: 0.8 },
    ],
  },
  {
    id: "burnout",
    labelKey: "matching.topics.burnout",
    unsplashId: "photo-1544027993-37dbfe43562a",
    mappedSpecialties: ["burnout"],
    subTopics: [
      {
        id: "work_stress",
        labelKey: "matching.subtopics.workStress",
        weight: 1.0,
      },
      {
        id: "exhaustion",
        labelKey: "matching.subtopics.exhaustion",
        weight: 0.9,
      },
      {
        id: "work_life_balance",
        labelKey: "matching.subtopics.workLifeBalance",
        weight: 0.7,
      },
    ],
  },
  {
    id: "trauma",
    labelKey: "matching.topics.trauma",
    unsplashId: "photo-1499209974431-9dddcece7f88",
    mappedSpecialties: ["trauma"],
    subTopics: [
      { id: "ptsd", labelKey: "matching.subtopics.ptsd", weight: 1.0 },
      {
        id: "childhood_trauma",
        labelKey: "matching.subtopics.childhoodTrauma",
        weight: 1.0,
      },
      {
        id: "accident_trauma",
        labelKey: "matching.subtopics.accidentTrauma",
        weight: 0.9,
      },
      { id: "loss", labelKey: "matching.subtopics.loss", weight: 0.8 },
    ],
  },
  {
    id: "addiction",
    labelKey: "matching.topics.addiction",
    unsplashId: "photo-1527137342181-19aab11a8ee8",
    mappedSpecialties: ["addiction"],
    subTopics: [
      { id: "alcohol", labelKey: "matching.subtopics.alcohol", weight: 1.0 },
      { id: "drugs", labelKey: "matching.subtopics.drugs", weight: 1.0 },
      {
        id: "behavioral_addiction",
        labelKey: "matching.subtopics.behavioralAddiction",
        weight: 0.8,
      },
      { id: "gaming", labelKey: "matching.subtopics.gaming", weight: 0.7 },
    ],
  },
  {
    id: "eating_disorders",
    labelKey: "matching.topics.eatingDisorders",
    unsplashId: "photo-1490645935967-10de6ba17061",
    mappedSpecialties: ["eating_disorders"],
    subTopics: [
      { id: "anorexia", labelKey: "matching.subtopics.anorexia", weight: 1.0 },
      { id: "bulimia", labelKey: "matching.subtopics.bulimia", weight: 1.0 },
      {
        id: "binge_eating",
        labelKey: "matching.subtopics.bingeEating",
        weight: 0.9,
      },
    ],
  },
  {
    id: "adhd",
    labelKey: "matching.topics.adhd",
    unsplashId: "photo-1434030216411-0b793f4b4173",
    mappedSpecialties: ["adhd"],
    subTopics: [
      {
        id: "concentration",
        labelKey: "matching.subtopics.concentration",
        weight: 1.0,
      },
      {
        id: "impulsivity",
        labelKey: "matching.subtopics.impulsivity",
        weight: 0.9,
      },
      {
        id: "adult_adhd",
        labelKey: "matching.subtopics.adultAdhd",
        weight: 0.8,
      },
    ],
  },
  {
    id: "self_care",
    labelKey: "matching.topics.selfCare",
    unsplashId: "photo-1506126613408-eca07ce68773",
    mappedSpecialties: ["burnout", "depression"],
    subTopics: [
      {
        id: "self_esteem",
        labelKey: "matching.subtopics.selfEsteem",
        weight: 0.8,
      },
      {
        id: "boundaries",
        labelKey: "matching.subtopics.boundaries",
        weight: 0.7,
      },
      {
        id: "life_changes",
        labelKey: "matching.subtopics.lifeChanges",
        weight: 0.7,
      },
    ],
  },
  {
    id: "stress",
    labelKey: "matching.topics.stress",
    unsplashId: "photo-1621252179027-94459d278660",
    mappedSpecialties: ["burnout"],
    subTopics: [
      {
        id: "chronic_stress",
        labelKey: "matching.subtopics.chronicStress",
        weight: 1.0,
      },
      {
        id: "exam_anxiety",
        labelKey: "matching.subtopics.examAnxiety",
        weight: 0.8,
      },
      {
        id: "performance_pressure",
        labelKey: "matching.subtopics.performancePressure",
        weight: 0.9,
      },
    ],
  },
  {
    id: "sleep",
    labelKey: "matching.topics.sleep",
    unsplashId: "photo-1541781774459-bb2af2f05b55",
    mappedSpecialties: ["depression", "anxiety"],
    subTopics: [
      {
        id: "insomnia",
        labelKey: "matching.subtopics.insomnia",
        weight: 1.0,
      },
      {
        id: "nightmares",
        labelKey: "matching.subtopics.nightmares",
        weight: 0.9,
      },
      {
        id: "sleep_anxiety",
        labelKey: "matching.subtopics.sleepAnxiety",
        weight: 0.8,
      },
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
