/**
 * Test script for the matching algorithm
 * Run with: npx tsx scripts/test-matching-algorithm.ts
 */

import {
  calculateMatchScore,
  calculateMatchScoreWithBreakdown,
  calculateMatchScoreForAllWithBreakdown,
  applyHardExclusions,
} from "../src/lib/matching/score-calculator";
import type { Therapist, MatchingCriteria, TherapyStylePreferences } from "../src/types/therapist";

// Test therapists with varying profiles
const testTherapists: Therapist[] = [
  {
    id: "t1",
    slug: "premium-anxiety-expert",
    name: "Premium Anxiety Expert (15y)",
    title: "Dr.",
    imageUrl: "https://example.com/image.jpg",
    specializations: ["anxiety", "depression", "burnout"],
    therapyTypes: ["cbt"],
    languages: ["de", "en"],
    location: { city: "Berlin", postalCode: "10115" },
    pricePerSession: 120,
    rating: 4.8,
    reviewCount: 50,
    shortDescription: "Long description with more than 50 characters for quality bonus.",
    sessionType: "both",
    insurance: ["public", "private"],
    availability: "this_week",
    gender: "female",
    accountType: "premium",
    experienceYears: 15,
    isVerified: true,
    specializationRanks: { anxiety: 1, depression: 2, burnout: 3 },
    profileCompleteness: 95,
    communicationStyle: "empathetic",
    usesHomework: true,
    therapyFocus: "present",
    clientTalkRatio: 60,
    therapyDepth: "deep_change",
  },
  {
    id: "t2",
    slug: "junior-therapist",
    name: "Junior Therapist (2y)",
    title: "M.Sc.",
    imageUrl: "https://example.com/image.jpg",
    specializations: ["anxiety", "depression"],
    therapyTypes: ["cbt"],
    languages: ["de"],
    location: { city: "Berlin", postalCode: "10115" },
    pricePerSession: 90,
    rating: 4.5,
    reviewCount: 10,
    shortDescription: "Short desc that is longer than fifty characters to get the bonus.",
    sessionType: "online",
    insurance: ["public"],
    availability: "immediately",
    gender: "male",
    accountType: "mittel",
    experienceYears: 2,
    isVerified: true,
    specializationRanks: { anxiety: 1, depression: 2 },
    profileCompleteness: 70,
    communicationStyle: "directive",
    usesHomework: true,
    therapyFocus: "future",
    clientTalkRatio: 30,
    therapyDepth: "symptom_relief",
  },
  {
    id: "t3",
    slug: "gratis-account",
    name: "Gratis Account (no image, short desc)",
    title: "",
    imageUrl: "",
    specializations: ["depression"],
    therapyTypes: ["cbt"],
    languages: ["de"],
    location: { city: "Berlin", postalCode: "10115" },
    pricePerSession: 80,
    rating: 4.0,
    reviewCount: 3,
    shortDescription: "Short",
    sessionType: "in_person",
    insurance: ["public"],
    availability: "flexible",
    gender: "male",
    accountType: "gratis",
    experienceYears: 1,
    isVerified: false,
    specializationRanks: {},
    profileCompleteness: 30,
  },
  {
    id: "t4",
    slug: "arabic-speaker",
    name: "Arabic Speaker (8y)",
    title: "Dr.",
    imageUrl: "https://example.com/image.jpg",
    specializations: ["trauma", "depression"],
    therapyTypes: ["cbt", "gestalt"],
    languages: ["ar", "de"],
    location: { city: "Berlin", postalCode: "10115" },
    pricePerSession: 110,
    rating: 4.7,
    reviewCount: 25,
    shortDescription: "Specialized in trauma with Arabic language support, long desc.",
    sessionType: "both",
    insurance: ["public", "private"],
    availability: "immediately",
    gender: "male",
    accountType: "mittel",
    experienceYears: 8,
    isVerified: true,
    specializationRanks: { trauma: 1, depression: 2 },
    profileCompleteness: 80,
    communicationStyle: "empathetic",
    usesHomework: false,
    therapyFocus: "past",
    clientTalkRatio: 70,
    therapyDepth: "deep_change",
  },
  {
    id: "t5",
    slug: "online-only-expert",
    name: "Online Only Expert (10y)",
    title: "Dr.",
    imageUrl: "https://example.com/image.jpg",
    specializations: ["burnout", "anxiety"],
    therapyTypes: ["cbt"],
    languages: ["de", "en"],
    location: { city: "Munich", postalCode: "80331" },
    pricePerSession: 150,
    rating: 4.9,
    reviewCount: 60,
    shortDescription: "Online therapy specialist with 10 years experience, long desc.",
    sessionType: "online",
    insurance: ["private"],
    availability: "this_week",
    gender: "male",
    accountType: "premium",
    experienceYears: 10,
    isVerified: true,
    specializationRanks: { burnout: 1, anxiety: 2 },
    profileCompleteness: 100,
    communicationStyle: "directive",
    usesHomework: true,
    therapyFocus: "future",
    clientTalkRatio: 40,
    therapyDepth: "symptom_relief",
  },
];

