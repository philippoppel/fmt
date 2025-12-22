import type { Specialty } from "@/types/therapist";

export type TopicSection = "flags" | "clinical" | "life" | "meta";

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

// ============================================================================
// SECTION A: ACUTE FLAGS (special handling, trigger crisis resources)
// ============================================================================
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

// ============================================================================
// SECTION B: CLINICAL PARENT CATEGORIES WITH SUBCATEGORIES
// ============================================================================
const CLINICAL_TOPICS: Topic[] = [
  // 1. DEPRESSION & STIMMUNG
  {
    id: "depression",
    labelKey: "matching.topics.depression",
    unsplashId: "photo-1541199249251-f713e6145474",
    section: "clinical",
    mappedSpecialties: ["depression"],
    subTopics: [
      {
        id: "depressionMood",
        labelKey: "matching.subtopics.depressionMood",
        weight: 3,
        unsplashId: "photo-1541199249251-f713e6145474",
      },
      {
        id: "bipolarMood",
        labelKey: "matching.subtopics.bipolarMood",
        weight: 3,
        unsplashId: "photo-1507003211169-0a1dd7228f2d",
      },
      {
        id: "griefLoss",
        labelKey: "matching.subtopics.griefLoss",
        weight: 2,
        unsplashId: "photo-1516585427167-9f4af9627e6c",
      },
      {
        id: "socialLoneliness",
        labelKey: "matching.subtopics.socialLoneliness",
        weight: 2,
        unsplashId: "photo-1499209974431-9dddcece7f88",
      },
    ],
  },

  // 2. ANGST
  {
    id: "anxiety",
    labelKey: "matching.topics.anxiety",
    unsplashId: "photo-1493836512294-502baa1986e2",
    section: "clinical",
    mappedSpecialties: ["anxiety"],
    subTopics: [
      {
        id: "anxietyGAD",
        labelKey: "matching.subtopics.anxietyGAD",
        weight: 3,
        unsplashId: "photo-1493836512294-502baa1986e2",
      },
      {
        id: "panicAgoraphobia",
        labelKey: "matching.subtopics.panicAgoraphobia",
        weight: 3,
        unsplashId: "photo-1474552226712-ac0f0961a954",
      },
      {
        id: "socialAnxiety",
        labelKey: "matching.subtopics.socialAnxiety",
        weight: 3,
        unsplashId: "photo-1529156069898-49953e39b3ac",
      },
      {
        id: "specificPhobias",
        labelKey: "matching.subtopics.specificPhobias",
        weight: 2,
        unsplashId: "photo-1509822929063-6b6cfc9b42f2",
      },
      {
        id: "healthAnxiety",
        labelKey: "matching.subtopics.healthAnxiety",
        weight: 2,
        unsplashId: "photo-1576091160550-2173dba999ef",
      },
      {
        id: "ocdRelated",
        labelKey: "matching.subtopics.ocdRelated",
        weight: 3,
        unsplashId: "photo-1434030216411-0b793f4b4173",
      },
    ],
  },

  // 3. TRAUMA
  {
    id: "trauma",
    labelKey: "matching.topics.trauma",
    unsplashId: "photo-1499209974431-9dddcece7f88",
    section: "clinical",
    mappedSpecialties: ["trauma"],
    subTopics: [
      {
        id: "traumaPTSD",
        labelKey: "matching.subtopics.traumaPTSD",
        weight: 3,
        unsplashId: "photo-1499209974431-9dddcece7f88",
      },
      {
        id: "dissociation",
        labelKey: "matching.subtopics.dissociation",
        weight: 3,
        unsplashId: "photo-1518621736915-f3b1c41bfd00",
      },
    ],
  },

  // 4. SUCHT
  {
    id: "addiction",
    labelKey: "matching.topics.addiction",
    unsplashId: "photo-1527137342181-19aab11a8ee8",
    section: "clinical",
    mappedSpecialties: ["addiction"],
    subTopics: [
      {
        id: "addictionSubstances",
        labelKey: "matching.subtopics.addictionSubstances",
        weight: 3,
        unsplashId: "photo-1527137342181-19aab11a8ee8",
      },
      {
        id: "addictionBehavioral",
        labelKey: "matching.subtopics.addictionBehavioral",
        weight: 3,
        unsplashId: "photo-1511512578047-dfb367046420",
      },
    ],
  },

  // 5. ESSSTÖRUNGEN
  {
    id: "eatingDisorders",
    labelKey: "matching.topics.eatingDisorders",
    unsplashId: "photo-1490645935967-10de6ba17061",
    section: "clinical",
    mappedSpecialties: ["eating_disorders"],
    subTopics: [
      {
        id: "eatingAnorexia",
        labelKey: "matching.subtopics.eatingAnorexia",
        weight: 3,
        unsplashId: "photo-1490645935967-10de6ba17061",
      },
      {
        id: "eatingBulimia",
        labelKey: "matching.subtopics.eatingBulimia",
        weight: 3,
        unsplashId: "photo-1490645935967-10de6ba17061",
      },
      {
        id: "eatingBinge",
        labelKey: "matching.subtopics.eatingBinge",
        weight: 3,
        unsplashId: "photo-1490645935967-10de6ba17061",
      },
      {
        id: "eatingBodyImage",
        labelKey: "matching.subtopics.eatingBodyImage",
        weight: 2,
        unsplashId: "photo-1490645935967-10de6ba17061",
      },
    ],
  },

  // 6. ADHS & NEURODIVERSITÄT
  {
    id: "adhd",
    labelKey: "matching.topics.adhd",
    unsplashId: "photo-1434030216411-0b793f4b4173",
    section: "clinical",
    mappedSpecialties: ["adhd"],
    subTopics: [
      {
        id: "adhdExecutive",
        labelKey: "matching.subtopics.adhdExecutive",
        weight: 3,
        unsplashId: "photo-1434030216411-0b793f4b4173",
      },
      {
        id: "autismNeurodiversity",
        labelKey: "matching.subtopics.autismNeurodiversity",
        weight: 3,
        unsplashId: "photo-1522071820081-009f0129c71c",
      },
    ],
  },

  // 7. STRESS & BURNOUT
  {
    id: "stressBurnout",
    labelKey: "matching.topics.stressBurnout",
    unsplashId: "photo-1544027993-37dbfe43562a",
    section: "clinical",
    mappedSpecialties: ["burnout"],
    subTopics: [
      {
        id: "burnoutExhaustion",
        labelKey: "matching.subtopics.burnoutExhaustion",
        weight: 3,
        unsplashId: "photo-1544027993-37dbfe43562a",
      },
      {
        id: "chronicStress",
        labelKey: "matching.subtopics.chronicStress",
        weight: 2,
        unsplashId: "photo-1544027993-37dbfe43562a",
      },
      {
        id: "workOverload",
        labelKey: "matching.subtopics.workOverload",
        weight: 2,
        unsplashId: "photo-1454165804606-c3d57bc86b40",
      },
    ],
  },

  // 8. SCHLAF
  {
    id: "sleep",
    labelKey: "matching.topics.sleep",
    unsplashId: "photo-1541781774459-bb2af2f05b55",
    section: "clinical",
    mappedSpecialties: ["depression", "anxiety"],
    subTopics: [
      {
        id: "sleepInsomnia",
        labelKey: "matching.subtopics.sleepInsomnia",
        weight: 3,
        unsplashId: "photo-1541781774459-bb2af2f05b55",
      },
      {
        id: "sleepNightmares",
        labelKey: "matching.subtopics.sleepNightmares",
        weight: 2,
        unsplashId: "photo-1541781774459-bb2af2f05b55",
      },
      {
        id: "sleepDisrupted",
        labelKey: "matching.subtopics.sleepDisrupted",
        weight: 2,
        unsplashId: "photo-1541781774459-bb2af2f05b55",
      },
    ],
  },

  // 9. SELBSTWERT & IDENTITÄT
  {
    id: "selfEsteem",
    labelKey: "matching.topics.selfEsteem",
    unsplashId: "photo-1517836357463-d25dfeac3438",
    section: "clinical",
    mappedSpecialties: ["depression"],
    subTopics: [
      {
        id: "selfEsteemIdentity",
        labelKey: "matching.subtopics.selfEsteemIdentity",
        weight: 3,
        unsplashId: "photo-1517836357463-d25dfeac3438",
      },
      {
        id: "emotionRegulationPersonality",
        labelKey: "matching.subtopics.emotionRegulationPersonality",
        weight: 3,
        unsplashId: "photo-1506126613408-eca07ce68773",
      },
      {
        id: "angerImpulse",
        labelKey: "matching.subtopics.angerImpulse",
        weight: 2,
        unsplashId: "photo-1533227268428-f9ed0900fb3b",
      },
    ],
  },

  // 10. CHRONISCHE ERKRANKUNG & SCHMERZ
  {
    id: "chronicIllness",
    labelKey: "matching.topics.chronicIllness",
    unsplashId: "photo-1576091160550-2173dba999ef",
    section: "clinical",
    mappedSpecialties: [],
    subTopics: [
      {
        id: "chronicIllnessPain",
        labelKey: "matching.subtopics.chronicIllnessPain",
        weight: 3,
        unsplashId: "photo-1576091160550-2173dba999ef",
      },
      {
        id: "chronicIllnessCoping",
        labelKey: "matching.subtopics.chronicIllnessCoping",
        weight: 2,
        unsplashId: "photo-1576091160550-2173dba999ef",
      },
    ],
  },

  // 11. SEXUALITÄT & INTIMITÄT
  {
    id: "sexuality",
    labelKey: "matching.topics.sexuality",
    unsplashId: "photo-1518199266791-5375a83190b7",
    section: "clinical",
    mappedSpecialties: ["relationships"],
    subTopics: [
      {
        id: "sexualityIntimacy",
        labelKey: "matching.subtopics.sexualityIntimacy",
        weight: 3,
        unsplashId: "photo-1518199266791-5375a83190b7",
      },
      {
        id: "sexualityIdentity",
        labelKey: "matching.subtopics.sexualityIdentity",
        weight: 2,
        unsplashId: "photo-1518199266791-5375a83190b7",
      },
    ],
  },
];

