import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  rankTherapists,
  type WizardMatchInput,
  type TherapistForMatching,
} from "@/lib/matching/wizard-score-calculator";
import type { SessionType, Gender } from "@/types/therapist";

// Type for Prisma query result
interface TherapistQueryResult {
  id: string;
  slug: string | null;
  user: { name: string | null } | null;
  imageUrl: string | null;
  shortDescription: string | null;
  city: string | null;
  postalCode: string | null;
  sessionType: string;
  insurance: string[];
  experienceYears: number | null;
  availability: string;
  wizardCategories: string[];
  wizardSubcategories: string[];
  primaryStyleStructure: string | null;
  primaryStyleEngagement: string | null;
  styleTags: string[];
  specializations: string[];
  gender: string | null;
  languages: string[];
  // Evidence-based matching fields
  therapyDepth: string | null;
  therapyFocus: string | null;
  therapeuticStance: string[];
  // Exclusion criteria - topics therapist does NOT work with
  excludedTopics: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const input: WizardMatchInput = {
      categoryId: body.categoryId ?? "",
      subcategoryId: body.subcategoryId ?? "",
      severityScore: body.severityScore ?? 0,
      styleStructure: body.styleStructure ?? null,
      styleEngagement: body.styleEngagement ?? null,
      // Evidence-based fields (P2, P3)
      therapyGoal: body.therapyGoal ?? null,
      timeOrientation: body.timeOrientation ?? null,
      // Logistics
      sessionType: body.sessionType ?? null,
      insurance: body.insurance ?? null,
      // Additional preferences
      genderPreference: body.genderPreference ?? null,
      location: body.location ?? null,
      searchRadius: body.searchRadius ?? null,
      languages: body.languages ?? [],
      // Evidence-based: negative experience
      hadNegativeExperience: body.hadNegativeExperience ?? false,
    };

    // Fetch therapists with the new wizard fields
    const therapists = (await db.therapistProfile.findMany({
      where: {
        // Only include verified therapists or those with any profile data
        OR: [
          { isVerified: true },
          { shortDescription: { not: null } },
        ],
      },
      select: {
        id: true,
        slug: true,
        user: {
          select: {
            name: true,
          },
        },
        imageUrl: true,
        shortDescription: true,
        city: true,
        postalCode: true,
        sessionType: true,
        insurance: true,
        experienceYears: true,
        availability: true,
        wizardCategories: true,
        wizardSubcategories: true,
        primaryStyleStructure: true,
        primaryStyleEngagement: true,
        styleTags: true,
        // Fallback to specializations if wizard fields are empty
        specializations: true,
        // Preference fields for filtering
        gender: true,
        languages: true,
        // Evidence-based matching fields
        therapyDepth: true,
        therapyFocus: true,
        therapeuticStance: true,
        excludedTopics: true,
      },
    })) as TherapistQueryResult[];

    // Transform to the expected format
    const therapistsForMatching: TherapistForMatching[] = therapists.map(
      (t: TherapistQueryResult) => ({
        id: t.id,
        slug: t.slug,
        name: t.user?.name ?? "Therapeut:in",
        imageUrl: t.imageUrl,
        shortDescription: t.shortDescription,
        city: t.city,
        postalCode: t.postalCode,
        sessionType: t.sessionType as SessionType,
        insurance: t.insurance ?? [],
        experienceYears: t.experienceYears,
        wizardCategories: t.wizardCategories ?? [],
        wizardSubcategories: t.wizardSubcategories ?? [],
        primaryStyleStructure: t.primaryStyleStructure,
        primaryStyleEngagement: t.primaryStyleEngagement,
        styleTags: t.styleTags ?? [],
        availability: t.availability ?? "flexible",
        specializations: t.specializations ?? [], // Fallback for category matching
        // Preference fields
        gender: t.gender as Gender | null,
        languages: t.languages ?? ["de"], // Default to German
        // Evidence-based matching fields
        therapyDepth: t.therapyDepth,
        therapyFocus: t.therapyFocus,
        therapeuticStance: t.therapeuticStance ?? [],
        excludedTopics: t.excludedTopics ?? [],
      })
    );

    // Rank therapists and get top 3
    const matches = rankTherapists(therapistsForMatching, input, 3);

    return NextResponse.json({
      matches,
      total: therapistsForMatching.length,
      filtered: matches.length,
    });
  } catch (error) {
    console.error("Wizard V2 matching error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
