import type { IntensityLevel } from "@/components/matching/matching-context";

export interface IntensityStatement {
  id: string;
  topicId: string;
  labelKey: string;
  weight: number; // 1-3 (how much this indicates severity)
}

// Intensity statements per topic (3-7 statements each, layman-friendly language)
export const INTENSITY_STATEMENTS: Record<string, IntensityStatement[]> = {
  depression: [
    {
      id: "dep_daily",
      topicId: "depression",
      labelKey: "matching.intensity.depression.daily",
      weight: 2,
    },
    {
      id: "dep_sleep",
      topicId: "depression",
      labelKey: "matching.intensity.depression.sleep",
      weight: 1,
    },
    {
      id: "dep_work",
      topicId: "depression",
      labelKey: "matching.intensity.depression.work",
      weight: 2,
    },
    {
      id: "dep_isolation",
      topicId: "depression",
      labelKey: "matching.intensity.depression.isolation",
      weight: 2,
    },
    {
      id: "dep_hopeless",
      topicId: "depression",
      labelKey: "matching.intensity.depression.hopeless",
      weight: 3,
    },
  ],
  anxiety: [
    {
      id: "anx_daily",
      topicId: "anxiety",
      labelKey: "matching.intensity.anxiety.daily",
      weight: 2,
    },
    {
      id: "anx_avoid",
      topicId: "anxiety",
      labelKey: "matching.intensity.anxiety.avoid",
      weight: 2,
    },
    {
      id: "anx_physical",
      topicId: "anxiety",
      labelKey: "matching.intensity.anxiety.physical",
      weight: 1,
    },
    {
      id: "anx_panic",
      topicId: "anxiety",
      labelKey: "matching.intensity.anxiety.panic",
      weight: 3,
    },
    {
      id: "anx_work",
      topicId: "anxiety",
      labelKey: "matching.intensity.anxiety.work",
      weight: 2,
    },
  ],
  family: [
    {
      id: "fam_daily",
      topicId: "family",
      labelKey: "matching.intensity.family.daily",
      weight: 2,
    },
    {
      id: "fam_communication",
      topicId: "family",
      labelKey: "matching.intensity.family.communication",
      weight: 1,
    },
    {
      id: "fam_avoidance",
      topicId: "family",
      labelKey: "matching.intensity.family.avoidance",
      weight: 2,
    },
    {
      id: "fam_children",
      topicId: "family",
      labelKey: "matching.intensity.family.children",
      weight: 3,
    },
  ],
  relationships: [
    {
      id: "rel_daily",
      topicId: "relationships",
      labelKey: "matching.intensity.relationships.daily",
      weight: 2,
    },
    {
      id: "rel_trust",
      topicId: "relationships",
      labelKey: "matching.intensity.relationships.trust",
      weight: 2,
    },
    {
      id: "rel_communication",
      topicId: "relationships",
      labelKey: "matching.intensity.relationships.communication",
      weight: 1,
    },
    {
      id: "rel_separation",
      topicId: "relationships",
      labelKey: "matching.intensity.relationships.separation",
      weight: 3,
    },
  ],
  burnout: [
    {
      id: "burn_exhausted",
      topicId: "burnout",
      labelKey: "matching.intensity.burnout.exhausted",
      weight: 2,
    },
    {
      id: "burn_work",
      topicId: "burnout",
      labelKey: "matching.intensity.burnout.work",
      weight: 2,
    },
    {
      id: "burn_cynical",
      topicId: "burnout",
      labelKey: "matching.intensity.burnout.cynical",
      weight: 2,
    },
    {
      id: "burn_physical",
      topicId: "burnout",
      labelKey: "matching.intensity.burnout.physical",
      weight: 3,
    },
    {
      id: "burn_weekend",
      topicId: "burnout",
      labelKey: "matching.intensity.burnout.weekend",
      weight: 1,
    },
  ],
  trauma: [
    {
      id: "trauma_flashbacks",
      topicId: "trauma",
      labelKey: "matching.intensity.trauma.flashbacks",
      weight: 3,
    },
    {
      id: "trauma_avoid",
      topicId: "trauma",
      labelKey: "matching.intensity.trauma.avoid",
      weight: 2,
    },
    {
      id: "trauma_sleep",
      topicId: "trauma",
      labelKey: "matching.intensity.trauma.sleep",
      weight: 2,
    },
    {
      id: "trauma_trust",
      topicId: "trauma",
      labelKey: "matching.intensity.trauma.trust",
      weight: 2,
    },
    {
      id: "trauma_daily",
      topicId: "trauma",
      labelKey: "matching.intensity.trauma.daily",
      weight: 3,
    },
  ],
  addiction: [
    {
      id: "add_control",
      topicId: "addiction",
      labelKey: "matching.intensity.addiction.control",
      weight: 2,
    },
    {
      id: "add_daily",
      topicId: "addiction",
      labelKey: "matching.intensity.addiction.daily",
      weight: 3,
    },
    {
      id: "add_relationships",
      topicId: "addiction",
      labelKey: "matching.intensity.addiction.relationships",
      weight: 2,
    },
    {
      id: "add_withdrawal",
      topicId: "addiction",
      labelKey: "matching.intensity.addiction.withdrawal",
      weight: 3,
    },
    {
      id: "add_hide",
      topicId: "addiction",
      labelKey: "matching.intensity.addiction.hide",
      weight: 1,
    },
  ],
  eating_disorders: [
    {
      id: "eat_thoughts",
      topicId: "eating_disorders",
      labelKey: "matching.intensity.eating.thoughts",
      weight: 2,
    },
    {
      id: "eat_control",
      topicId: "eating_disorders",
      labelKey: "matching.intensity.eating.control",
      weight: 2,
    },
    {
      id: "eat_physical",
      topicId: "eating_disorders",
      labelKey: "matching.intensity.eating.physical",
      weight: 3,
    },
    {
      id: "eat_social",
      topicId: "eating_disorders",
      labelKey: "matching.intensity.eating.social",
      weight: 2,
    },
  ],
  adhd: [
    {
      id: "adhd_focus",
      topicId: "adhd",
      labelKey: "matching.intensity.adhd.focus",
      weight: 2,
    },
    {
      id: "adhd_organize",
      topicId: "adhd",
      labelKey: "matching.intensity.adhd.organize",
      weight: 2,
    },
    {
      id: "adhd_impulsive",
      topicId: "adhd",
      labelKey: "matching.intensity.adhd.impulsive",
      weight: 2,
    },
    {
      id: "adhd_work",
      topicId: "adhd",
      labelKey: "matching.intensity.adhd.work",
      weight: 2,
    },
    {
      id: "adhd_relationships",
      topicId: "adhd",
      labelKey: "matching.intensity.adhd.relationships",
      weight: 1,
    },
  ],
  self_care: [
    {
      id: "self_worth",
      topicId: "self_care",
      labelKey: "matching.intensity.selfcare.worth",
      weight: 2,
    },
    {
      id: "self_boundaries",
      topicId: "self_care",
      labelKey: "matching.intensity.selfcare.boundaries",
      weight: 2,
    },
    {
      id: "self_neglect",
      topicId: "self_care",
      labelKey: "matching.intensity.selfcare.neglect",
      weight: 1,
    },
    {
      id: "self_overwhelm",
      topicId: "self_care",
      labelKey: "matching.intensity.selfcare.overwhelm",
      weight: 2,
    },
  ],
  stress: [
    {
      id: "stress_constant",
      topicId: "stress",
      labelKey: "matching.intensity.stress.constant",
      weight: 2,
    },
    {
      id: "stress_physical",
      topicId: "stress",
      labelKey: "matching.intensity.stress.physical",
      weight: 2,
    },
    {
      id: "stress_sleep",
      topicId: "stress",
      labelKey: "matching.intensity.stress.sleep",
      weight: 1,
    },
    {
      id: "stress_control",
      topicId: "stress",
      labelKey: "matching.intensity.stress.control",
      weight: 3,
    },
  ],
  sleep: [
    {
      id: "sleep_falling",
      topicId: "sleep",
      labelKey: "matching.intensity.sleep.falling",
      weight: 1,
    },
    {
      id: "sleep_staying",
      topicId: "sleep",
      labelKey: "matching.intensity.sleep.staying",
      weight: 2,
    },
    {
      id: "sleep_daily",
      topicId: "sleep",
      labelKey: "matching.intensity.sleep.daily",
      weight: 2,
    },
    {
      id: "sleep_nightmares",
      topicId: "sleep",
      labelKey: "matching.intensity.sleep.nightmares",
      weight: 2,
    },
    {
      id: "sleep_medication",
      topicId: "sleep",
      labelKey: "matching.intensity.sleep.medication",
      weight: 3,
    },
  ],
};

