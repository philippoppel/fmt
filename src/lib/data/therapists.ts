import { db } from "@/lib/db";
import type { FilterState, Therapist } from "@/types/therapist";
import { Prisma } from "@prisma/client";

export async function getTherapists(filters: FilterState): Promise<Therapist[]> {
  const where: Prisma.TherapistProfileWhereInput = {
    isPublished: true,
  };

  // Location filter
  if (filters.location && filters.location.trim() !== "") {
    where.OR = [
      { city: { contains: filters.location, mode: "insensitive" } },
      { postalCode: { contains: filters.location } },
    ];
  }

  // Specialties filter
  if (filters.specialties.length > 0) {
    where.specializations = { hasSome: filters.specialties };
  }

  // Therapy types filter
  if (filters.therapyTypes.length > 0) {
    where.therapyTypes = { hasSome: filters.therapyTypes };
  }

  // Therapy settings filter
  if (filters.therapySettings.length > 0) {
    where.therapySettings = { hasSome: filters.therapySettings };
  }

  // Languages filter
  if (filters.languages.length > 0) {
    where.languages = { hasSome: filters.languages };
  }

  // Price range filter
  where.pricePerSession = {
    gte: filters.priceRange.min,
    lte: filters.priceRange.max,
  };

  // Session type filter
  if (filters.sessionType) {
    if (filters.sessionType === "both") {
      where.sessionType = "both";
    } else {
      where.sessionType = { in: [filters.sessionType, "both"] };
    }
  }

  // Insurance filter
  if (filters.insurance.length > 0) {
    where.insurance = { hasSome: filters.insurance };
  }

  // Availability filter
  if (filters.availability) {
    where.availability = filters.availability;
  }

  // Gender filter
  if (filters.gender) {
    where.gender = filters.gender;
  }

  // Rating filter
  if (filters.minRating > 0) {
    where.rating = { gte: filters.minRating };
  }

  const profiles = await db.therapistProfile.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { rating: "desc" },
      { reviewCount: "desc" },
    ],
  });

  // Transform to Therapist type
  return profiles.map((p) => ({
    id: p.id,
    slug: p.slug || "",
    name: p.user.name || "Unknown",
    title: p.title || "",
    imageUrl: p.imageUrl || "/placeholder-avatar.png",
    specializations: p.specializations as Therapist["specializations"],
    therapyTypes: p.therapyTypes as Therapist["therapyTypes"],
    languages: p.languages as Therapist["languages"],
    location: {
      city: p.city || "",
      postalCode: p.postalCode || "",
    },
    pricePerSession: p.pricePerSession || 0,
    rating: p.rating,
    reviewCount: p.reviewCount,
    shortDescription: p.shortDescription || "",
    sessionType: p.sessionType as Therapist["sessionType"],
    insurance: p.insurance as Therapist["insurance"],
    availability: p.availability as Therapist["availability"],
    gender: p.gender as Therapist["gender"],
  }));
}

export async function searchTherapists(
  query: string,
  filters: FilterState
): Promise<Therapist[]> {
  // Get filtered results from DB
  const therapists = await getTherapists(filters);

  // If no text query, return all filtered results
  if (!query || query.trim() === "") {
    return therapists;
  }

  // Client-side text search filtering
  const lowerQuery = query.toLowerCase();

  return therapists.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.shortDescription.toLowerCase().includes(lowerQuery) ||
      t.title.toLowerCase().includes(lowerQuery)
  );
}