function divider(title: string) {
  console.log("\n" + "=".repeat(60));
  console.log(title);
  console.log("=".repeat(60));
}

function test(name: string, passed: boolean, details?: string) {
  const status = passed ? "✓ PASS" : "✗ FAIL";
  console.log(`${status}: ${name}`);
  if (details) console.log(`       ${details}`);
}

// ============================================
// TEST 1: Hard Exclusions
// ============================================
divider("TEST 1: Hard Exclusions");

// Language exclusion
const langCriteria: MatchingCriteria = {
  selectedTopics: [],
  selectedSubTopics: [],
  location: "",
  gender: null,
  sessionType: null,
  insurance: [],
  requiredLanguages: ["ar"],
};

const t1Exclusion = applyHardExclusions(testTherapists[0], langCriteria);
test(
  "Language filter excludes non-Arabic speaker",
  t1Exclusion.excluded === true && t1Exclusion.reason === "language",
  `Expected excluded=true, got ${t1Exclusion.excluded}`
);

const t4Exclusion = applyHardExclusions(testTherapists[3], langCriteria);
test(
  "Language filter includes Arabic speaker",
  t4Exclusion.excluded === false,
  `Expected excluded=false, got ${t4Exclusion.excluded}`
);

// Session type exclusion
const sessionCriteria: MatchingCriteria = {
  selectedTopics: [],
  selectedSubTopics: [],
  location: "",
  gender: null,
  sessionType: "in_person",
  insurance: [],
};

const onlineOnlyExclusion = applyHardExclusions(testTherapists[4], sessionCriteria);
test(
  "Session type filter excludes online-only for in_person",
  onlineOnlyExclusion.excluded === true && onlineOnlyExclusion.reason === "session_type",
  `Expected excluded=true, got ${onlineOnlyExclusion.excluded}`
);

const bothTypesExclusion = applyHardExclusions(testTherapists[0], sessionCriteria);
test(
  "Session type filter includes 'both' for in_person",
  bothTypesExclusion.excluded === false,
  `Expected excluded=false, got ${bothTypesExclusion.excluded}`
);

// Verified only filter
const verifiedCriteria: MatchingCriteria = {
  selectedTopics: [],
  selectedSubTopics: [],
  location: "",
  gender: null,
  sessionType: null,
  insurance: [],
  verifiedOnly: true,
};

const unverifiedExclusion = applyHardExclusions(testTherapists[2], verifiedCriteria);
test(
  "Verified filter excludes unverified",
  unverifiedExclusion.excluded === true && unverifiedExclusion.reason === "unverified",
  `Expected excluded=true, got ${unverifiedExclusion.excluded}`
);

// ============================================
// TEST 2: Intensity ↔ Experience Matching
// ============================================
divider("TEST 2: Intensity ↔ Experience Matching");

