/**
 * Script to generate slugs for all therapist profiles that don't have one
 * Run with: npx tsx scripts/generate-profile-slugs.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

async function generateSlugs() {
  console.log("Fetching profiles without slugs...\n");

  // Get all profiles with their user names
  const profiles = await prisma.therapistProfile.findMany({
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  console.log(`Found ${profiles.length} total profiles\n`);

  // Track existing slugs to avoid duplicates
  const existingSlugs = new Set<string>();

  // First, collect all existing slugs
  for (const profile of profiles) {
    if (profile.slug) {
      existingSlugs.add(profile.slug);
    }
  }

  let updated = 0;
  let skipped = 0;

  for (const profile of profiles) {
    const name = profile.user?.name || "unknown";

    // Skip if already has a proper slug (not empty)
    if (profile.slug && profile.slug.length > 0) {
      console.log(`✓ ${name}: already has slug "${profile.slug}"`);
      skipped++;
      continue;
    }

    // Generate base slug from name
    let baseSlug = generateSlugFromName(name);
    let slug = baseSlug;
    let counter = 1;

    // Ensure uniqueness
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Update the profile
    await prisma.therapistProfile.update({
      where: { id: profile.id },
      data: { slug },
    });

    existingSlugs.add(slug);
    console.log(`✓ ${name}: generated slug "${slug}"`);
    updated++;
  }

  console.log(`\n========================================`);
  console.log(`Updated: ${updated} profiles`);
  console.log(`Skipped: ${skipped} profiles (already had slugs)`);
  console.log(`========================================\n`);
}

generateSlugs()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
