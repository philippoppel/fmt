import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VALID = ["depression", "anxiety", "trauma", "relationships", "addiction", "eating_disorders", "adhd", "burnout"];

// Mapping from German labels to valid keys
const MAPPING: Record<string, string | null> = {
  "Krisenintervention": "trauma",
  "Angststörungen": "anxiety",
  "Junge Erwachsene": null, // Remove - not a specialty
  "Verhaltenstherapie": null, // This is a therapy type, not specialty
  "Depression": "depression",
  "Burnout": "burnout",
};

async function main() {
  const therapists = await prisma.therapistProfile.findMany({
    select: {
      id: true,
      user: { select: { name: true } },
      specializations: true,
    }
  });

  console.log("Fixing therapist specializations...\n");

  for (const t of therapists) {
    const invalid = t.specializations.filter(s => VALID.indexOf(s) === -1);
    if (invalid.length > 0) {
      console.log("Therapist:", t.user?.name || t.id);
      console.log("Invalid:", invalid.join(", "));

      // Create fixed specializations array
      const fixed = t.specializations
        .map(s => {
          if (VALID.includes(s)) return s;
          const mapped = MAPPING[s];
          return mapped; // Returns null for items to remove
        })
        .filter((s): s is string => s !== null && s !== undefined);

      // Remove duplicates
      const unique = [...new Set(fixed)];

      console.log("Fixed:", unique.join(", "));

      // Update in database
      await prisma.therapistProfile.update({
        where: { id: t.id },
        data: { specializations: unique }
      });

      console.log("✓ Updated!\n---");
    }
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
