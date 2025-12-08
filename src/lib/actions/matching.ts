"use server";

import { db } from "@/lib/db";
import type {
  MatchingCriteria,
  MatchedTherapist,
  Therapist,
  BlogPost,
} from "@/types/therapist";
import {
  calculateMatchScoreForAll,
  getSpecialtiesFromTopics,
} from "@/lib/matching";

export async function searchWithMatching(
  criteria: MatchingCriteria
): Promise<{ therapists: MatchedTherapist[]; blogs: BlogPost[] }> {
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

  // Transform to Therapist type
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
  }));

  // Calculate match scores and sort
  const matchedTherapists = calculateMatchScoreForAll(therapists, criteria);

  // Fetch related blog posts
  const blogs = await getRelatedBlogPosts(criteria.selectedTopics);

  return {
    therapists: matchedTherapists,
    blogs,
  };
}

async function getRelatedBlogPosts(selectedTopics: string[]): Promise<BlogPost[]> {
  if (selectedTopics.length === 0) {
    return [];
  }

  // Get specialties from topics for category matching
  const specialties = getSpecialtiesFromTopics(selectedTopics);

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
  } catch {
    // If blog tables don't exist or query fails, return empty array
    return [];
  }
}
