"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { SessionType, Insurance, Gender, Language } from "@/types/therapist";
import {
  type SeverityLevel,
  type WizardCategory,
  type WizardSubcategory,
  getCategoryById,
  getSubcategoryById,
  getSubcategoriesForCategory,
  isCrisisCategory,
  shouldShowFullQuestions,
  calculateSeverityScore,
} from "@/lib/matching/wizard-categories";

// ============================================================================
// TYPES
// ============================================================================

export type WizardStepV2 = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Style preferences
export type StyleStructure = "structured" | "open" | "mixed" | "unsure" | null;
export type StyleEngagement = "active" | "receptive" | "situational" | "unsure" | null;

// Therapy goal (P2 from evidence-based spec)
export type TherapyGoal = "symptom_relief" | "deep_understanding" | "both" | null;

// Time orientation (P3 from evidence-based spec)
export type TimeOrientation = "present" | "past" | "holistic" | null;

// Optional preferences (Step 4b)
export type RelationshipVsMethod = "relationship" | "method" | "both" | null;
export type Tempo = "fast" | "slow" | "flexible" | null;
export type SafetyVsChallenge = "safety" | "challenge" | "balanced" | null;

// Symptom answers
export interface SymptomAnswers {
  q1: SeverityLevel | null;
  q2: SeverityLevel | null;
  q3: SeverityLevel | null;
  q4: SeverityLevel | null;
}

// Match reason for results
export interface MatchReason {
  type: "topic" | "style" | "availability" | "experience" | "logistics" | "general";
  textDE: string;
  priority: number;
}

// Matched therapist result
export interface MatchedTherapistV2 {
  id: string;
  slug: string | null;
  name: string;
  imageUrl: string | null;
  shortDescription: string | null;
  city: string | null;
  sessionType: SessionType;
  totalScore: number;
  topicFitScore: number;
  styleFitScore: number;
  matchReasons: MatchReason[];
}

// Location/radius types
export type SearchRadius = 10 | 25 | 50 | 100 | null;

// Main wizard state
export interface WizardStateV2 {
  // Current position
  currentStep: WizardStepV2;

  // Step 0: Disclaimer
  disclaimerAccepted: boolean;

  // Step 1: Category selection
  selectedCategoryId: string | null;

  // Step 2: Subcategory selection
  selectedSubcategoryId: string | null;

  // Step 3: Adaptive symptoms
  symptomAnswers: SymptomAnswers;
  severityScore: number;
  adaptiveMode: "short" | "full" | null;

  // Step 4: Quick preferences
  styleStructure: StyleStructure;
  styleEngagement: StyleEngagement;

  // Step 4a: Core preferences (evidence-based P2, P3)
  therapyGoal: TherapyGoal;
  timeOrientation: TimeOrientation;

  // Step 4b: Optional preferences
  showOptionalPreferences: boolean;
  relationshipVsMethod: RelationshipVsMethod;
  tempo: Tempo;
  safetyVsChallenge: SafetyVsChallenge;

  // Step 5: Logistics
  sessionType: SessionType | null;
  insurance: Insurance | null;

  // Step 5b: Additional preferences
  genderPreference: Gender | null; // Preferred therapist gender
  location: string | null; // PLZ or city name
  searchRadius: SearchRadius; // km radius for in-person
  languages: Language[]; // Required languages (empty = German only)

  // Step 6: Results
  topMatches: MatchedTherapistV2[];
  isLoadingResults: boolean;

  // Crisis handling
  crisisDetected: boolean;
  crisisAcknowledged: boolean;

  // Negative therapy experience (evidence-based)
  hadNegativeExperience: boolean;
}

// ============================================================================
// ACTIONS
// ============================================================================

