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
// SECTION B: CLINICAL TOPICS WITH SUBCATEGORIES
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
        id: "depressiveMood",
        labelKey: "matching.subtopics.depressiveMood",
        weight: 3,
      },
      {
        id: "bipolarMood",
        labelKey: "matching.subtopics.bipolarMood",
        weight: 3,
      },
      {
        id: "griefLoss",
        labelKey: "matching.subtopics.griefLoss",
        weight: 2,
      },
      {
        id: "loneliness",
        labelKey: "matching.subtopics.loneliness",
        weight: 2,
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
        id: "generalizedAnxiety",
        labelKey: "matching.subtopics.generalizedAnxiety",
        weight: 3,
      },
      {
        id: "panicAgoraphobia",
        labelKey: "matching.subtopics.panicAgoraphobia",
        weight: 3,
      },
      {
        id: "socialAnxiety",
        labelKey: "matching.subtopics.socialAnxiety",
        weight: 3,
      },
      {
        id: "specificPhobias",
        labelKey: "matching.subtopics.specificPhobias",
        weight: 2,
      },
    ],
  },

  // 3. TRAUMA & PTBS
  {
    id: "trauma",
    labelKey: "matching.topics.trauma",
    unsplashId: "photo-1499209974431-9dddcece7f88",
    section: "clinical",
    mappedSpecialties: ["trauma"],
    subTopics: [
      {
        id: "childhoodTrauma",
        labelKey: "matching.subtopics.childhoodTrauma",
        weight: 3,
      },
      {
        id: "relationshipTrauma",
        labelKey: "matching.subtopics.relationshipTrauma",
        weight: 3,
      },
      {
        id: "acuteTrauma",
        labelKey: "matching.subtopics.acuteTrauma",
        weight: 3,
      },
      {
        id: "complexPtsd",
        labelKey: "matching.subtopics.complexPtsd",
        weight: 3,
      },
    ],
  },

  // 4. BURNOUT & ERSCHÖPFUNG
  {
    id: "burnout",
    labelKey: "matching.topics.burnout",
    unsplashId: "photo-1544027993-37dbfe43562a",
    section: "clinical",
    mappedSpecialties: ["burnout"],
    subTopics: [
      {
        id: "workOverload",
        labelKey: "matching.subtopics.workOverload",
        weight: 3,
      },
      {
        id: "exhaustionDepression",
        labelKey: "matching.subtopics.exhaustionDepression",
        weight: 3,
      },
      {
        id: "workLifeBalance",
        labelKey: "matching.subtopics.workLifeBalance",
        weight: 2,
      },
      {
        id: "chronicFatigue",
        labelKey: "matching.subtopics.chronicFatigue",
        weight: 2,
      },
    ],
  },

  // 5. ZWÄNGE & IMPULSKONTROLLE
  {
    id: "ocd",
    labelKey: "matching.topics.ocd",
    unsplashId: "photo-1434030216411-0b793f4b4173",
    section: "clinical",
    mappedSpecialties: ["ocd"],
    subTopics: [
      {
        id: "obsessiveThoughts",
        labelKey: "matching.subtopics.obsessiveThoughts",
        weight: 3,
      },
      {
        id: "compulsiveBehaviors",
        labelKey: "matching.subtopics.compulsiveBehaviors",
        weight: 3,
      },
      {
        id: "hoarding",
        labelKey: "matching.subtopics.hoarding",
        weight: 2,
      },
      {
        id: "trichotillomania",
        labelKey: "matching.subtopics.trichotillomania",
        weight: 2,
      },
    ],
  },

  // 6. SUCHT & ABHÄNGIGKEIT
  {
    id: "addiction",
    labelKey: "matching.topics.addiction",
    unsplashId: "photo-1527137342181-19aab11a8ee8",
    section: "clinical",
    mappedSpecialties: ["addiction"],
    subTopics: [
      {
        id: "alcoholAddiction",
        labelKey: "matching.subtopics.alcoholAddiction",
        weight: 3,
      },
      {
        id: "drugAddiction",
        labelKey: "matching.subtopics.drugAddiction",
        weight: 3,
      },
      {
        id: "gamblingAddiction",
        labelKey: "matching.subtopics.gamblingAddiction",
        weight: 3,
      },
      {
        id: "internetMediaAddiction",
        labelKey: "matching.subtopics.internetMediaAddiction",
        weight: 2,
      },
    ],
  },

  // 7. ESSSTÖRUNGEN
  {
    id: "eatingDisorders",
    labelKey: "matching.topics.eatingDisorders",
    unsplashId: "photo-1490645935967-10de6ba17061",
    section: "clinical",
    mappedSpecialties: ["eating_disorders"],
    subTopics: [
      {
        id: "anorexia",
        labelKey: "matching.subtopics.anorexia",
        weight: 3,
      },
      {
        id: "bulimia",
        labelKey: "matching.subtopics.bulimia",
        weight: 3,
      },
      {
        id: "bingeEating",
        labelKey: "matching.subtopics.bingeEating",
        weight: 3,
      },
      {
        id: "orthorexia",
        labelKey: "matching.subtopics.orthorexia",
        weight: 2,
      },
    ],
  },

  // 8. SCHLAFSTÖRUNGEN
  {
    id: "sleep",
    labelKey: "matching.topics.sleep",
    unsplashId: "photo-1541781774459-bb2af2f05b55",
    section: "clinical",
    mappedSpecialties: ["sleep"],
    subTopics: [
      {
        id: "insomnia",
        labelKey: "matching.subtopics.insomnia",
        weight: 3,
      },
      {
        id: "sleepMaintenance",
        labelKey: "matching.subtopics.sleepMaintenance",
        weight: 3,
      },
      {
        id: "nightmares",
        labelKey: "matching.subtopics.nightmares",
        weight: 2,
      },
      {
        id: "sleepApnea",
        labelKey: "matching.subtopics.sleepApnea",
        weight: 2,
      },
    ],
  },

  // 9. STRESS & ÜBERFORDERUNG
  {
    id: "stress",
    labelKey: "matching.topics.stress",
    unsplashId: "photo-1544027993-37dbfe43562a",
    section: "clinical",
    mappedSpecialties: ["stress", "burnout"],
    subTopics: [
      {
        id: "chronicStress",
        labelKey: "matching.subtopics.chronicStress",
        weight: 3,
      },
      {
        id: "examAnxiety",
        labelKey: "matching.subtopics.examAnxiety",
        weight: 3,
      },
      {
        id: "performancePressure",
        labelKey: "matching.subtopics.performancePressure",
        weight: 2,
      },
      {
        id: "dailyOverwhelm",
        labelKey: "matching.subtopics.dailyOverwhelm",
        weight: 2,
      },
    ],
  },

  // 10. ADHS & KONZENTRATION
  {
    id: "adhd",
    labelKey: "matching.topics.adhd",
    unsplashId: "photo-1434030216411-0b793f4b4173",
    section: "clinical",
    mappedSpecialties: ["adhd"],
    subTopics: [
      {
        id: "attentionProblems",
        labelKey: "matching.subtopics.attentionProblems",
        weight: 3,
      },
      {
        id: "hyperactivity",
        labelKey: "matching.subtopics.hyperactivity",
        weight: 3,
      },
      {
        id: "impulsivity",
        labelKey: "matching.subtopics.impulsivity",
        weight: 2,
      },
      {
        id: "organizationStructure",
        labelKey: "matching.subtopics.organizationStructure",
        weight: 2,
      },
    ],
  },

  // 11. AUTISMUS-SPEKTRUM
  {
    id: "autism",
    labelKey: "matching.topics.autism",
    unsplashId: "photo-1522071820081-009f0129c71c",
    section: "clinical",
    mappedSpecialties: ["autism"],
    subTopics: [
      {
        id: "socialInteraction",
        labelKey: "matching.subtopics.socialInteraction",
        weight: 3,
      },
      {
        id: "sensoryProcessing",
        labelKey: "matching.subtopics.sensoryProcessing",
        weight: 3,
      },
      {
        id: "routinesFlexibility",
        labelKey: "matching.subtopics.routinesFlexibility",
        weight: 2,
      },
      {
        id: "communicationAutism",
        labelKey: "matching.subtopics.communicationAutism",
        weight: 2,
      },
    ],
  },

  // 12. PSYCHOSOMATIK
  {
    id: "psychosomatic",
    labelKey: "matching.topics.psychosomatic",
    unsplashId: "photo-1576091160550-2173dba999ef",
    section: "clinical",
    mappedSpecialties: ["psychosomatic"],
    subTopics: [
      {
        id: "chronicPain",
        labelKey: "matching.subtopics.chronicPain",
        weight: 3,
      },
      {
        id: "somatoformDisorders",
        labelKey: "matching.subtopics.somatoformDisorders",
        weight: 3,
      },
      {
        id: "bodyRelatedFears",
        labelKey: "matching.subtopics.bodyRelatedFears",
        weight: 2,
      },
      {
        id: "stressRelatedSymptoms",
        labelKey: "matching.subtopics.stressRelatedSymptoms",
        weight: 2,
      },
    ],
  },

  // 13. IDENTITÄT & SELBSTWERT
  {
    id: "selfEsteem",
    labelKey: "matching.topics.selfEsteem",
    unsplashId: "photo-1517836357463-d25dfeac3438",
    section: "clinical",
    mappedSpecialties: ["identity"],
    subTopics: [
      {
        id: "selfWorthProblems",
        labelKey: "matching.subtopics.selfWorthProblems",
        weight: 3,
      },
      {
        id: "identityFinding",
        labelKey: "matching.subtopics.identityFinding",
        weight: 3,
      },
      {
        id: "perfectionism",
        labelKey: "matching.subtopics.perfectionism",
        weight: 2,
      },
      {
        id: "shameGuilt",
        labelKey: "matching.subtopics.shameGuilt",
        weight: 2,
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
        id: "communicationProblems",
        labelKey: "matching.subtopics.communicationProblems",
        weight: 3,
      },
      {
        id: "trustIssues",
        labelKey: "matching.subtopics.trustIssues",
        weight: 3,
      },
      {
        id: "separationDivorce",
        labelKey: "matching.subtopics.separationDivorce",
        weight: 2,
      },
      {
        id: "relationshipFears",
        labelKey: "matching.subtopics.relationshipFears",
        weight: 2,
      },
    ],
  },

  // 2. FAMILIE & ERZIEHUNG
  {
    id: "family",
    labelKey: "matching.topics.family",
    unsplashId: "photo-1511895426328-dc8714191300",
    section: "life",
    mappedSpecialties: ["family", "parenting"],
    subTopics: [
      {
        id: "parentChildConflicts",
        labelKey: "matching.subtopics.parentChildConflicts",
        weight: 3,
      },
      {
        id: "siblingRivalry",
        labelKey: "matching.subtopics.siblingRivalry",
        weight: 2,
      },
      {
        id: "patchworkFamily",
        labelKey: "matching.subtopics.patchworkFamily",
        weight: 2,
      },
      {
        id: "parentingQuestions",
        labelKey: "matching.subtopics.parentingQuestions",
        weight: 2,
      },
    ],
  },

  // 3. LGBTQ+
  {
    id: "lgbtq",
    labelKey: "matching.topics.lgbtq",
    unsplashId: "photo-1518199266791-5375a83190b7",
    section: "life",
    mappedSpecialties: ["lgbtq", "identity"],
    subTopics: [
      {
        id: "comingOut",
        labelKey: "matching.subtopics.comingOut",
        weight: 3,
      },
      {
        id: "genderIdentity",
        labelKey: "matching.subtopics.genderIdentity",
        weight: 3,
      },
      {
        id: "discriminationExperiences",
        labelKey: "matching.subtopics.discriminationExperiences",
        weight: 2,
      },
      {
        id: "lgbtqRelationships",
        labelKey: "matching.subtopics.lgbtqRelationships",
        weight: 2,
      },
    ],
  },

  // 4. MIGRATION & KULTUR
  {
    id: "migration",
    labelKey: "matching.topics.migration",
    unsplashId: "photo-1529156069898-49953e39b3ac",
    section: "life",
    mappedSpecialties: ["migration"],
    subTopics: [
      {
        id: "culturalAdaptation",
        labelKey: "matching.subtopics.culturalAdaptation",
        weight: 3,
      },
      {
        id: "homesicknessUprooting",
        labelKey: "matching.subtopics.homesicknessUprooting",
        weight: 3,
      },
      {
        id: "languageBarriers",
        labelKey: "matching.subtopics.languageBarriers",
        weight: 2,
      },
      {
        id: "interculturalConflicts",
        labelKey: "matching.subtopics.interculturalConflicts",
        weight: 2,
      },
    ],
  },

  // 5. BERUF & KARRIERE
  {
    id: "career",
    labelKey: "matching.topics.career",
    unsplashId: "photo-1454165804606-c3d57bc86b40",
    section: "life",
    mappedSpecialties: ["career", "burnout"],
    subTopics: [
      {
        id: "careerReorientation",
        labelKey: "matching.subtopics.careerReorientation",
        weight: 3,
      },
      {
        id: "workplaceConflicts",
        labelKey: "matching.subtopics.workplaceConflicts",
        weight: 3,
      },
      {
        id: "terminationUnemployment",
        labelKey: "matching.subtopics.terminationUnemployment",
        weight: 2,
      },
      {
        id: "careerPlanning",
        labelKey: "matching.subtopics.careerPlanning",
        weight: 2,
      },
    ],
  },

  // 6. KINDER & JUGENDLICHE
  {
    id: "childrenYouth",
    labelKey: "matching.topics.childrenYouth",
    unsplashId: "photo-1503454537195-1dcabb73ffb9",
    section: "life",
    mappedSpecialties: ["children"],
    subTopics: [
      {
        id: "schoolProblems",
        labelKey: "matching.subtopics.schoolProblems",
        weight: 3,
      },
      {
        id: "bullying",
        labelKey: "matching.subtopics.bullying",
        weight: 3,
      },
      {
        id: "developmentalCrises",
        labelKey: "matching.subtopics.developmentalCrises",
        weight: 2,
      },
      {
        id: "familyProblemsYouth",
        labelKey: "matching.subtopics.familyProblemsYouth",
        weight: 2,
      },
    ],
  },

  // 7. ÄLTERE MENSCHEN
  {
    id: "elderly",
    labelKey: "matching.topics.elderly",
    unsplashId: "photo-1499750310107-5fef28a66643",
    section: "life",
    mappedSpecialties: ["elderly"],
    subTopics: [
      {
        id: "ageRelatedDepression",
        labelKey: "matching.subtopics.ageRelatedDepression",
        weight: 3,
      },
      {
        id: "lonelinessInAge",
        labelKey: "matching.subtopics.lonelinessInAge",
        weight: 3,
      },
      {
        id: "lifeReview",
        labelKey: "matching.subtopics.lifeReview",
        weight: 2,
      },
      {
        id: "lossGriefElderly",
        labelKey: "matching.subtopics.lossGriefElderly",
        weight: 2,
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
