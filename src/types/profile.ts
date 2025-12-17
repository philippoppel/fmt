import type { Specialty, TherapyType, Language, SessionType, Insurance, Availability, Gender, CommunicationStyle, TherapyFocus, TherapyDepth, AccountType } from "./therapist";

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
  therapyTypes: TherapyType[];
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

// Theme color presets
export const THEME_PRESETS: Record<ThemeName, ThemePreset> = {
  warm: {
    name: "warm",
    label: "Warm & Einladend",
    primaryColor: "#8B7355",
    secondaryColor: "#D4C4B0",
    accentColor: "#C9A86C",
    backgroundColor: "#FAF8F5",
    textColor: "#3D3D3D",
  },
  cool: {
    name: "cool",
    label: "Ruhig & Professionell",
    primaryColor: "#5B7B8C",
    secondaryColor: "#B8CAD4",
    accentColor: "#7BA3B8",
    backgroundColor: "#F5F8FA",
    textColor: "#2D3748",
  },
  nature: {
    name: "nature",
    label: "Natürlich & Beruhigend",
    primaryColor: "#6B8E5A",
    secondaryColor: "#C5D6BC",
    accentColor: "#8FB573",
    backgroundColor: "#F5F8F3",
    textColor: "#2D3B2D",
  },
  professional: {
    name: "professional",
    label: "Modern & Klar",
    primaryColor: "#4A5568",
    secondaryColor: "#CBD5E0",
    accentColor: "#667EEA",
    backgroundColor: "#F7FAFC",
    textColor: "#1A202C",
  },
  minimal: {
    name: "minimal",
    label: "Minimalistisch",
    primaryColor: "#1A1A1A",
    secondaryColor: "#E5E5E5",
    accentColor: "#666666",
    backgroundColor: "#FFFFFF",
    textColor: "#1A1A1A",
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
  themeColor: "#8B7355",
  themeName: "warm",
  consultationInfo: "",
  workingHours: null,
};