type WizardActionV2 =
  // Navigation
  | { type: "SET_STEP"; step: WizardStepV2 }
  | { type: "GO_NEXT" }
  | { type: "GO_BACK" }
  // Step 0
  | { type: "ACCEPT_DISCLAIMER" }
  // Step 1
  | { type: "SELECT_CATEGORY"; categoryId: string }
  // Step 2
  | { type: "SELECT_SUBCATEGORY"; subcategoryId: string }
  // Step 3
  | { type: "ANSWER_SYMPTOM"; questionOrder: 1 | 2 | 3 | 4; value: SeverityLevel }
  | { type: "CLEAR_SYMPTOM_ANSWERS" }
  // Step 4
  | { type: "SET_STYLE_STRUCTURE"; value: StyleStructure }
  | { type: "SET_STYLE_ENGAGEMENT"; value: StyleEngagement }
  | { type: "SET_THERAPY_GOAL"; value: TherapyGoal }
  | { type: "SET_TIME_ORIENTATION"; value: TimeOrientation }
  | { type: "TOGGLE_OPTIONAL_PREFERENCES" }
  // Step 4b
  | { type: "SET_RELATIONSHIP_VS_METHOD"; value: RelationshipVsMethod }
  | { type: "SET_TEMPO"; value: Tempo }
  | { type: "SET_SAFETY_VS_CHALLENGE"; value: SafetyVsChallenge }
  // Step 5
  | { type: "SET_SESSION_TYPE"; value: SessionType | null }
  | { type: "SET_INSURANCE"; value: Insurance | null }
  // Step 5b: Additional preferences
  | { type: "SET_GENDER_PREFERENCE"; value: Gender | null }
  | { type: "SET_LOCATION"; value: string | null }
  | { type: "SET_SEARCH_RADIUS"; value: SearchRadius }
  | { type: "SET_LANGUAGES"; value: Language[] }
  | { type: "ADD_LANGUAGE"; value: Language }
  | { type: "REMOVE_LANGUAGE"; value: Language }
  // Step 6
  | { type: "SET_RESULTS"; matches: MatchedTherapistV2[] }
  | { type: "SET_LOADING"; isLoading: boolean }
  // Crisis
  | { type: "TRIGGER_CRISIS" }
  | { type: "ACKNOWLEDGE_CRISIS" }
  // Negative experience
  | { type: "SET_NEGATIVE_EXPERIENCE"; value: boolean }
  // Reset
  | { type: "RESET" };

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: WizardStateV2 = {
  currentStep: 0,
  disclaimerAccepted: false,
  selectedCategoryId: null,
  selectedSubcategoryId: null,
  symptomAnswers: { q1: null, q2: null, q3: null, q4: null },
  severityScore: 0,
  adaptiveMode: null,
  styleStructure: null,
  styleEngagement: null,
  therapyGoal: null,
  timeOrientation: null,
  showOptionalPreferences: false,
  relationshipVsMethod: null,
  tempo: null,
  safetyVsChallenge: null,
  sessionType: null,
  insurance: null,
  genderPreference: null,
  location: null,
  searchRadius: 25, // Default 25km radius
  languages: [], // Empty = German only (implicit)
  topMatches: [],
  isLoadingResults: false,
  crisisDetected: false,
  crisisAcknowledged: false,
  hadNegativeExperience: false,
};

// ============================================================================
// REDUCER
// ============================================================================

