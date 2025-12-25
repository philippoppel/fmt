"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type {
  Gender,
  SessionType,
  Insurance,
  Language,
  TherapyType,
  TherapySetting,
  Availability,
  TherapyStylePreferences,
  CommunicationStyle,
  TherapyFocus,
  TherapyDepth,
} from "@/types/therapist";
import { defaultTherapyStylePreferences } from "@/types/therapist";
import {
  MATCHING_TOPICS,
  getSubTopicsForTopics,
  getTopicById,
  type Topic,
  type SubTopic,
} from "@/lib/matching/topics";

// Steps: 1 = Topics (with inline freetext + inline screening)
//        1.25 = SubTopics
//        2 = Criteria
//        2.5 = Summary (NEW - review before results)
// NOTE: Steps 0.75 (freetext), 1.5 (intensity), 1.75 (screening) removed for streamlined flow
export type WizardStep = 1 | 1.25 | 2 | 2.5;

export type IntensityLevel = "low" | "medium" | "high";
export type MatchingMode = "quick" | "full";

export interface FreetextAnalysis {
  suggestedTopics: string[];
  suggestedSubTopics: string[]; // NEW: SubTopics for precise matching
  suggestedSpecialties: string[];
  suggestedCommunicationStyle: string | null;
  suggestedTherapyFocus: string | null;
  suggestedIntensityLevel: IntensityLevel | null;
  understandingSummary: string;
  suggestedMethods: string[];
  keywords: string[];
}

// Per-topic intensity tracking
export interface TopicIntensity {
  level: IntensityLevel;
  score: number;
  source: "statements" | "ai";
  aiDescription?: string;
}

export interface MatchingState {
  currentStep: WizardStep;
  // Mode Selection
  matchingMode: MatchingMode;
  // Crisis Detection (inline in topic selection)
  crisisDetected: boolean;
  crisisAcknowledged: boolean; // User saw crisis resources and chose to continue
  // Freetext Analysis (inline in TopicSelection card)
  freetextInput: string;
  freetextAnalysis: FreetextAnalysis | null;
  // Inline freetext (in TopicSelection card)
  inlineFreetextValue: string;
  inlineFreetextAnalysisState: "idle" | "pending" | "success" | "empty" | "crisis";
  // Topics (Step 1)
  selectedTopics: string[];
  selectedSubTopics: string[];
  // Topic priority order (from subtopic-selection step)
  topicPriorityOrder: string[];
  // "Other" topic specialties (matched via AI)
  otherTopicSpecialties: string[];
  // Intensity Assessment (Step 1.5)
  selectedIntensityStatements: string[];
  topicIntensities: Record<string, TopicIntensity>; // Per-topic intensities
  intensityScore: number; // Overall weighted score
  intensityLevel: IntensityLevel | null; // Overall level
  // Criteria (Step 2)
  criteria: {
    location: string;
    gender: Gender | null;
    sessionType: SessionType | null;
    insurance: Insurance[];
    languages: Language[];
    therapyTypes: TherapyType[];
    therapySettings: TherapySetting[];
    availability: Availability | null;
    maxPrice: number | null; // Max price per session in EUR
  };
  // Therapy Style Quiz (Step 3)
  therapyStyle: TherapyStylePreferences;
}

