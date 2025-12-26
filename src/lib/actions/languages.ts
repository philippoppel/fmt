"use server";

import { db } from "@/lib/db";

/**
 * Get all languages that are offered by at least one therapist
 */
export async function getAvailableLanguages(): Promise<string[]> {
  const profiles = await db.therapistProfile.findMany({
    where: {
      isPublished: true,
    },
    select: {
      languages: true,
    },
  });

  const languageSet = new Set<string>();
  profiles.forEach((p) => {
    p.languages.forEach((lang) => languageSet.add(lang));
  });

  return Array.from(languageSet).sort();
}
