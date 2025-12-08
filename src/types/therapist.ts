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

// ============================================
// THERAPY STYLE TYPES (for Matching)
// ============================================

// Communication style preference
export type CommunicationStyle = "directive" | "empathetic" | "balanced";

// Therapy focus (time orientation)
export type TherapyFocus = "past" | "present" | "future" | "holistic";

// Therapy depth preference
export type TherapyDepth = "symptom_relief" | "deep_change" | "flexible";

// User's therapy style preferences (from Quiz)
export interface TherapyStylePreferences {
  communicationStyle: CommunicationStyle | null;
  prefersHomework: boolean | null;
  therapyFocus: TherapyFocus | null;
  talkPreference: "more_self" | "guided" | null;
  therapyDepth: TherapyDepth | null;
}

// Default values for therapy style preferences
export const defaultTherapyStylePreferences: TherapyStylePreferences = {
  communicationStyle: null,
  prefersHomework: null,
  therapyFocus: null,
  talkPreference: null,
  therapyDepth: null,
};

// Score breakdown for transparent matching
export interface ScoreCategory {
  score: number;
  maxScore: number;
  label: string;
  details?: string;
}

export interface ScoreBreakdown {
  total: number;
  categories: {
    specialization: ScoreCategory;
    therapyStyle: ScoreCategory;
    practicalCriteria: ScoreCategory;
  };
  matchReasons: string[];
}

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
  // Therapy Style fields (for Matching)
  communicationStyle?: CommunicationStyle;
  usesHomework?: boolean;
  therapyFocus?: TherapyFocus;
  clientTalkRatio?: number; // 0-100
  therapyDepth?: TherapyDepth;
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
  | { type: "therapist"; data: Therapist; matchScore?: number }
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

// Matching-specific types
export interface MatchingCriteria {
  selectedTopics: string[];
  selectedSubTopics: string[];
  location: string;
  gender: Gender | null;
  sessionType: SessionType | null;
  insurance: Insurance[];
  // Therapy Style preferences from Quiz
  therapyStyle?: TherapyStylePreferences;
}

export interface MatchedTherapist extends Therapist {
  matchScore: number;
  scoreBreakdown?: ScoreBreakdown;
}

export interface MatchingResult {
  therapists: MatchedTherapist[];
  blogs: BlogPost[];
  criteria: MatchingCriteria;
}

// Constants for Therapy Style options (for UI)
export const COMMUNICATION_STYLES: CommunicationStyle[] = [
  "directive",
  "empathetic",
  "balanced",
];

export const THERAPY_FOCUSES: TherapyFocus[] = [
  "past",
  "present",
  "future",
  "holistic",
];

export const THERAPY_DEPTHS: TherapyDepth[] = [
  "symptom_relief",
  "deep_change",
  "flexible",
];
