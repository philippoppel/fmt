import type { Specialty } from "@/types/therapist";

export type TopicSection = "flags" | "clinical" | "life" | "meta";

// SubTopic interface (kept for backwards compatibility)
export interface SubTopic {
  id: string;
  labelKey: string;
  weight: number;
  unsplashId?: string;
}

export interface Topic {
  id: string;
  labelKey: string;
  unsplashId: string;
  section: TopicSection;
  isFlag?: boolean;
  mappedSpecialties: Specialty[];
  subTopics: SubTopic[];
}

// Section A: Acute Flags (separate handling, not normal matching)
const ACUTE_FLAGS: Topic[] = [
  {
    id: "suicideSelfHarm",
    labelKey: "matching.topics.suicideSelfHarm",
    unsplashId: "photo-1516585427167-9f4af9627e6c",
    section: "flags",
    isFlag: true,
    mappedSpecialties: [],
    subTopics: [],
  },
  {
    id: "psychosisMania",
    labelKey: "matching.topics.psychosisMania",
    unsplashId: "photo-1507003211169-0a1dd7228f2d",
    section: "flags",
    isFlag: true,
    mappedSpecialties: [],
    subTopics: [],
  },
  {
    id: "violenceAbuse",
    labelKey: "matching.topics.violenceAbuse",
    unsplashId: "photo-1518621736915-f3b1c41bfd00",
    section: "flags",
    isFlag: true,
    mappedSpecialties: ["trauma"],
    subTopics: [],
  },
  {
    id: "severeSubstanceWithdrawal",
    labelKey: "matching.topics.severeSubstanceWithdrawal",
    unsplashId: "photo-1527137342181-19aab11a8ee8",
    section: "flags",
    isFlag: true,
    mappedSpecialties: ["addiction"],
    subTopics: [],
  },
  {
    id: "medicallySevereEating",
    labelKey: "matching.topics.medicallySevereEating",
    unsplashId: "photo-1490645935967-10de6ba17061",
    section: "flags",
    isFlag: true,
    mappedSpecialties: ["eating_disorders"],
    subTopics: [],
  },
  {
    id: "childProtection",
    labelKey: "matching.topics.childProtection",
    unsplashId: "photo-1503454537195-1dcabb73ffb9",
    section: "flags",
    isFlag: true,
    mappedSpecialties: [],
    subTopics: [],
  },
];