// ============================================================================
// SECTION C: LIFE AREAS & SITUATIONS
// ============================================================================
const LIFE_TOPICS: Topic[] = [
  // 1. BEZIEHUNGEN & PARTNERSCHAFT
  {
    id: "relationships",
    labelKey: "matching.topics.relationships",
    unsplashId: "photo-1516589178581-6cd7833ae3b2",
    section: "life",
    mappedSpecialties: ["relationships"],
    subTopics: [
      {
        id: "relationshipsCouple",
        labelKey: "matching.subtopics.relationshipsCouple",
        weight: 3,
        unsplashId: "photo-1516589178581-6cd7833ae3b2",
      },
      {
        id: "relationshipsTrust",
        labelKey: "matching.subtopics.relationshipsTrust",
        weight: 2,
        unsplashId: "photo-1516589178581-6cd7833ae3b2",
      },
      {
        id: "relationshipsSeparation",
        labelKey: "matching.subtopics.relationshipsSeparation",
        weight: 2,
        unsplashId: "photo-1516589178581-6cd7833ae3b2",
      },
    ],
  },

  // 2. FAMILIE
  {
    id: "family",
    labelKey: "matching.topics.family",
    unsplashId: "photo-1511895426328-dc8714191300",
    section: "life",
    mappedSpecialties: ["relationships"],
    subTopics: [
      {
        id: "familyOfOrigin",
        labelKey: "matching.subtopics.familyOfOrigin",
        weight: 3,
        unsplashId: "photo-1511895426328-dc8714191300",
      },
      {
        id: "parentingPerinatal",
        labelKey: "matching.subtopics.parentingPerinatal",
        weight: 3,
        unsplashId: "photo-1476703993599-0035a21b17a9",
      },
      {
        id: "familyConflicts",
        labelKey: "matching.subtopics.familyConflicts",
        weight: 2,
        unsplashId: "photo-1511895426328-dc8714191300",
      },
    ],
  },

  // 3. ARBEIT & KARRIERE
  {
    id: "work",
    labelKey: "matching.topics.work",
    unsplashId: "photo-1454165804606-c3d57bc86b40",
    section: "life",
    mappedSpecialties: ["burnout"],
    subTopics: [
      {
        id: "workCareer",
        labelKey: "matching.subtopics.workCareer",
        weight: 3,
        unsplashId: "photo-1454165804606-c3d57bc86b40",
      },
      {
        id: "workMobbing",
        labelKey: "matching.subtopics.workMobbing",
        weight: 3,
        unsplashId: "photo-1454165804606-c3d57bc86b40",
      },
      {
        id: "workLifeBalance",
        labelKey: "matching.subtopics.workLifeBalance",
        weight: 2,
        unsplashId: "photo-1454165804606-c3d57bc86b40",
      },
    ],
  },

  // 4. SCHULE & STUDIUM
  {
    id: "school",
    labelKey: "matching.topics.school",
    unsplashId: "photo-1434030216411-0b793f4b4173",
    section: "life",
    mappedSpecialties: ["anxiety"],
    subTopics: [
      {
        id: "schoolUniversity",
        labelKey: "matching.subtopics.schoolUniversity",
        weight: 3,
        unsplashId: "photo-1434030216411-0b793f4b4173",
      },
      {
        id: "schoolExamAnxiety",
        labelKey: "matching.subtopics.schoolExamAnxiety",
        weight: 3,
        unsplashId: "photo-1434030216411-0b793f4b4173",
      },
      {
        id: "schoolPressure",
        labelKey: "matching.subtopics.schoolPressure",
        weight: 2,
        unsplashId: "photo-1434030216411-0b793f4b4173",
      },
    ],
  },

  // 5. LEBENSÜBERGÄNGE
  {
    id: "lifeTransitions",
    labelKey: "matching.topics.lifeTransitions",
    unsplashId: "photo-1499750310107-5fef28a66643",
    section: "life",
    mappedSpecialties: [],
    subTopics: [
      {
        id: "lifeTransitionsChange",
        labelKey: "matching.subtopics.lifeTransitionsChange",
        weight: 2,
        unsplashId: "photo-1499750310107-5fef28a66643",
      },
      {
        id: "lifeTransitionsDecisions",
        labelKey: "matching.subtopics.lifeTransitionsDecisions",
        weight: 2,
        unsplashId: "photo-1450101499163-c8848c66ca85",
      },
    ],
  },

  // 6. EXISTENZIELLE SORGEN
  {
    id: "existential",
    labelKey: "matching.topics.existential",
    unsplashId: "photo-1621252179027-94459d278660",
    section: "life",
    mappedSpecialties: ["burnout"],
    subTopics: [
      {
        id: "financialHousingStress",
        labelKey: "matching.subtopics.financialHousingStress",
        weight: 3,
        unsplashId: "photo-1621252179027-94459d278660",
      },
      {
        id: "existentialMeaning",
        labelKey: "matching.subtopics.existentialMeaning",
        weight: 2,
        unsplashId: "photo-1621252179027-94459d278660",
      },
    ],
  },
];