type MatchingAction =
  | { type: "SET_STEP"; step: WizardStep }
  | { type: "SET_MODE"; mode: MatchingMode }
  | { type: "SET_CRISIS_DETECTED"; crisisDetected: boolean }
  | { type: "ACKNOWLEDGE_CRISIS" } // User saw resources and wants to continue
  | { type: "RESET_CRISIS" }
  | { type: "SET_FREETEXT"; text: string }
  | { type: "SET_FREETEXT_ANALYSIS"; analysis: FreetextAnalysis }
  | { type: "SET_INLINE_FREETEXT"; value: string }
  | { type: "SET_INLINE_FREETEXT_ANALYSIS_STATE"; state: "idle" | "pending" | "success" | "empty" | "crisis" }
  | { type: "APPLY_FREETEXT_ANALYSIS" }
  | { type: "SKIP_FREETEXT" }
  | { type: "TOGGLE_TOPIC"; topicId: string }
  | { type: "TOGGLE_SUBTOPIC"; subTopicId: string }
  | { type: "SET_OTHER_TOPIC_SPECIALTIES"; specialties: string[] }
  | { type: "SET_TOPIC_PRIORITY_ORDER"; order: string[] }
  | { type: "TOGGLE_INTENSITY_STATEMENT"; statementId: string }
  | { type: "SET_TOPIC_INTENSITY"; topicId: string; intensity: TopicIntensity }
  | { type: "CLEAR_TOPIC_INTENSITY"; topicId: string }
  | { type: "SET_INTENSITY"; score: number; level: IntensityLevel | null }
  | { type: "SKIP_INTENSITY" }
  | { type: "SET_LOCATION"; location: string }
  | { type: "SET_GENDER"; gender: Gender | null }
  | { type: "SET_SESSION_TYPE"; sessionType: SessionType | null }
  | { type: "TOGGLE_INSURANCE"; insurance: Insurance }
  | { type: "TOGGLE_LANGUAGE"; language: Language }
  | { type: "TOGGLE_THERAPY_TYPE"; therapyType: TherapyType }
  | { type: "TOGGLE_THERAPY_SETTING"; therapySetting: TherapySetting }
  | { type: "SET_AVAILABILITY"; availability: Availability | null }
  | { type: "SET_MAX_PRICE"; maxPrice: number | null }
  | { type: "SET_COMMUNICATION_STYLE"; style: CommunicationStyle | null }
  | { type: "SET_PREFERS_HOMEWORK"; value: boolean | null }
  | { type: "SET_THERAPY_FOCUS"; focus: TherapyFocus | null }
  | { type: "SET_TALK_PREFERENCE"; value: "more_self" | "guided" | null }
  | { type: "SET_THERAPY_DEPTH"; depth: TherapyDepth | null }
  | { type: "RESET" }
  | { type: "RESTORE_STATE"; payload: Partial<MatchingState> };

// Helper function to calculate weighted overall intensity from per-topic intensities
function calculateOverallIntensity(
  topicIntensities: Record<string, TopicIntensity>,
  priorityOrder: string[]
): { overallScore: number; overallLevel: IntensityLevel | null } {
  const topics = Object.keys(topicIntensities);
  if (topics.length === 0) {
    return { overallScore: 0, overallLevel: null };
  }

  // Priority weights: first topic = 3, second = 2, third = 1.5, rest = 1
  const getWeight = (topicId: string): number => {
    const index = priorityOrder.indexOf(topicId);
    if (index === 0) return 3;
    if (index === 1) return 2;
    if (index === 2) return 1.5;
    return 1;
  };

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const topicId of topics) {
    const intensity = topicIntensities[topicId];
    const weight = getWeight(topicId);
    totalWeightedScore += intensity.score * weight;
    totalWeight += weight;
  }

  const overallScore = Math.round(totalWeightedScore / totalWeight);

  let overallLevel: IntensityLevel;
  if (overallScore < 30) {
    overallLevel = "low";
  } else if (overallScore < 70) {
    overallLevel = "medium";
  } else {
    overallLevel = "high";
  }

  return { overallScore, overallLevel };
}

const initialState: MatchingState = {
  currentStep: 1, // Start with topic selection
  matchingMode: "full",
  crisisDetected: false,
  crisisAcknowledged: false,
  freetextInput: "",
  freetextAnalysis: null,
  inlineFreetextValue: "",
  inlineFreetextAnalysisState: "idle",
  selectedTopics: [],
  selectedSubTopics: [],
  topicPriorityOrder: [],
  otherTopicSpecialties: [],
  selectedIntensityStatements: [],
  topicIntensities: {},
  intensityScore: 0,
  intensityLevel: null,
  criteria: {
    location: "",
    gender: null,
    sessionType: null,
    insurance: [],
    languages: [],
    therapyTypes: [],
    therapySettings: [],
    availability: null,
    maxPrice: null,
  },
  therapyStyle: defaultTherapyStylePreferences,
};