function wizardReducer(
  state: WizardStateV2,
  action: WizardActionV2
): WizardStateV2 {
  switch (action.type) {
    // Navigation
    case "SET_STEP":
      return { ...state, currentStep: action.step };

    case "GO_NEXT": {
      const stepOrder: WizardStepV2[] = [0, 1, 2, 3, 4, 5, 6];
      const currentIndex = stepOrder.indexOf(state.currentStep);
      if (currentIndex < stepOrder.length - 1) {
        return { ...state, currentStep: stepOrder[currentIndex + 1] };
      }
      return state;
    }

    case "GO_BACK": {
      const stepOrder: WizardStepV2[] = [0, 1, 2, 3, 4, 5, 6];
      const currentIndex = stepOrder.indexOf(state.currentStep);
      if (currentIndex > 0) {
        return { ...state, currentStep: stepOrder[currentIndex - 1] };
      }
      return state;
    }

    // Step 0
    case "ACCEPT_DISCLAIMER":
      return {
        ...state,
        disclaimerAccepted: true,
        currentStep: 1,
      };

    // Step 1
    case "SELECT_CATEGORY": {
      // Check if this is a crisis category
      if (isCrisisCategory(action.categoryId)) {
        return {
          ...state,
          selectedCategoryId: action.categoryId,
          crisisDetected: true,
        };
      }
      return {
        ...state,
        selectedCategoryId: action.categoryId,
        // Reset downstream selections when category changes
        selectedSubcategoryId: null,
        symptomAnswers: { q1: null, q2: null, q3: null, q4: null },
        severityScore: 0,
        adaptiveMode: null,
      };
    }

    // Step 2
    case "SELECT_SUBCATEGORY":
      return {
        ...state,
        selectedSubcategoryId: action.subcategoryId,
        // Reset symptom answers when subcategory changes
        symptomAnswers: { q1: null, q2: null, q3: null, q4: null },
        severityScore: 0,
        adaptiveMode: null,
      };

    // Step 3
    case "ANSWER_SYMPTOM": {
      const key = `q${action.questionOrder}` as keyof SymptomAnswers;
      const newAnswers = {
        ...state.symptomAnswers,
        [key]: action.value,
      };

      // Determine adaptive mode based on Q1 answer
      let adaptiveMode = state.adaptiveMode;
      if (action.questionOrder === 1) {
        adaptiveMode = shouldShowFullQuestions(action.value) ? "full" : "short";
        // If switching to short mode, clear Q2 and Q3
        if (adaptiveMode === "short") {
          newAnswers.q2 = null;
          newAnswers.q3 = null;
        }
      }

      // Calculate severity score
      const severityScore = calculateSeverityScore(newAnswers);

      return {
        ...state,
        symptomAnswers: newAnswers,
        severityScore,
        adaptiveMode,
      };
    }

    case "CLEAR_SYMPTOM_ANSWERS":
      return {
        ...state,
        symptomAnswers: { q1: null, q2: null, q3: null, q4: null },
        severityScore: 0,
        adaptiveMode: null,
      };

    // Step 4
    case "SET_STYLE_STRUCTURE":
      return { ...state, styleStructure: action.value };

    case "SET_STYLE_ENGAGEMENT":
      return { ...state, styleEngagement: action.value };

    case "SET_THERAPY_GOAL":
      return { ...state, therapyGoal: action.value };

    case "SET_TIME_ORIENTATION":
      return { ...state, timeOrientation: action.value };

    case "TOGGLE_OPTIONAL_PREFERENCES":
      return { ...state, showOptionalPreferences: !state.showOptionalPreferences };

    // Step 4b
    case "SET_RELATIONSHIP_VS_METHOD":
      return { ...state, relationshipVsMethod: action.value };

    case "SET_TEMPO":
      return { ...state, tempo: action.value };

    case "SET_SAFETY_VS_CHALLENGE":
      return { ...state, safetyVsChallenge: action.value };

    // Step 5
    case "SET_SESSION_TYPE":
      // When switching away from in_person, clear location
      if (action.value === "online") {
        return { ...state, sessionType: action.value, location: null, searchRadius: null };
      }
      return { ...state, sessionType: action.value };

    case "SET_INSURANCE":
      return { ...state, insurance: action.value };

    // Step 5b: Additional preferences
    case "SET_GENDER_PREFERENCE":
      return { ...state, genderPreference: action.value };

    case "SET_LOCATION":
      return { ...state, location: action.value };

    case "SET_SEARCH_RADIUS":
      return { ...state, searchRadius: action.value };

    case "SET_LANGUAGES":
      return { ...state, languages: action.value };

    case "ADD_LANGUAGE":
      if (state.languages.includes(action.value)) return state;
      return { ...state, languages: [...state.languages, action.value] };

    case "REMOVE_LANGUAGE":
      return { ...state, languages: state.languages.filter((l) => l !== action.value) };

    // Step 6
    case "SET_RESULTS":
      return {
        ...state,
        topMatches: action.matches,
        isLoadingResults: false,
      };

    case "SET_LOADING":
      return { ...state, isLoadingResults: action.isLoading };

    // Crisis
    case "TRIGGER_CRISIS":
      return { ...state, crisisDetected: true };

    case "ACKNOWLEDGE_CRISIS":
      return {
        ...state,
        crisisAcknowledged: true,
        // Reset category selection after crisis acknowledgement
        selectedCategoryId: null,
        crisisDetected: false,
      };

    // Negative experience
    case "SET_NEGATIVE_EXPERIENCE":
      return { ...state, hadNegativeExperience: action.value };

    // Reset
    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface WizardContextValue {
  state: WizardStateV2;
  actions: {
    // Navigation
    setStep: (step: WizardStepV2) => void;
    goNext: () => void;
    goBack: () => void;
    // Step 0
    acceptDisclaimer: () => void;
    // Step 1
    selectCategory: (categoryId: string) => void;
    // Step 2
    selectSubcategory: (subcategoryId: string) => void;
    // Step 3
    answerSymptom: (questionOrder: 1 | 2 | 3 | 4, value: SeverityLevel) => void;
    clearSymptomAnswers: () => void;
    // Step 4
    setStyleStructure: (value: StyleStructure) => void;
    setStyleEngagement: (value: StyleEngagement) => void;
    setTherapyGoal: (value: TherapyGoal) => void;
    setTimeOrientation: (value: TimeOrientation) => void;
    toggleOptionalPreferences: () => void;
    // Step 4b
    setRelationshipVsMethod: (value: RelationshipVsMethod) => void;
    setTempo: (value: Tempo) => void;
    setSafetyVsChallenge: (value: SafetyVsChallenge) => void;
    // Step 5
    setSessionType: (value: SessionType | null) => void;
    setInsurance: (value: Insurance | null) => void;
    // Step 5b: Additional preferences
    setGenderPreference: (value: Gender | null) => void;
    setLocation: (value: string | null) => void;
    setSearchRadius: (value: SearchRadius) => void;
    setLanguages: (value: Language[]) => void;
    addLanguage: (value: Language) => void;
    removeLanguage: (value: Language) => void;
    // Step 6
    setResults: (matches: MatchedTherapistV2[]) => void;
    setLoading: (isLoading: boolean) => void;
    // Crisis
    triggerCrisis: () => void;
    acknowledgeCrisis: () => void;
    // Negative experience
    setNegativeExperience: (value: boolean) => void;
    // Reset
    reset: () => void;
  };
  computed: {
    canProceed: boolean;
    progress: number;
    selectedCategory: WizardCategory | undefined;
    selectedSubcategory: WizardSubcategory | undefined;
    availableSubcategories: WizardSubcategory[];
    questionsToShow: (1 | 2 | 3 | 4)[];
    stepLabel: string;
  };
}

const WizardContext = createContext<WizardContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface WizardProviderProps {
  children: ReactNode;
}

export function WizardV2Provider({ children }: WizardProviderProps) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  // Actions
  const setStep = useCallback((step: WizardStepV2) => {
    dispatch({ type: "SET_STEP", step });
  }, []);

  const goNext = useCallback(() => {
    dispatch({ type: "GO_NEXT" });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: "GO_BACK" });
  }, []);

  const acceptDisclaimer = useCallback(() => {
    dispatch({ type: "ACCEPT_DISCLAIMER" });
  }, []);

  const selectCategory = useCallback((categoryId: string) => {
    dispatch({ type: "SELECT_CATEGORY", categoryId });
  }, []);

  const selectSubcategory = useCallback((subcategoryId: string) => {
    dispatch({ type: "SELECT_SUBCATEGORY", subcategoryId });
  }, []);

  const answerSymptom = useCallback(
    (questionOrder: 1 | 2 | 3 | 4, value: SeverityLevel) => {
      dispatch({ type: "ANSWER_SYMPTOM", questionOrder, value });
    },
    []
  );

  const clearSymptomAnswers = useCallback(() => {
    dispatch({ type: "CLEAR_SYMPTOM_ANSWERS" });
  }, []);

  const setStyleStructure = useCallback((value: StyleStructure) => {
    dispatch({ type: "SET_STYLE_STRUCTURE", value });
  }, []);

  const setStyleEngagement = useCallback((value: StyleEngagement) => {
    dispatch({ type: "SET_STYLE_ENGAGEMENT", value });
  }, []);

  const setTherapyGoal = useCallback((value: TherapyGoal) => {
    dispatch({ type: "SET_THERAPY_GOAL", value });
  }, []);

  const setTimeOrientation = useCallback((value: TimeOrientation) => {
    dispatch({ type: "SET_TIME_ORIENTATION", value });
  }, []);

  const toggleOptionalPreferences = useCallback(() => {
    dispatch({ type: "TOGGLE_OPTIONAL_PREFERENCES" });
  }, []);

  const setRelationshipVsMethod = useCallback((value: RelationshipVsMethod) => {
    dispatch({ type: "SET_RELATIONSHIP_VS_METHOD", value });
  }, []);

  const setTempo = useCallback((value: Tempo) => {
    dispatch({ type: "SET_TEMPO", value });
  }, []);

  const setSafetyVsChallenge = useCallback((value: SafetyVsChallenge) => {
    dispatch({ type: "SET_SAFETY_VS_CHALLENGE", value });
  }, []);

  const setSessionType = useCallback((value: SessionType | null) => {
    dispatch({ type: "SET_SESSION_TYPE", value });
  }, []);

  const setInsurance = useCallback((value: Insurance | null) => {
    dispatch({ type: "SET_INSURANCE", value });
  }, []);

  // Step 5b: Additional preferences
  const setGenderPreference = useCallback((value: Gender | null) => {
    dispatch({ type: "SET_GENDER_PREFERENCE", value });
  }, []);

  const setLocation = useCallback((value: string | null) => {
    dispatch({ type: "SET_LOCATION", value });
  }, []);

  const setSearchRadius = useCallback((value: SearchRadius) => {
    dispatch({ type: "SET_SEARCH_RADIUS", value });
  }, []);

  const setLanguages = useCallback((value: Language[]) => {
    dispatch({ type: "SET_LANGUAGES", value });
  }, []);

  const addLanguage = useCallback((value: Language) => {
    dispatch({ type: "ADD_LANGUAGE", value });
  }, []);

  const removeLanguage = useCallback((value: Language) => {
    dispatch({ type: "REMOVE_LANGUAGE", value });
  }, []);

  const setResults = useCallback((matches: MatchedTherapistV2[]) => {
    dispatch({ type: "SET_RESULTS", matches });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: "SET_LOADING", isLoading });
  }, []);

  const triggerCrisis = useCallback(() => {
    dispatch({ type: "TRIGGER_CRISIS" });
  }, []);

  const acknowledgeCrisis = useCallback(() => {
    dispatch({ type: "ACKNOWLEDGE_CRISIS" });
  }, []);

  const setNegativeExperience = useCallback((value: boolean) => {
    dispatch({ type: "SET_NEGATIVE_EXPERIENCE", value });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // Computed values
  const selectedCategory = useMemo(
    () => (state.selectedCategoryId ? getCategoryById(state.selectedCategoryId) : undefined),
    [state.selectedCategoryId]
  );

  const selectedSubcategory = useMemo(
    () =>
      state.selectedSubcategoryId ? getSubcategoryById(state.selectedSubcategoryId) : undefined,
    [state.selectedSubcategoryId]
  );

  const availableSubcategories = useMemo(
    () => (state.selectedCategoryId ? getSubcategoriesForCategory(state.selectedCategoryId) : []),
    [state.selectedCategoryId]
  );

  // Determine which questions to show based on adaptive mode
  const questionsToShow = useMemo((): (1 | 2 | 3 | 4)[] => {
    if (state.adaptiveMode === "short") {
      // Short mode: only Q1 and Q4
      return [1, 4];
    } else if (state.adaptiveMode === "full") {
      // Full mode: all questions
      return [1, 2, 3, 4];
    }
    // Before Q1 is answered, show only Q1
    return [1];
  }, [state.adaptiveMode]);

  // Check if user can proceed to next step
  const canProceed = useMemo(() => {
    switch (state.currentStep) {
      case 0:
        // Disclaimer step - always can proceed (will accept on click)
        return true;
      case 1:
        // Category selection - need a category selected
        return state.selectedCategoryId !== null && !state.crisisDetected;
      case 2:
        // Subcategory selection - need a subcategory selected
        return state.selectedSubcategoryId !== null;
      case 3:
        // Symptoms - need Q1 and Q4 answered (Q2/Q3 if full mode)
        if (state.symptomAnswers.q1 === null) return false;
        if (state.symptomAnswers.q4 === null) return false;
        if (state.adaptiveMode === "full") {
          if (state.symptomAnswers.q2 === null || state.symptomAnswers.q3 === null) {
            return false;
          }
        }
        return true;
      case 4:
        // Preferences - need structure, engagement, and therapy goal
        return (
          state.styleStructure !== null &&
          state.styleEngagement !== null &&
          state.therapyGoal !== null
        );
      case 5:
        // Logistics - optional, can always proceed
        return true;
      case 6:
        // Results - no next step
        return false;
      default:
        return false;
    }
  }, [state]);

  // Progress percentage (0-100)
  const progress = useMemo(() => {
    const stepProgress: Record<WizardStepV2, number> = {
      0: 0,
      1: 15,
      2: 30,
      3: 50,
      4: 70,
      5: 85,
      6: 100,
    };
    return stepProgress[state.currentStep] ?? 0;
  }, [state.currentStep]);

  // Step labels
  const stepLabel = useMemo(() => {
    const labels: Record<WizardStepV2, string> = {
      0: "Hinweis",
      1: "Thema",
      2: "Details",
      3: "Belastung",
      4: "Stil",
      5: "Praktisches",
      6: "Ergebnisse",
    };
    return labels[state.currentStep] ?? "";
  }, [state.currentStep]);

  const value: WizardContextValue = {
    state,
    actions: {
      setStep,
      goNext,
      goBack,
      acceptDisclaimer,
      selectCategory,
      selectSubcategory,
      answerSymptom,
      clearSymptomAnswers,
      setStyleStructure,
      setStyleEngagement,
      setTherapyGoal,
      setTimeOrientation,
      toggleOptionalPreferences,
      setRelationshipVsMethod,
      setTempo,
      setSafetyVsChallenge,
      setSessionType,
      setInsurance,
      setGenderPreference,
      setLocation,
      setSearchRadius,
      setLanguages,
      addLanguage,
      removeLanguage,
      setResults,
      setLoading,
      triggerCrisis,
      acknowledgeCrisis,
      setNegativeExperience,
      reset,
    },
    computed: {
      canProceed,
      progress,
      selectedCategory,
      selectedSubcategory,
      availableSubcategories,
      questionsToShow,
      stepLabel,
    },
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useWizardV2() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizardV2 must be used within a WizardV2Provider");
  }
  return context;
}
