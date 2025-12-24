import type { Specialty, TherapyType, TherapySetting, Language, SessionType, Insurance, Availability, Gender, CommunicationStyle, TherapyFocus, TherapyDepth, AccountType } from "./therapist";

// Extended therapist profile for personal website pages
export interface TherapistProfileData {
  id: string;
  slug: string;
  userId: string;

  // Basic Info
  name: string;
  title: string;
  imageUrl: string;
  headline: string;
  shortDescription: string;
  longDescription: string;

  // Location
  city: string;
  postalCode: string;
  street: string;
  practiceName: string;

  // Professional Details
  specializations: Specialty[];
  specializationRanks: Record<string, number>;
  specializationIcons: Record<string, string>;
  therapyTypes: TherapyType[];
  therapySettings: TherapySetting[];
  languages: Language[];
  insurance: Insurance[];

  // Qualifications
  education: string[];
  certifications: string[];
  memberships: string[];
  experienceYears: number;

  // Pricing & Availability
  pricePerSession: number;
  sessionType: SessionType;
  availability: Availability;
  gender: Gender;
  workingHours: WorkingHours | null;

  // Ratings
  rating: number;
  reviewCount: number;

  // Images
  galleryImages: string[];
  officeImages: string[];
  heroCoverImageUrl: string;

  // Contact
  phone: string;
  email: string;
  website: string;
  linkedIn: string;
  instagram: string;

  // Theme
  themeColor: string;
  themeName: ThemeName;

  // Additional Info
  consultationInfo: string;
  firstSessionInfo: string;
  videoIntroUrl: string;
  offersTrialSession: boolean;
  trialSessionPrice: number;

  // Account & Verification
  accountType: AccountType;
  isVerified: boolean;

  // Therapy Style
  communicationStyle: CommunicationStyle;
  usesHomework: boolean;
  therapyFocus: TherapyFocus;
  clientTalkRatio: number;
  therapyDepth: TherapyDepth;
}

export interface WorkingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  from: string; // "09:00"
  to: string;   // "18:00"
  closed?: boolean;
}

export type ThemeName = "warm" | "cool" | "nature" | "professional" | "minimal";

// Theme color presets - Modern & Vibrant
export const THEME_PRESETS: Record<ThemeName, ThemePreset> = {
  warm: {
    name: "warm",
    label: "Warm & Einladend",
    primaryColor: "#F97316",     // Vibrant orange
    secondaryColor: "#FFF7ED",   // Warm cream
    accentColor: "#FB923C",      // Light orange
    backgroundColor: "#FFFBF5",  // Warm white
    textColor: "#1C1917",        // Rich warm black
    gradientFrom: "#F97316",
    gradientTo: "#EA580C",
  },
  cool: {
    name: "cool",
    label: "Ruhig & Professionell",
    primaryColor: "#3B82F6",     // Brilliant blue
    secondaryColor: "#EFF6FF",   // Light blue tint
    accentColor: "#60A5FA",      // Sky blue
    backgroundColor: "#F8FAFC",  // Clean white
    textColor: "#0F172A",        // Deep navy
    gradientFrom: "#3B82F6",
    gradientTo: "#1D4ED8",
  },
  nature: {
    name: "nature",
    label: "Natürlich & Beruhigend",
    primaryColor: "#10B981",     // Vibrant emerald
    secondaryColor: "#ECFDF5",   // Mint white
    accentColor: "#34D399",      // Bright teal
    backgroundColor: "#F0FDF4",  // Fresh green-white
    textColor: "#064E3B",        // Deep forest
    gradientFrom: "#10B981",
    gradientTo: "#059669",
  },
  professional: {
    name: "professional",
    label: "Modern & Klar",
    primaryColor: "#8B5CF6",     // Vibrant violet
    secondaryColor: "#F5F3FF",   // Light violet
    accentColor: "#A78BFA",      // Soft purple
    backgroundColor: "#FAFAF9",  // Neutral white
    textColor: "#18181B",        // Rich black
    gradientFrom: "#8B5CF6",
    gradientTo: "#7C3AED",
  },
  minimal: {
    name: "minimal",
    label: "Minimalistisch",
    primaryColor: "#18181B",     // Rich black
    secondaryColor: "#F4F4F5",   // Zinc-50
    accentColor: "#EC4899",      // Vibrant pink accent
    backgroundColor: "#FFFFFF",  // Pure white
    textColor: "#09090B",        // Near-pure black
    gradientFrom: "#18181B",
    gradientTo: "#EC4899",       // Black to pink gradient
  },
};

export interface ThemePreset {
  name: ThemeName;
  label: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  // Gradient colors for modern effects
  gradientFrom: string;
  gradientTo: string;
}

// Default profile data for new/empty profiles
export const DEFAULT_PROFILE_DATA: Partial<TherapistProfileData> = {
  headline: "",
  shortDescription: "",
  longDescription: "",
  education: [],
  certifications: [],
  memberships: [],
  galleryImages: [],
  officeImages: [],
  phone: "",
  email: "",
  website: "",
  linkedIn: "",
  instagram: "",
  themeColor: "#F97316",
  themeName: "warm",
  consultationInfo: "",
  workingHours: null,
};