function matchingReducer(
  state: MatchingState,
  action: MatchingAction
): MatchingState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };

    case "SET_MODE":
      return { ...state, matchingMode: action.mode };

    case "SET_CRISIS_DETECTED":
      return {
        ...state,
        crisisDetected: action.crisisDetected,
        // If crisis detected, don't auto-block - user can acknowledge and continue
      };

    case "ACKNOWLEDGE_CRISIS":
      return {
        ...state,
        crisisAcknowledged: true,
        // User can continue after seeing crisis resources
      };

    case "RESET_CRISIS":
      return {
        ...state,
        crisisDetected: false,
        crisisAcknowledged: false,
      };

    case "SET_FREETEXT":
      return { ...state, freetextInput: action.text };

    case "SET_FREETEXT_ANALYSIS":
      return { ...state, freetextAnalysis: action.analysis };

    case "SET_INLINE_FREETEXT":
      return { ...state, inlineFreetextValue: action.value };

    case "SET_INLINE_FREETEXT_ANALYSIS_STATE":
      return { ...state, inlineFreetextAnalysisState: action.state };

    case "APPLY_FREETEXT_ANALYSIS": {
      if (!state.freetextAnalysis) return state;
      return {
        ...state,
        selectedTopics: state.freetextAnalysis.suggestedTopics,
        selectedSubTopics: state.freetextAnalysis.suggestedSubTopics || [],
        intensityLevel: state.freetextAnalysis.suggestedIntensityLevel,
        currentStep: 1, // Go to topic selection (pre-filled)
      };
    }

    case "SKIP_FREETEXT":
      return {
        ...state,
        freetextInput: "",
        freetextAnalysis: null,
        currentStep: 1, // Go to manual topic selection
      };

    case "TOGGLE_INTENSITY_STATEMENT": {
      const isSelected = state.selectedIntensityStatements.includes(action.statementId);
      return {
        ...state,
        selectedIntensityStatements: isSelected
          ? state.selectedIntensityStatements.filter((id) => id !== action.statementId)
          : [...state.selectedIntensityStatements, action.statementId],
      };
    }

    case "SET_INTENSITY":
      return {
        ...state,
        intensityScore: action.score,
        intensityLevel: action.level,
      };

    case "SKIP_INTENSITY":
      return {
        ...state,
        intensityScore: 0,
        intensityLevel: null,
        currentStep: 2,
      };

    case "TOGGLE_TOPIC": {
      const isSelected = state.selectedTopics.includes(action.topicId);
      const newTopics = isSelected
        ? state.selectedTopics.filter((id) => id !== action.topicId)
        : [...state.selectedTopics, action.topicId];

      // Clear subtopics that belong to deselected topics
      const availableSubTopicIds = new Set(
        getSubTopicsForTopics(newTopics).map((st) => st.id)
      );
      const newSubTopics = state.selectedSubTopics.filter((id) =>
        availableSubTopicIds.has(id)
      );

      // Check if any selected topic is a crisis flag
      const hasCrisisFlag = newTopics.some((topicId) => {
        const topic = getTopicById(topicId);
        return topic?.isFlag === true;
      });

      return {
        ...state,
        selectedTopics: newTopics,
        selectedSubTopics: newSubTopics,
        // Set crisis detected if a flag topic is selected (and not already acknowledged)
        crisisDetected: hasCrisisFlag && !state.crisisAcknowledged,
      };
    }

    case "TOGGLE_SUBTOPIC": {
      const isSelected = state.selectedSubTopics.includes(action.subTopicId);
      return {
        ...state,
        selectedSubTopics: isSelected
          ? state.selectedSubTopics.filter((id) => id !== action.subTopicId)
          : [...state.selectedSubTopics, action.subTopicId],
      };
    }

    case "SET_OTHER_TOPIC_SPECIALTIES":
      return {
        ...state,
        otherTopicSpecialties: action.specialties,
      };

    case "SET_TOPIC_PRIORITY_ORDER":
      return {
        ...state,
        topicPriorityOrder: action.order,
      };

    case "SET_TOPIC_INTENSITY": {
      const newTopicIntensities = {
        ...state.topicIntensities,
        [action.topicId]: action.intensity,
      };
      // Recalculate overall intensity from per-topic intensities
      const { overallScore, overallLevel } = calculateOverallIntensity(
        newTopicIntensities,
        state.topicPriorityOrder.length > 0 ? state.topicPriorityOrder : state.selectedTopics
      );
      return {
        ...state,
        topicIntensities: newTopicIntensities,
        intensityScore: overallScore,
        intensityLevel: overallLevel,
      };
    }

    case "CLEAR_TOPIC_INTENSITY": {
      const { [action.topicId]: _, ...remainingIntensities } = state.topicIntensities;
      const { overallScore, overallLevel } = calculateOverallIntensity(
        remainingIntensities,
        state.topicPriorityOrder.length > 0 ? state.topicPriorityOrder : state.selectedTopics
      );
      return {
        ...state,
        topicIntensities: remainingIntensities,
        intensityScore: overallScore,
        intensityLevel: overallLevel,
      };
    }

    case "SET_LOCATION":
      return {
        ...state,
        criteria: { ...state.criteria, location: action.location },
      };

    case "SET_GENDER":
      return {
        ...state,
        criteria: { ...state.criteria, gender: action.gender },
      };

    case "SET_SESSION_TYPE":
      return {
        ...state,
        criteria: { ...state.criteria, sessionType: action.sessionType },
      };

    case "TOGGLE_INSURANCE": {
      const isSelected = state.criteria.insurance.includes(action.insurance);
      return {
        ...state,
        criteria: {
          ...state.criteria,
          insurance: isSelected
            ? state.criteria.insurance.filter((i) => i !== action.insurance)
            : [...state.criteria.insurance, action.insurance],
        },
      };
    }

    case "TOGGLE_LANGUAGE": {
      const isSelected = state.criteria.languages.includes(action.language);
      return {
        ...state,
        criteria: {
          ...state.criteria,
          languages: isSelected
            ? state.criteria.languages.filter((l) => l !== action.language)
            : [...state.criteria.languages, action.language],
        },
      };
    }

    case "TOGGLE_THERAPY_TYPE": {
      const isSelected = state.criteria.therapyTypes.includes(action.therapyType);
      return {
        ...state,
        criteria: {
          ...state.criteria,
          therapyTypes: isSelected
            ? state.criteria.therapyTypes.filter((t) => t !== action.therapyType)
            : [...state.criteria.therapyTypes, action.therapyType],
        },
      };
    }

    case "TOGGLE_THERAPY_SETTING": {
      const isSelected = state.criteria.therapySettings.includes(action.therapySetting);
      return {
        ...state,
        criteria: {
          ...state.criteria,
          therapySettings: isSelected
            ? state.criteria.therapySettings.filter((s) => s !== action.therapySetting)
            : [...state.criteria.therapySettings, action.therapySetting],
        },
      };
    }

    case "SET_AVAILABILITY":
      return {
        ...state,
        criteria: { ...state.criteria, availability: action.availability },
      };

    case "SET_MAX_PRICE":
      return {
        ...state,
        criteria: { ...state.criteria, maxPrice: action.maxPrice },
      };

    // Therapy Style Actions
    case "SET_COMMUNICATION_STYLE":
      return {
        ...state,
        therapyStyle: {
          ...state.therapyStyle,
          communicationStyle: action.style,
        },
      };

    case "SET_PREFERS_HOMEWORK":
      return {
        ...state,
        therapyStyle: {
          ...state.therapyStyle,
          prefersHomework: action.value,
        },
      };

    case "SET_THERAPY_FOCUS":
      return {
        ...state,
        therapyStyle: {
          ...state.therapyStyle,
          therapyFocus: action.focus,
        },
      };

    case "SET_TALK_PREFERENCE":
      return {
        ...state,
        therapyStyle: {
          ...state.therapyStyle,
          talkPreference: action.value,
        },
      };

    case "SET_THERAPY_DEPTH":
      return {
        ...state,
        therapyStyle: {
          ...state.therapyStyle,
          therapyDepth: action.depth,
        },
      };

    case "RESET":
      return initialState;

    case "RESTORE_STATE":
      return {
        ...initialState,
        ...action.payload,
        // Ensure criteria is properly merged
        criteria: {
          ...initialState.criteria,
          ...(action.payload.criteria || {}),
        },
        // Ensure therapyStyle is properly merged
        therapyStyle: {
          ...initialState.therapyStyle,
          ...(action.payload.therapyStyle || {}),
        },
      };

    default:
      return state;
  }
}

