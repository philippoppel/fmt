// Content types for search results
export type ContentType = "all" | "therapists" | "blogs";

// Specialization areas
export type Specialty =
  | "depression"
  | "anxiety"
  | "trauma"
  | "relationships"
  | "addiction"
  | "eating_disorders"
  | "adhd"
  | "burnout";

// Therapy approaches
export type TherapyType =
  | "cbt" // Verhaltenstherapie
  | "psychoanalysis"
  | "systemic"
  | "gestalt"
  | "humanistic";

// Languages offered
export type Language = "de" | "en" | "tr" | "ar";

// Session delivery methods
export type SessionType = "online" | "in_person" | "both";

// Insurance types
export type Insurance = "public" | "private";

// Availability options
export type Availability = "immediately" | "this_week" | "flexible";

// Gender options
export type Gender = "male" | "female" | "diverse";

// Therapist profile
export interface Therapist {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  specializations: Specialty[];
  therapyTypes: TherapyType[];
  languages: Language[];
  location: {
    city: string;
    postalCode: string;
  };
  pricePerSession: number;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  sessionType: SessionType;
  insurance: Insurance[];
  availability: Availability;
  gender: Gender;
}

// Blog post from a therapist
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  excerpt: string;
  author: {
    id: string;
    name: string;
    imageUrl: string;
  };
  category: Specialty;
  tags: string[];
  readingTimeMinutes: number;
  publishedAt: string;
}

// Union type for search results
export type SearchResult =
  | { type: "therapist"; data: Therapist }
  | { type: "blog"; data: BlogPost };

// Filter state for the search page
export interface FilterState {
  contentType: ContentType;
  searchQuery: string;
  location: string;
  specialties: Specialty[];
  therapyTypes: TherapyType[];
  languages: Language[];
  priceRange: { min: number; max: number };
  sessionType: SessionType | null;
  insurance: Insurance[];
  availability: Availability | null;
  gender: Gender | null;
  minRating: number;
}

// Default filter values
export const defaultFilters: FilterState = {
  contentType: "all",
  searchQuery: "",
  location: "",
  specialties: [],
  therapyTypes: [],
  languages: [],
  priceRange: { min: 0, max: 300 },
  sessionType: null,
  insurance: [],
  availability: null,
  gender: null,
  minRating: 0,
};

// Constants for filter options
export const SPECIALTIES: Specialty[] = [
  "depression",
  "anxiety",
  "trauma",
  "relationships",
  "addiction",
  "eating_disorders",
  "adhd",
  "burnout",
];

export const THERAPY_TYPES: TherapyType[] = [
  "cbt",
  "psychoanalysis",
  "systemic",
  "gestalt",
  "humanistic",
];

export const LANGUAGES: Language[] = ["de", "en", "tr", "ar"];

export const SESSION_TYPES: SessionType[] = ["online", "in_person", "both"];

export const INSURANCE_TYPES: Insurance[] = ["public", "private"];

export const AVAILABILITY_OPTIONS: Availability[] = [
  "immediately",
  "this_week",
  "flexible",
];

export const GENDER_OPTIONS: Gender[] = ["male", "female", "diverse"];