// ============================================================================
// SECTION D: META CATEGORIES
// ============================================================================
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

// ============================================================================
// EXPORTS
// ============================================================================

export const MATCHING_TOPICS: Topic[] = [
  ...ACUTE_FLAGS,
  ...CLINICAL_TOPICS,
  ...LIFE_TOPICS,
  ...META_TOPICS,
];

export const TOPICS_BY_SECTION = {
  flags: ACUTE_FLAGS,
  clinical: CLINICAL_TOPICS,
  life: LIFE_TOPICS,
  meta: META_TOPICS,
};

export const SECTION_LABELS: Record<TopicSection, string> = {
  flags: "Akute Flags",
  clinical: "Klinische Themen",
  life: "Lebensbereiche",
  meta: "Sonstiges",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

export function getSubTopicsForSpecialty(specialty: Specialty): SubTopic[] {
  const subTopics: SubTopic[] = [];
  for (const topic of MATCHING_TOPICS) {
    if (topic.mappedSpecialties.includes(specialty)) {
      subTopics.push(...topic.subTopics);
    }
  }
  return subTopics;
}

export function getAllSubTopicIds(): Set<string> {
  const ids = new Set<string>();
  for (const topic of MATCHING_TOPICS) {
    topic.subTopics.forEach((st) => ids.add(st.id));
  }
  return ids;
}

export function getSpecialtyForSubTopic(subTopicId: string): Specialty | undefined {
  for (const topic of MATCHING_TOPICS) {
    const found = topic.subTopics.find((st) => st.id === subTopicId);
    if (found && topic.mappedSpecialties.length > 0) {
      return topic.mappedSpecialties[0];
    }
  }
  return undefined;
}

export function getParentTopicForSubTopic(subTopicId: string): Topic | undefined {
  for (const topic of MATCHING_TOPICS) {
    const found = topic.subTopics.find((st) => st.id === subTopicId);
    if (found) {
      return topic;
    }
  }
  return undefined;
}

// ============================================================================
// LABELING SUPPORT - Flat list of all granular categories for labeling UI
// ============================================================================

export interface LabelingTopic {
  id: string;
  labelKey: string;
  section: TopicSection;
  isFlag?: boolean;
  unsplashId: string;
  parentId?: string; // Reference to parent topic if this is a subtopic
}

/**
 * Get all topics as a flat list for labeling purposes.
 * This includes:
 * - Acute flags (standalone)
 * - Meta categories (standalone)
 * - All subtopics from parent categories (with parentId reference)
 *
 * Parent categories themselves are NOT included - only their subtopics.
 */
export function getAllLabelingTopics(): LabelingTopic[] {
  const result: LabelingTopic[] = [];

  for (const topic of MATCHING_TOPICS) {
    // Flags and meta categories are standalone (no subtopics)
    if (topic.isFlag || topic.section === "meta") {
      result.push({
        id: topic.id,
        labelKey: topic.labelKey,
        section: topic.section,
        isFlag: topic.isFlag,
        unsplashId: topic.unsplashId,
      });
    } else if (topic.subTopics.length > 0) {
      // For parent categories, add all subtopics
      for (const subTopic of topic.subTopics) {
        result.push({
          id: subTopic.id,
          labelKey: subTopic.labelKey,
          section: topic.section,
          unsplashId: subTopic.unsplashId || topic.unsplashId,
          parentId: topic.id,
        });
      }
    } else {
      // Parent category without subtopics - add as-is
      result.push({
        id: topic.id,
        labelKey: topic.labelKey,
        section: topic.section,
        unsplashId: topic.unsplashId,
      });
    }
  }

  return result;
}

/**
 * Get labeling topics organized by section
 */
export function getLabelingTopicsBySection(): Record<TopicSection, LabelingTopic[]> {
  const all = getAllLabelingTopics();
  return {
    flags: all.filter((t) => t.section === "flags"),
    clinical: all.filter((t) => t.section === "clinical"),
    life: all.filter((t) => t.section === "life"),
    meta: all.filter((t) => t.section === "meta"),
  };
}