interface MatchingContextValue {
  state: MatchingState;
  actions: {
    setStep: (step: WizardStep) => void;
    setMode: (mode: MatchingMode) => void;
    // Crisis actions (inline detection, can continue after acknowledging)
    setCrisisDetected: (crisisDetected: boolean) => void;
    acknowledgeCrisis: () => void;
    resetCrisis: () => void;
    // Freetext actions
    setFreetext: (text: string) => void;
    setFreetextAnalysis: (analysis: FreetextAnalysis) => void;
    applyFreetextAnalysis: () => void;
    skipFreetext: () => void;
    // Inline freetext actions
    setInlineFreetext: (value: string) => void;
    setInlineFreetextAnalysisState: (state: "idle" | "pending" | "success" | "empty" | "crisis") => void;
    // Topic actions
    toggleTopic: (topicId: string) => void;
    toggleSubTopic: (subTopicId: string) => void;
    setOtherTopicSpecialties: (specialties: string[]) => void;
    setTopicPriorityOrder: (order: string[]) => void;
    // Intensity actions
    toggleIntensityStatement: (statementId: string) => void;
    setTopicIntensity: (topicId: string, intensity: TopicIntensity) => void;
    clearTopicIntensity: (topicId: string) => void;
    setIntensity: (score: number, level: IntensityLevel | null) => void;
    skipIntensity: () => void;
    // Criteria actions
    setLocation: (location: string) => void;
    setGender: (gender: Gender | null) => void;
    setSessionType: (sessionType: SessionType | null) => void;
    toggleInsurance: (insurance: Insurance) => void;
    toggleLanguage: (language: Language) => void;
    toggleTherapyType: (therapyType: TherapyType) => void;
    toggleTherapySetting: (therapySetting: TherapySetting) => void;
    setAvailability: (availability: Availability | null) => void;
    setMaxPrice: (maxPrice: number | null) => void;
    // Therapy Style actions
    setCommunicationStyle: (style: CommunicationStyle | null) => void;
    setPrefersHomework: (value: boolean | null) => void;
    setTherapyFocus: (focus: TherapyFocus | null) => void;
    setTalkPreference: (value: "more_self" | "guided" | null) => void;
    setTherapyDepth: (depth: TherapyDepth | null) => void;
    reset: () => void;
    goNext: () => void;
    goBack: () => void;
  };
  computed: {
    canProceed: boolean;
    selectedTopicDetails: Topic[];
    availableSubTopics: SubTopic[];
    progress: number;
  };
}

