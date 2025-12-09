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
    if (additionalFilters?.location) {
      whereClause.city = { contains: additionalFilters.location, mode: "insensitive" };
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