const highIntensityCriteria: MatchingCriteria = {
  selectedTopics: ["anxiety"],
  selectedSubTopics: [],
  location: "",
  gender: null,
  sessionType: null,
  insurance: [],
  intensityLevel: "high",
};

const lowIntensityCriteria: MatchingCriteria = {
  selectedTopics: ["anxiety"],
  selectedSubTopics: [],
  location: "",
  gender: null,
  sessionType: null,
  insurance: [],
  intensityLevel: "low",
};

const expertScore = calculateMatchScore(testTherapists[0], highIntensityCriteria);
const juniorScore = calculateMatchScore(testTherapists[1], highIntensityCriteria);

test(
  "High intensity prefers experienced therapist (15y > 2y)",
  expertScore > juniorScore,
  `Expert: ${expertScore}, Junior: ${juniorScore}`
);

const expertLowInt = calculateMatchScore(testTherapists[0], lowIntensityCriteria);
const juniorLowInt = calculateMatchScore(testTherapists[1], lowIntensityCriteria);

// For low intensity, experience matters less, but other factors still apply
console.log(`  Low intensity - Expert: ${expertLowInt}, Junior: ${juniorLowInt}`);

// ============================================
// TEST 3: Specialization Ranking
// ============================================
divider("TEST 3: Specialization Ranking");

const anxietyCriteria: MatchingCriteria = {
  selectedTopics: ["anxiety"],
  selectedSubTopics: [],
  location: "",
  gender: null,
  sessionType: null,
  insurance: [],
};

const { breakdown: t1Breakdown } = calculateMatchScoreWithBreakdown(testTherapists[0], anxietyCriteria);
const { breakdown: t3Breakdown } = calculateMatchScoreWithBreakdown(testTherapists[2], anxietyCriteria);

test(
  "Rank 1 specialist scores higher on specialization than unranked",
  t1Breakdown.categories.specialization.score > t3Breakdown.categories.specialization.score,
  `Ranked: ${t1Breakdown.categories.specialization.score}/35, Unranked: ${t3Breakdown.categories.specialization.score}/35`
);

// ============================================
// TEST 4: Profile Quality Score
// ============================================
divider("TEST 4: Profile Quality Score");

const { breakdown: premiumBreakdown } = calculateMatchScoreWithBreakdown(testTherapists[0], anxietyCriteria);
const { breakdown: gratisBreakdown } = calculateMatchScoreWithBreakdown(testTherapists[2], anxietyCriteria);

test(
  "Premium verified profile scores higher quality than gratis unverified",
  (premiumBreakdown.categories.profileQuality?.score ?? 0) > (gratisBreakdown.categories.profileQuality?.score ?? 0),
  `Premium: ${premiumBreakdown.categories.profileQuality?.score}/10, Gratis: ${gratisBreakdown.categories.profileQuality?.score}/10`
);

console.log(`  Premium details: ${premiumBreakdown.categories.profileQuality?.details}`);
console.log(`  Gratis details: ${gratisBreakdown.categories.profileQuality?.details}`);

// ============================================
// TEST 5: Therapy Style Matching
// ============================================
divider("TEST 5: Therapy Style Matching");

const stylePreferences: TherapyStylePreferences = {
  communicationStyle: "empathetic",
  prefersHomework: true,
  therapyFocus: "present",
  talkPreference: "more_self",
  therapyDepth: "deep_change",
};

const styleCriteria: MatchingCriteria = {
  selectedTopics: ["anxiety"],
  selectedSubTopics: [],
  location: "",
  gender: null,
  sessionType: null,
  insurance: [],
  therapyStyle: stylePreferences,
};

const { breakdown: styleMatchBreakdown } = calculateMatchScoreWithBreakdown(testTherapists[0], styleCriteria);
const { breakdown: styleMismatchBreakdown } = calculateMatchScoreWithBreakdown(testTherapists[1], styleCriteria);