/**
 * Get intensity statements for given topic IDs
 */
export function getIntensityStatementsForTopics(
  topicIds: string[]
): IntensityStatement[] {
  const statements: IntensityStatement[] = [];
  for (const topicId of topicIds) {
    const topicStatements = INTENSITY_STATEMENTS[topicId];
    if (topicStatements) {
      statements.push(...topicStatements);
    }
  }
  return statements;
}

/**
 * Find a statement by its ID
 */
export function findStatement(statementId: string): IntensityStatement | null {
  for (const statements of Object.values(INTENSITY_STATEMENTS)) {
    const found = statements.find((s) => s.id === statementId);
    if (found) return found;
  }
  return null;
}

/**
 * Calculate intensity score from selected statements
 */
export function calculateIntensityScore(
  selectedStatementIds: string[],
  topicIds: string[]
): { score: number; level: IntensityLevel | null } {
  if (selectedStatementIds.length === 0) {
    return { score: 0, level: null };
  }

  // Get all available statements for the selected topics
  const availableStatements = getIntensityStatementsForTopics(topicIds);
  if (availableStatements.length === 0) {
    return { score: 0, level: null };
  }

  // Calculate max possible weight
  const maxWeight = availableStatements.reduce((sum, s) => sum + s.weight, 0);

  // Calculate selected weight
  let selectedWeight = 0;
  for (const stmtId of selectedStatementIds) {
    const stmt = findStatement(stmtId);
    if (stmt) {
      selectedWeight += stmt.weight;
    }
  }

  // Calculate percentage (0-100)
  const score = Math.round((selectedWeight / maxWeight) * 100);

  // Determine level
  let level: IntensityLevel;
  if (score < 30) {
    level = "low";
  } else if (score < 70) {
    level = "medium";
  } else {
    level = "high";
  }

  return { score, level };
}
