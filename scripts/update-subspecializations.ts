import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mapping: Specialization -> relevant SubSpecializations
const SUBSPECIALIZATION_MAP: Record<string, string[]> = {
  anxiety: ["social_anxiety", "panic_attacks", "phobias", "generalized_anxiety"],
  depression: ["chronic_sadness", "lack_motivation", "grief", "loneliness"],
  trauma: ["ptsd", "childhood_trauma", "accident_trauma", "loss"],
  relationships: ["couple_conflicts", "breakup", "dating_issues", "intimacy", "divorce", "parenting", "family_conflicts"],
  burnout: ["work_stress", "exhaustion", "work_life_balance", "chronic_stress", "performance_pressure"],
  addiction: ["alcohol", "drugs", "behavioral_addiction", "gaming"],
  eating_disorders: ["anorexia", "bulimia", "binge_eating"],
  adhd: ["concentration", "impulsivity", "adult_adhd"],
};

// Pick random SubSpecializations for a therapist based on their specializations
function getSubSpecsForTherapist(
  specializations: string[],
  maxSubSpecs: number = 5
): { subSpecializations: string[]; subSpecializationRanks: Record<string, number> } {
  const allPossibleSubs: string[] = [];

  for (const spec of specializations) {
    const subs = SUBSPECIALIZATION_MAP[spec];
    if (subs) {
      allPossibleSubs.push(...subs);
    }
  }

  // Remove duplicates
  const uniqueSubs = [...new Set(allPossibleSubs)];

  // Shuffle and pick random subspecs
  const shuffled = uniqueSubs.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(maxSubSpecs, shuffled.length));

  // Assign ranks (1, 2, 3) to first 3
  const ranks: Record<string, number> = {};
  selected.forEach((sub, index) => {
    if (index < 3) {
      ranks[sub] = (index + 1) as 1 | 2 | 3;
    }
  });

  return { subSpecializations: selected, subSpecializationRanks: ranks };
}

async function main() {
  console.log("Updating therapist profiles with SubSpecializations...\n");

  const profiles = await prisma.therapistProfile.findMany();

  for (const profile of profiles) {
    const specializations = profile.specializations as string[];

    if (specializations.length === 0) {
      console.log(`Skipping ${profile.title} - no specializations`);
      continue;
    }

    const { subSpecializations, subSpecializationRanks } = getSubSpecsForTherapist(specializations);

    await prisma.therapistProfile.update({
      where: { id: profile.id },
      data: {
        subSpecializations,
        subSpecializationRanks,
      },
    });

    console.log(
      `Updated: ${profile.title} -> [${subSpecializations.join(", ")}] ranks: ${JSON.stringify(subSpecializationRanks)}`
    );
  }

  console.log("\nDone!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