test(
  "Matching therapy style scores higher",
  styleMatchBreakdown.categories.therapyStyle.score > styleMismatchBreakdown.categories.therapyStyle.score,
  `Matched: ${styleMatchBreakdown.categories.therapyStyle.score}/20, Mismatched: ${styleMismatchBreakdown.categories.therapyStyle.score}/20`
);

// ============================================
// TEST 6: Full Matching with Exclusions
// ============================================
divider("TEST 6: Full Matching Pipeline");

const fullCriteria: MatchingCriteria = {
  selectedTopics: ["anxiety"],
  selectedSubTopics: [],
  location: "Berlin",
  gender: null,
  sessionType: "in_person", // User wants in-person only
  insurance: ["public"],
  intensityLevel: "high",
  therapyStyle: stylePreferences,
};

const results = calculateMatchScoreForAllWithBreakdown(testTherapists, fullCriteria);

console.log("\nFull matching results (sorted by score):");
results.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.name} - Score: ${r.matchScore}%`);
  if (r.scoreBreakdown) {
    console.log(`     Topics: ${r.scoreBreakdown.categories.specialization.score}/${r.scoreBreakdown.categories.specialization.maxScore}`);
    console.log(`     Intensity: ${r.scoreBreakdown.categories.intensityExperience?.score}/${r.scoreBreakdown.categories.intensityExperience?.maxScore}`);
    console.log(`     Style: ${r.scoreBreakdown.categories.therapyStyle.score}/${r.scoreBreakdown.categories.therapyStyle.maxScore}`);
    console.log(`     Criteria: ${r.scoreBreakdown.categories.practicalCriteria.score}/${r.scoreBreakdown.categories.practicalCriteria.maxScore}`);
    console.log(`     Quality: ${r.scoreBreakdown.categories.profileQuality?.score}/${r.scoreBreakdown.categories.profileQuality?.maxScore}`);
  }
});

test(
  "Online-only therapist excluded for 'in_person' session type preference",
  !results.some(r => r.id === "t5"),
  `Expected t5 (Online Only) to be excluded`
);

test(
  "Results are sorted by score descending",
  results.length > 1 && results[0].matchScore >= results[results.length - 1].matchScore,
  `First: ${results[0]?.matchScore}, Last: ${results[results.length - 1]?.matchScore}`
);

// ============================================
// TEST 7: Arabic Language Required
// ============================================
divider("TEST 7: Arabic Language Filter");

const arabicCriteria: MatchingCriteria = {
  selectedTopics: ["trauma"],
  selectedSubTopics: [],
  location: "",
  gender: null,
  sessionType: null,
  insurance: [],
  requiredLanguages: ["ar"],
};

const arabicResults = calculateMatchScoreForAllWithBreakdown(testTherapists, arabicCriteria);

console.log(`\nArabic-required results: ${arabicResults.length} therapists`);
arabicResults.forEach(r => console.log(`  - ${r.name}: ${r.matchScore}%`));

test(
  "Only Arabic speakers included when Arabic required",
  arabicResults.length === 1 && arabicResults[0].id === "t4",
  `Expected only t4, got ${arabicResults.map(r => r.id).join(", ")}`
);

// ============================================
// SUMMARY
// ============================================
divider("TEST SUMMARY");
console.log("\nAll algorithm components tested:");
console.log("  ✓ Hard exclusions (language, session type, verified)");
console.log("  ✓ Intensity ↔ Experience matching");
console.log("  ✓ Specialization ranking");
console.log("  ✓ Profile quality scoring");
console.log("  ✓ Therapy style matching");
console.log("  ✓ Full pipeline integration");
console.log("\nWeights used:");
console.log("  - Topics: 35 points");
console.log("  - Intensity/Experience: 15 points");
console.log("  - Criteria: 20 points");
console.log("  - Therapy Style: 20 points");
console.log("  - Profile Quality: 10 points");
console.log("  TOTAL: 100 points\n");
