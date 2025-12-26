"use server";

import { db } from "@/lib/db";
import type {
  MatchingCriteria,
  MatchedTherapist,
  Therapist,
  BlogPost,
} from "@/types/therapist";
import {
  calculateMatchScoreForAllWithBreakdown,
  getSpecialtiesFromTopics,
} from "@/lib/matching";
import { demoBlogPosts } from "@/lib/data/demo-data";

// Additional runtime filters for post-match filtering
export interface AdditionalFilters {
  location?: string;
  gender?: string | null;
  sessionType?: string | null;
  insurance?: string[];
  priceRange?: { min: number; max: number };
  minRating?: number;
  therapyTypes?: string[];
  therapySettings?: string[];
}

export async function searchWithMatching(
  criteria: MatchingCriteria,
  additionalFilters?: AdditionalFilters
): Promise<{ therapists: MatchedTherapist[]; blogs: BlogPost[] }> {
  try {
    console.log("[searchWithMatching] Starting matching search...");

    // Get specialties from selected topics
    const specialties = getSpecialtiesFromTopics(criteria.selectedTopics);

    // Build database query
    const whereClause: Record<string, unknown> = {
      isPublished: true,
    };

    // Filter by specialties if topics were selected
    if (specialties.length > 0) {
      whereClause.specializations = { hasSome: specialties };
    }

    // Apply additional DB-level filters for efficiency
    // Location filter matches both city and postalCode (consistent with count-matches.ts)
    if (additionalFilters?.location && additionalFilters.location.trim() !== "") {
      whereClause.OR = [
        { city: { contains: additionalFilters.location, mode: "insensitive" } },
        { postalCode: { contains: additionalFilters.location } },
      ];
    }
    if (additionalFilters?.gender) {
      whereClause.gender = additionalFilters.gender;
    }
    if (additionalFilters?.sessionType) {
      // "both" matches online and in_person too
      if (additionalFilters.sessionType === "online") {
        whereClause.sessionType = { in: ["online", "both"] };
      } else if (additionalFilters.sessionType === "in_person") {
        whereClause.sessionType = { in: ["in_person", "both"] };
      } else {
        whereClause.sessionType = additionalFilters.sessionType;
      }
    }
    if (additionalFilters?.insurance && additionalFilters.insurance.length > 0) {
      whereClause.insurance = { hasSome: additionalFilters.insurance };
    }
    if (additionalFilters?.therapyTypes && additionalFilters.therapyTypes.length > 0) {
      whereClause.therapyTypes = { hasSome: additionalFilters.therapyTypes };
    }
    if (additionalFilters?.therapySettings && additionalFilters.therapySettings.length > 0) {
      whereClause.therapySettings = { hasSome: additionalFilters.therapySettings };
    }

    console.log("[searchWithMatching] Querying database...");
    // Fetch therapist profiles
    const profiles = await db.therapistProfile.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
  });

  // Transform to Therapist type (including therapy style fields and matching fields)
  const therapists: Therapist[] = profiles.map((profile) => ({
    id: profile.id,
    slug: profile.slug ?? "",
    name: profile.user.name ?? "Unknown",
    title: profile.title ?? "",
    imageUrl:
      profile.imageUrl ??
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    specializations: profile.specializations as Therapist["specializations"],
    therapyTypes: profile.therapyTypes as Therapist["therapyTypes"],
    languages: profile.languages as Therapist["languages"],
    location: {
      city: profile.city ?? "",
      postalCode: profile.postalCode ?? "",
    },
    pricePerSession: profile.pricePerSession ?? 0,
    rating: profile.rating ?? 0,
    reviewCount: profile.reviewCount ?? 0,
    shortDescription: profile.shortDescription ?? "",
    sessionType: profile.sessionType as Therapist["sessionType"],
    insurance: profile.insurance as Therapist["insurance"],
    availability: profile.availability as Therapist["availability"],
    gender: profile.gender as Therapist["gender"],
    // Account & Verification fields for matching
    accountType: profile.accountType as Therapist["accountType"],
    isVerified: profile.isVerified ?? false,
    experienceYears: profile.experienceYears ?? undefined,
    specializationRanks: (profile.specializationRanks as Record<string, 1 | 2 | 3>) ?? undefined,
    // Sub-specializations for precise matching
    subSpecializations: profile.subSpecializations as Therapist["subSpecializations"],
    subSpecializationRanks: (profile.subSpecializationRanks as Record<string, 1 | 2 | 3>) ?? undefined,
    profileCompleteness: profile.profileCompleteness ?? undefined,
    // Therapy Style fields for matching
    communicationStyle: profile.communicationStyle as Therapist["communicationStyle"],
    usesHomework: profile.usesHomework ?? undefined,
    therapyFocus: profile.therapyFocus as Therapist["therapyFocus"],
    clientTalkRatio: profile.clientTalkRatio ?? undefined,
    therapyDepth: profile.therapyDepth as Therapist["therapyDepth"],
  }));

  // Calculate match scores with breakdown and sort
  let matchedTherapists = calculateMatchScoreForAllWithBreakdown(therapists, criteria);
  console.log(`[searchWithMatching] Found ${matchedTherapists.length} matched therapists before post-filtering`);

  // Post-filter for price range and rating (can't easily do in DB)
  if (additionalFilters?.priceRange) {
    const { min, max } = additionalFilters.priceRange;
    matchedTherapists = matchedTherapists.filter(
      (t) => t.pricePerSession >= min && t.pricePerSession <= max
    );
  }
  if (additionalFilters?.minRating && additionalFilters.minRating > 0) {
    matchedTherapists = matchedTherapists.filter(
      (t) => t.rating >= additionalFilters.minRating!
    );
  }

  console.log(`[searchWithMatching] Found ${matchedTherapists.length} matched therapists after filtering`);

  // FALLBACK: If no matches found, show top-rated therapists as suggestions
  if (matchedTherapists.length === 0) {
    console.log("[searchWithMatching] No exact matches, fetching suggestions...");

    // Fetch all published therapists without filters
    const fallbackProfiles = await db.therapistProfile.findMany({
      where: { isPublished: true },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      take: 8, // Limit suggestions
    });

    // Transform to Therapist type
    const fallbackTherapists: Therapist[] = fallbackProfiles.map((profile) => ({
      id: profile.id,
      slug: profile.slug ?? "",
      name: profile.user.name ?? "Unknown",
      title: profile.title ?? "",
      imageUrl: profile.imageUrl ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      specializations: profile.specializations as Therapist["specializations"],
      therapyTypes: profile.therapyTypes as Therapist["therapyTypes"],
      languages: profile.languages as Therapist["languages"],
      location: { city: profile.city ?? "", postalCode: profile.postalCode ?? "" },
      pricePerSession: profile.pricePerSession ?? 0,
      rating: profile.rating ?? 0,
      reviewCount: profile.reviewCount ?? 0,
      shortDescription: profile.shortDescription ?? "",
      sessionType: profile.sessionType as Therapist["sessionType"],
      insurance: profile.insurance as Therapist["insurance"],
      availability: profile.availability as Therapist["availability"],
      gender: profile.gender as Therapist["gender"],
      accountType: profile.accountType as Therapist["accountType"],
      isVerified: profile.isVerified ?? false,
      experienceYears: profile.experienceYears ?? undefined,
      specializationRanks: (profile.specializationRanks as Record<string, 1 | 2 | 3>) ?? undefined,
      subSpecializations: profile.subSpecializations as Therapist["subSpecializations"],
      subSpecializationRanks: (profile.subSpecializationRanks as Record<string, 1 | 2 | 3>) ?? undefined,
      profileCompleteness: profile.profileCompleteness ?? undefined,
      communicationStyle: profile.communicationStyle as Therapist["communicationStyle"],
      usesHomework: profile.usesHomework ?? undefined,
      therapyFocus: profile.therapyFocus as Therapist["therapyFocus"],
      clientTalkRatio: profile.clientTalkRatio ?? undefined,
      therapyDepth: profile.therapyDepth as Therapist["therapyDepth"],
    }));

    // Calculate scores but mark as suggestions
    matchedTherapists = calculateMatchScoreForAllWithBreakdown(fallbackTherapists, criteria)
      .map((t) => ({ ...t, isSuggestion: true }));

    console.log(`[searchWithMatching] Returning ${matchedTherapists.length} suggestions`);
  }

  // Fetch related blog posts
  const blogs = await getRelatedBlogPosts(criteria.selectedTopics);

  console.log(`[searchWithMatching] Returning results`);
  return {
    therapists: matchedTherapists,
    blogs,
  };
  } catch (error) {
    console.error("[searchWithMatching] Error:", error);
    throw new Error("Failed to fetch matched therapists");
  }
}