// Section B: Clinical Problem Fields (therapy reasons, good for matching)
const CLINICAL_TOPICS: Topic[] = [
  {
    id: "depressionMood",
    labelKey: "matching.topics.depressionMood",
    unsplashId: "photo-1541199249251-f713e6145474",
    section: "clinical",
    mappedSpecialties: ["depression"],
    subTopics: [],
  },
  {
    id: "bipolarMood",
    labelKey: "matching.topics.bipolarMood",
    unsplashId: "photo-1507003211169-0a1dd7228f2d",
    section: "clinical",
    mappedSpecialties: ["depression"],
    subTopics: [],
  },
  {
    id: "anxietyGAD",
    labelKey: "matching.topics.anxietyGAD",
    unsplashId: "photo-1493836512294-502baa1986e2",
    section: "clinical",
    mappedSpecialties: ["anxiety"],
    subTopics: [],
  },
  {
    id: "panicAgoraphobia",
    labelKey: "matching.topics.panicAgoraphobia",
    unsplashId: "photo-1474552226712-ac0f0961a954",
    section: "clinical",
    mappedSpecialties: ["anxiety"],
    subTopics: [],
  },
  {
    id: "socialAnxiety",
    labelKey: "matching.topics.socialAnxiety",
    unsplashId: "photo-1529156069898-49953e39b3ac",
    section: "clinical",
    mappedSpecialties: ["anxiety"],
    subTopics: [],
  },
  {
    id: "specificPhobias",
    labelKey: "matching.topics.specificPhobias",
    unsplashId: "photo-1509822929063-6b6cfc9b42f2",
    section: "clinical",
    mappedSpecialties: ["anxiety"],
    subTopics: [],
  },
  {
    id: "healthAnxiety",
    labelKey: "matching.topics.healthAnxiety",
    unsplashId: "photo-1576091160550-2173dba999ef",
    section: "clinical",
    mappedSpecialties: ["anxiety"],
    subTopics: [],
  },
  {
    id: "ocdRelated",
    labelKey: "matching.topics.ocdRelated",
    unsplashId: "photo-1434030216411-0b793f4b4173",
    section: "clinical",
    mappedSpecialties: ["anxiety"],
    subTopics: [],
  },
  {
    id: "traumaPTSD",
    labelKey: "matching.topics.traumaPTSD",
    unsplashId: "photo-1499209974431-9dddcece7f88",
    section: "clinical",
    mappedSpecialties: ["trauma"],
    subTopics: [],
  },
  {
    id: "dissociation",
    labelKey: "matching.topics.dissociation",
    unsplashId: "photo-1518621736915-f3b1c41bfd00",
    section: "clinical",
    mappedSpecialties: ["trauma"],
    subTopics: [],
  },
  {
    id: "addictionSubstances",
    labelKey: "matching.topics.addictionSubstances",
    unsplashId: "photo-1527137342181-19aab11a8ee8",
    section: "clinical",
    mappedSpecialties: ["addiction"],
    subTopics: [],
  },
  {
    id: "addictionBehavioral",
    labelKey: "matching.topics.addictionBehavioral",
    unsplashId: "photo-1511512578047-dfb367046420",
    section: "clinical",
    mappedSpecialties: ["addiction"],
    subTopics: [],
  },
  {
    id: "eatingDisorders",
    labelKey: "matching.topics.eatingDisorders",
    unsplashId: "photo-1490645935967-10de6ba17061",
    section: "clinical",
    mappedSpecialties: ["eating_disorders"],
    subTopics: [],
  },
  {
    id: "sleepDisorders",
    labelKey: "matching.topics.sleepDisorders",
    unsplashId: "photo-1541781774459-bb2af2f05b55",
    section: "clinical",
    mappedSpecialties: ["depression", "anxiety"],
    subTopics: [],
  },
  {
    id: "stressBurnout",
    labelKey: "matching.topics.stressBurnout",
    unsplashId: "photo-1544027993-37dbfe43562a",
    section: "clinical",
    mappedSpecialties: ["burnout"],
    subTopics: [],
  },
  {
    id: "angerImpulse",
    labelKey: "matching.topics.angerImpulse",
    unsplashId: "photo-1533227268428-f9ed0900fb3b",
    section: "clinical",
    mappedSpecialties: [],
    subTopics: [],
  },
  {
    id: "selfEsteemIdentity",
    labelKey: "matching.topics.selfEsteemIdentity",
    unsplashId: "photo-1517836357463-d25dfeac3438",
    section: "clinical",
    mappedSpecialties: ["depression"],
    subTopics: [],
  },
  {
    id: "emotionRegulationPersonality",
    labelKey: "matching.topics.emotionRegulationPersonality",
    unsplashId: "photo-1506126613408-eca07ce68773",
    section: "clinical",
    mappedSpecialties: [],
    subTopics: [],
  },
  {
    id: "adhdExecutive",
    labelKey: "matching.topics.adhdExecutive",
    unsplashId: "photo-1434030216411-0b793f4b4173",
    section: "clinical",
    mappedSpecialties: ["adhd"],
    subTopics: [],
  },
  {
    id: "autismNeurodiversity",
    labelKey: "matching.topics.autismNeurodiversity",
    unsplashId: "photo-1522071820081-009f0129c71c",
    section: "clinical",
    mappedSpecialties: ["adhd"],
    subTopics: [],
  },
  {
    id: "griefLoss",
    labelKey: "matching.topics.griefLoss",
    unsplashId: "photo-1516585427167-9f4af9627e6c",
    section: "clinical",
    mappedSpecialties: ["depression", "trauma"],
    subTopics: [],
  },
  {
    id: "chronicIllnessPain",
    labelKey: "matching.topics.chronicIllnessPain",
    unsplashId: "photo-1576091160550-2173dba999ef",
    section: "clinical",
    mappedSpecialties: [],
    subTopics: [],
  },
  {
    id: "sexualityIntimacy",
    labelKey: "matching.topics.sexualityIntimacy",
    unsplashId: "photo-1518199266791-5375a83190b7",
    section: "clinical",
    mappedSpecialties: ["relationships"],
    subTopics: [],
  },
];