const MatchingContext = createContext<MatchingContextValue | null>(null);

interface MatchingProviderProps {
  children: ReactNode;
  initialTopic?: string;
  /** Restore state from sessionStorage (for edit flow from results page) */
  resumeState?: Partial<MatchingState>;
}

export function MatchingProvider({ children, initialTopic, resumeState }: MatchingProviderProps) {
  // Create initial state with pre-selected topic or resumed state
  const computedInitialState = useMemo(() => {
    // If resuming from results page, use that state and go to summary
    if (resumeState && Object.keys(resumeState).length > 0) {
      return {
        ...initialState,
        ...resumeState,
        criteria: {
          ...initialState.criteria,
          ...(resumeState.criteria || {}),
        },
        therapyStyle: {
          ...initialState.therapyStyle,
          ...(resumeState.therapyStyle || {}),
        },
        currentStep: 2.5 as WizardStep, // Go directly to summary for editing
      };
    }
    // Otherwise, check for initial topic
    if (initialTopic && MATCHING_TOPICS.some(t => t.id === initialTopic)) {
      return {
        ...initialState,
        selectedTopics: [initialTopic],
      };
    }
    return initialState;
  }, [initialTopic, resumeState]);

  const [state, dispatch] = useReducer(matchingReducer, computedInitialState);

  // Actions
  const setStep = useCallback((step: WizardStep) => {
    dispatch({ type: "SET_STEP", step });
  }, []);

  // Crisis actions
  const setCrisisDetected = useCallback((crisisDetected: boolean) => {
    dispatch({ type: "SET_CRISIS_DETECTED", crisisDetected });
  }, []);

  const acknowledgeCrisis = useCallback(() => {
    dispatch({ type: "ACKNOWLEDGE_CRISIS" });
  }, []);

  const resetCrisis = useCallback(() => {
    dispatch({ type: "RESET_CRISIS" });
  }, []);

  // Topic actions
  const toggleTopic = useCallback((topicId: string) => {
    dispatch({ type: "TOGGLE_TOPIC", topicId });
  }, []);

  const toggleSubTopic = useCallback((subTopicId: string) => {
    dispatch({ type: "TOGGLE_SUBTOPIC", subTopicId });
  }, []);

  const setOtherTopicSpecialties = useCallback((specialties: string[]) => {
    dispatch({ type: "SET_OTHER_TOPIC_SPECIALTIES", specialties });
  }, []);

  const setTopicPriorityOrder = useCallback((order: string[]) => {
    dispatch({ type: "SET_TOPIC_PRIORITY_ORDER", order });
  }, []);

  // Intensity actions
  const toggleIntensityStatement = useCallback((statementId: string) => {
    dispatch({ type: "TOGGLE_INTENSITY_STATEMENT", statementId });
  }, []);

  const setTopicIntensity = useCallback((topicId: string, intensity: TopicIntensity) => {
    dispatch({ type: "SET_TOPIC_INTENSITY", topicId, intensity });
  }, []);

  const clearTopicIntensity = useCallback((topicId: string) => {
    dispatch({ type: "CLEAR_TOPIC_INTENSITY", topicId });
  }, []);

  const setIntensity = useCallback((score: number, level: IntensityLevel | null) => {
    dispatch({ type: "SET_INTENSITY", score, level });
  }, []);

  const skipIntensity = useCallback(() => {
    dispatch({ type: "SKIP_INTENSITY" });
  }, []);

  const setLocation = useCallback((location: string) => {
    dispatch({ type: "SET_LOCATION", location });
  }, []);

  const setGender = useCallback((gender: Gender | null) => {
    dispatch({ type: "SET_GENDER", gender });
  }, []);

  const setSessionType = useCallback((sessionType: SessionType | null) => {
    dispatch({ type: "SET_SESSION_TYPE", sessionType });
  }, []);

  const toggleInsurance = useCallback((insurance: Insurance) => {
    dispatch({ type: "TOGGLE_INSURANCE", insurance });
  }, []);

  const toggleLanguage = useCallback((language: Language) => {
    dispatch({ type: "TOGGLE_LANGUAGE", language });
  }, []);

  const toggleTherapyType = useCallback((therapyType: TherapyType) => {
    dispatch({ type: "TOGGLE_THERAPY_TYPE", therapyType });
  }, []);

  const toggleTherapySetting = useCallback((therapySetting: TherapySetting) => {
    dispatch({ type: "TOGGLE_THERAPY_SETTING", therapySetting });
  }, []);

  const setAvailability = useCallback((availability: Availability | null) => {
    dispatch({ type: "SET_AVAILABILITY", availability });
  }, []);

  const setMaxPrice = useCallback((maxPrice: number | null) => {
    dispatch({ type: "SET_MAX_PRICE", maxPrice });
  }, []);

  // Therapy Style actions
  const setCommunicationStyle = useCallback(
    (style: CommunicationStyle | null) => {
      dispatch({ type: "SET_COMMUNICATION_STYLE", style });
    },
    []
  );

  const setPrefersHomework = useCallback((value: boolean | null) => {
    dispatch({ type: "SET_PREFERS_HOMEWORK", value });
  }, []);

  const setTherapyFocus = useCallback((focus: TherapyFocus | null) => {
    dispatch({ type: "SET_THERAPY_FOCUS", focus });
  }, []);

  const setTalkPreference = useCallback(
    (value: "more_self" | "guided" | null) => {
      dispatch({ type: "SET_TALK_PREFERENCE", value });
    },
    []
  );

  const setTherapyDepth = useCallback((depth: TherapyDepth | null) => {
    dispatch({ type: "SET_THERAPY_DEPTH", depth });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // Mode selection
  const setMode = useCallback((mode: MatchingMode) => {
    dispatch({ type: "SET_MODE", mode });
  }, []);

  // Freetext actions
  const setFreetext = useCallback((text: string) => {
    dispatch({ type: "SET_FREETEXT", text });
  }, []);

  const setFreetextAnalysis = useCallback((analysis: FreetextAnalysis) => {
    dispatch({ type: "SET_FREETEXT_ANALYSIS", analysis });
  }, []);

  const applyFreetextAnalysis = useCallback(() => {
    dispatch({ type: "APPLY_FREETEXT_ANALYSIS" });
  }, []);

  const skipFreetext = useCallback(() => {
    dispatch({ type: "SKIP_FREETEXT" });
  }, []);

  const setInlineFreetext = useCallback((value: string) => {
    dispatch({ type: "SET_INLINE_FREETEXT", value });
  }, []);

  const setInlineFreetextAnalysisState = useCallback((state: "idle" | "pending" | "success" | "empty" | "crisis") => {
    dispatch({ type: "SET_INLINE_FREETEXT_ANALYSIS_STATE", state });
  }, []);

  // Navigation: 1 (topics) -> 1.25 (subtopics) -> 2 (criteria) -> 2.5 (summary) -> results
  // SubTopics step (1.25) is skipped if no subtopics available AND "other" not selected
  const goNext = useCallback(() => {
    const stepOrder: WizardStep[] = [1, 1.25, 2, 2.5];
    const currentIndex = stepOrder.indexOf(state.currentStep);

    // Skip SubTopics step if no available subtopics AND "unsureOther" not selected
    if (state.currentStep === 1) {
      const hasOtherTopic = state.selectedTopics.includes("unsureOther");
      const availableSubs = getSubTopicsForTopics(state.selectedTopics);
      // Don't skip if "unsureOther" is selected - they need to describe in freetext
      if (availableSubs.length === 0 && !hasOtherTopic) {
        dispatch({ type: "SET_STEP", step: 2 }); // Skip to criteria
        return;
      }
    }

    if (currentIndex < stepOrder.length - 1) {
      dispatch({ type: "SET_STEP", step: stepOrder[currentIndex + 1] });
    }
  }, [state.currentStep, state.selectedTopics]);

  const goBack = useCallback(() => {
    const stepOrder: WizardStep[] = [1, 1.25, 2, 2.5];
    const currentIndex = stepOrder.indexOf(state.currentStep);
    // Can go back from any step except the first (topics)
    if (currentIndex > 0) {
      if (state.currentStep === 1) {
        // Can't go back from topics - it's the first step
        return;
      } else if (state.currentStep === 2) {
        // From criteria, check if we should skip subtopics
        const hasOtherTopic = state.selectedTopics.includes("unsureOther");
        const availableSubs = getSubTopicsForTopics(state.selectedTopics);
        if (availableSubs.length === 0 && !hasOtherTopic) {
          dispatch({ type: "SET_STEP", step: 1 }); // Skip back to topics
          return;
        }
      }
      dispatch({ type: "SET_STEP", step: stepOrder[currentIndex - 1] });
    }
  }, [state.currentStep, state.selectedTopics]);

  // Computed values
  const selectedTopicDetails = useMemo(
    () => MATCHING_TOPICS.filter((t) => state.selectedTopics.includes(t.id)),
    [state.selectedTopics]
  );

  const availableSubTopics = useMemo(
    () => getSubTopicsForTopics(state.selectedTopics),
    [state.selectedTopics]
  );

  const canProceed = useMemo(() => {
    switch (state.currentStep) {
      case 1:
        // Topics step - require at least one topic
        // If crisis detected and not acknowledged, block proceeding
        if (state.crisisDetected && !state.crisisAcknowledged) {
          return false;
        }
        return state.selectedTopics.length > 0;
      case 1.25: {
        // SubTopics are optional UNLESS "unsureOther" is the ONLY selected topic
        // In that case, require freetext analysis to have matched specialties
        const onlyOtherTopic = state.selectedTopics.length === 1 &&
          state.selectedTopics[0] === "unsureOther";
        if (onlyOtherTopic && state.otherTopicSpecialties.length === 0) {
          return false; // Must analyze freetext to get specialty matches
        }
        return true;
      }
      case 2:
        return true; // All criteria are optional
      case 2.5:
        return true; // Summary - just review, can always proceed
      default:
        return false;
    }
  }, [state.currentStep, state.crisisDetected, state.crisisAcknowledged, state.selectedTopics, state.otherTopicSpecialties.length]);

  // Progress: 1 = 25%, 1.25 = 50%, 2 = 75%, 2.5 = 95%
  const progress = useMemo(() => {
    const stepProgress: Record<WizardStep, number> = {
      1: 25,
      1.25: 50,
      2: 75,
      2.5: 95,
    };
    return stepProgress[state.currentStep] ?? 0;
  }, [state.currentStep]);

  const value: MatchingContextValue = {
    state,
    actions: {
      setStep,
      setMode,
      // Crisis
      setCrisisDetected,
      acknowledgeCrisis,
      resetCrisis,
      // Freetext
      setFreetext,
      setFreetextAnalysis,
      applyFreetextAnalysis,
      skipFreetext,
      // Inline freetext
      setInlineFreetext,
      setInlineFreetextAnalysisState,
      // Topics
      toggleTopic,
      toggleSubTopic,
      setOtherTopicSpecialties,
      setTopicPriorityOrder,
      // Intensity
      toggleIntensityStatement,
      setTopicIntensity,
      clearTopicIntensity,
      setIntensity,
      skipIntensity,
      // Criteria
      setLocation,
      setGender,
      setSessionType,
      toggleInsurance,
      toggleLanguage,
      toggleTherapyType,
      toggleTherapySetting,
      setAvailability,
      setMaxPrice,
      // Therapy Style
      setCommunicationStyle,
      setPrefersHomework,
      setTherapyFocus,
      setTalkPreference,
      setTherapyDepth,
      reset,
      goNext,
      goBack,
    },
    computed: {
      canProceed,
      selectedTopicDetails,
      availableSubTopics,
      progress,
    },
  };

  return (
    <MatchingContext.Provider value={value}>
      {children}
    </MatchingContext.Provider>
  );
}

export function useMatching() {
  const context = useContext(MatchingContext);
  if (!context) {
    throw new Error("useMatching must be used within a MatchingProvider");
  }
  return context;
}