async function getRelatedBlogPosts(selectedTopics: string[]): Promise<BlogPost[]> {
  if (selectedTopics.length === 0) {
    return [];
  }

  // Get specialties from topics for category matching
  const specialties = getSpecialtiesFromTopics(selectedTopics);

  // Try database first
  try {
    const posts = await db.blogPost.findMany({
      where: {
        status: "published",
        categories: {
          some: {
            category: {
              slug: { in: specialties },
            },
          },
        },
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: 6,
    });

    if (posts.length > 0) {
      return posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        featuredImage: post.featuredImage ?? "",
        excerpt: post.summaryShort ?? "",
        author: {
          id: post.authorId,
          name: post.author.name ?? "Unknown",
          imageUrl: post.author.image ?? "",
        },
        category: (post.categories[0]?.category.slug ?? "depression") as BlogPost["category"],
        tags: [],
        readingTimeMinutes: post.readingTimeMinutes ?? 5,
        publishedAt: post.publishedAt?.toISOString() ?? new Date().toISOString(),
      }));
    }
  } catch {
    // Database query failed, fall through to demo data
  }

  // Fall back to demo blog posts filtered by matching specialties
  const filteredBlogs = demoBlogPosts.filter((blog) =>
    specialties.includes(blog.category)
  );

  // Return up to 6 relevant blog posts
  return filteredBlogs.slice(0, 6);
}