// Section C: Life Areas & Situations (common therapy entry points)
const LIFE_TOPICS: Topic[] = [
  {
    id: "relationshipsCouple",
    labelKey: "matching.topics.relationshipsCouple",
    unsplashId: "photo-1516589178581-6cd7833ae3b2",
    section: "life",
    mappedSpecialties: ["relationships"],
    subTopics: [],
  },
  {
    id: "familyOfOrigin",
    labelKey: "matching.topics.familyOfOrigin",
    unsplashId: "photo-1511895426328-dc8714191300",
    section: "life",
    mappedSpecialties: ["relationships"],
    subTopics: [],
  },
  {
    id: "parentingPerinatal",
    labelKey: "matching.topics.parentingPerinatal",
    unsplashId: "photo-1476703993599-0035a21b17a9",
    section: "life",
    mappedSpecialties: ["relationships"],
    subTopics: [],
  },
  {
    id: "workCareer",
    labelKey: "matching.topics.workCareer",
    unsplashId: "photo-1454165804606-c3d57bc86b40",
    section: "life",
    mappedSpecialties: ["burnout"],
    subTopics: [],
  },
  {
    id: "schoolUniversity",
    labelKey: "matching.topics.schoolUniversity",
    unsplashId: "photo-1434030216411-0b793f4b4173",
    section: "life",
    mappedSpecialties: ["anxiety"],
    subTopics: [],
  },
  {
    id: "lifeTransitions",
    labelKey: "matching.topics.lifeTransitions",
    unsplashId: "photo-1499750310107-5fef28a66643",
    section: "life",
    mappedSpecialties: [],
    subTopics: [],
  },
  {
    id: "socialLoneliness",
    labelKey: "matching.topics.socialLoneliness",
    unsplashId: "photo-1499209974431-9dddcece7f88",
    section: "life",
    mappedSpecialties: ["depression"],
    subTopics: [],
  },
  {
    id: "decisionMakingValues",
    labelKey: "matching.topics.decisionMakingValues",
    unsplashId: "photo-1450101499163-c8848c66ca85",
    section: "life",
    mappedSpecialties: [],
    subTopics: [],
  },
  {
    id: "financialHousingStress",
    labelKey: "matching.topics.financialHousingStress",
    unsplashId: "photo-1621252179027-94459d278660",
    section: "life",
    mappedSpecialties: ["burnout"],
    subTopics: [],
  },
];

// Section D: Meta Categories
const META_TOPICS: Topic[] = [
  {
    id: "assessmentClarification",
    labelKey: "matching.topics.assessmentClarification",
    unsplashId: "photo-1576091160550-2173dba999ef",
    section: "meta",
    mappedSpecialties: [],
    subTopics: [],
  },
  {
    id: "unsureOther",
    labelKey: "matching.topics.unsureOther",
    unsplashId: "photo-1499750310107-5fef28a66643",
    section: "meta",
    mappedSpecialties: [],
    subTopics: [],
  },
];

// Combined export
export const MATCHING_TOPICS: Topic[] = [
  ...ACUTE_FLAGS,
  ...CLINICAL_TOPICS,
  ...LIFE_TOPICS,
  ...META_TOPICS,
];

// Grouped exports for UI sections
export const TOPICS_BY_SECTION = {
  flags: ACUTE_FLAGS,
  clinical: CLINICAL_TOPICS,
  life: LIFE_TOPICS,
  meta: META_TOPICS,
};

// Section labels for UI
export const SECTION_LABELS: Record<TopicSection, string> = {
  flags: "Akute Flags",
  clinical: "Klinische Themen",
  life: "Lebensbereiche",
  meta: "Sonstiges",
};

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

export function getTopicImageUrl(
  unsplashId: string,
  width = 400,
  height = 300
): string {
  return `https://images.unsplash.com/${unsplashId}?w=${width}&h=${height}&fit=crop&crop=faces,center&auto=format&q=80`;
}

export function getTopicsBySection(section: TopicSection): Topic[] {
  return MATCHING_TOPICS.filter((t) => t.section === section);
}

export function isAcuteFlag(topicId: string): boolean {
  const topic = getTopicById(topicId);
  return topic?.isFlag === true;
}

// Backwards compatibility - returns subtopics from all selected topics
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

// Backwards compatibility
export function getSubTopicsForSpecialty(specialty: Specialty): SubTopic[] {
  const subTopics: SubTopic[] = [];
  for (const topic of MATCHING_TOPICS) {
    if (topic.mappedSpecialties.includes(specialty)) {
      subTopics.push(...topic.subTopics);
    }
  }
  return subTopics;
}

// Backwards compatibility
export function getAllSubTopicIds(): Set<string> {
  const ids = new Set<string>();
  for (const topic of MATCHING_TOPICS) {
    topic.subTopics.forEach((st) => ids.add(st.id));
  }
  return ids;
}

// Backwards compatibility
export function getSpecialtyForSubTopic(subTopicId: string): Specialty | undefined {
  for (const topic of MATCHING_TOPICS) {
    const found = topic.subTopics.find((st) => st.id === subTopicId);
    if (found && topic.mappedSpecialties.length > 0) {
      return topic.mappedSpecialties[0];
    }
  }
  return undefined;
}
