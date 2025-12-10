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
  TherapyStylePreferences,
  CommunicationStyle,
  TherapyFocus,
  TherapyDepth,
} from "@/types/therapist";
import { defaultTherapyStylePreferences } from "@/types/therapist";
import {
  MATCHING_TOPICS,
  getSubTopicsForTopics,
  type Topic,
  type SubTopic,
} from "@/lib/matching/topics";

// Steps: 1 = Topics, 1.25 = SubTopics, 1.5 = Intensity (optional), 2 = Criteria, 2.5 = Screening (before results)
// Optional: 0.75 = Freetext (alternative to topic selection)
export type WizardStep = 0.75 | 1 | 1.25 | 1.5 | 2 | 2.5;

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

export interface MatchingState {
  currentStep: WizardStep;
  // Mode Selection
  matchingMode: MatchingMode;
  // Screening (Step 0)
  screeningCompleted: boolean;
  crisisDetected: boolean;
  // Freetext Analysis (Step 0.75)
  freetextInput: string;
  freetextAnalysis: FreetextAnalysis | null;
  // Topics (Step 1)
  selectedTopics: string[];
  selectedSubTopics: string[];
  // Intensity Assessment (Step 1.5)
  selectedIntensityStatements: string[];
  intensityScore: number;
  intensityLevel: IntensityLevel | null;
  // Criteria (Step 2)
  criteria: {
    location: string;
    gender: Gender | null;
    sessionType: SessionType | null;
    insurance: Insurance[];
  };
  // Therapy Style Quiz (Step 3)
  therapyStyle: TherapyStylePreferences;
}

type MatchingAction =
  | { type: "SET_STEP"; step: WizardStep }
  | { type: "SET_MODE"; mode: MatchingMode }
  | { type: "COMPLETE_SCREENING"; crisisDetected: boolean }
  | { type: "RESET_SCREENING" }
  | { type: "SWITCH_TO_FREETEXT" }
  | { type: "SET_FREETEXT"; text: string }
  | { type: "SET_FREETEXT_ANALYSIS"; analysis: FreetextAnalysis }
  | { type: "APPLY_FREETEXT_ANALYSIS" }
  | { type: "SKIP_FREETEXT" }
  | { type: "TOGGLE_TOPIC"; topicId: string }
  | { type: "TOGGLE_SUBTOPIC"; subTopicId: string }
  | { type: "TOGGLE_INTENSITY_STATEMENT"; statementId: string }
  | { type: "SET_INTENSITY"; score: number; level: IntensityLevel | null }
  | { type: "SKIP_INTENSITY" }
  | { type: "SET_LOCATION"; location: string }
  | { type: "SET_GENDER"; gender: Gender | null }
  | { type: "SET_SESSION_TYPE"; sessionType: SessionType | null }
  | { type: "TOGGLE_INSURANCE"; insurance: Insurance }
  | { type: "SET_COMMUNICATION_STYLE"; style: CommunicationStyle | null }
  | { type: "SET_PREFERS_HOMEWORK"; value: boolean | null }
  | { type: "SET_THERAPY_FOCUS"; focus: TherapyFocus | null }
  | { type: "SET_TALK_PREFERENCE"; value: "more_self" | "guided" | null }
  | { type: "SET_THERAPY_DEPTH"; depth: TherapyDepth | null }
  | { type: "RESET" };

const initialState: MatchingState = {
  currentStep: 1, // Start with topic selection
  matchingMode: "full",
  screeningCompleted: false,
  crisisDetected: false,
  freetextInput: "",
  freetextAnalysis: null,
  selectedTopics: [],
  selectedSubTopics: [],
  selectedIntensityStatements: [],
  intensityScore: 0,
  intensityLevel: null,
  criteria: {
    location: "",
    gender: null,
    sessionType: null,
    insurance: [],
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

    case "COMPLETE_SCREENING":
      return {
        ...state,
        screeningCompleted: true,
        crisisDetected: action.crisisDetected,
        // Stay on screening step - wizard will handle showing crisis or results
      };

    case "RESET_SCREENING":
      return {
        ...state,
        screeningCompleted: false,
        crisisDetected: false,
        currentStep: 2.5,
      };

    case "SWITCH_TO_FREETEXT":
      return {
        ...state,
        currentStep: 0.75,
      };

    case "SET_FREETEXT":
      return { ...state, freetextInput: action.text };

    case "SET_FREETEXT_ANALYSIS":
      return { ...state, freetextAnalysis: action.analysis };

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

      return {
        ...state,
        selectedTopics: newTopics,
        selectedSubTopics: newSubTopics,
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

    default:
      return state;
  }
}

interface MatchingContextValue {
  state: MatchingState;
  actions: {
    setStep: (step: WizardStep) => void;
    setMode: (mode: MatchingMode) => void;
    // Screening actions
    completeScreening: (crisisDetected: boolean) => void;
    resetScreening: () => void;
    // Freetext actions
    setFreetext: (text: string) => void;
    setFreetextAnalysis: (analysis: FreetextAnalysis) => void;
    applyFreetextAnalysis: () => void;
    skipFreetext: () => void;
    switchToFreetext: () => void;
    // Topic actions
    toggleTopic: (topicId: string) => void;
    toggleSubTopic: (subTopicId: string) => void;
    // Intensity actions
    toggleIntensityStatement: (statementId: string) => void;
    setIntensity: (score: number, level: IntensityLevel | null) => void;
    skipIntensity: () => void;
    // Criteria actions
    setLocation: (location: string) => void;
    setGender: (gender: Gender | null) => void;
    setSessionType: (sessionType: SessionType | null) => void;
    toggleInsurance: (insurance: Insurance) => void;
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

export function MatchingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(matchingReducer, initialState);

  // Actions
  const setStep = useCallback((step: WizardStep) => {
    dispatch({ type: "SET_STEP", step });
  }, []);

  // Screening actions
  const completeScreening = useCallback((crisisDetected: boolean) => {
    dispatch({ type: "COMPLETE_SCREENING", crisisDetected });
  }, []);

  const resetScreening = useCallback(() => {
    dispatch({ type: "RESET_SCREENING" });
  }, []);

  // Topic actions
  const toggleTopic = useCallback((topicId: string) => {
    dispatch({ type: "TOGGLE_TOPIC", topicId });
  }, []);

  const toggleSubTopic = useCallback((subTopicId: string) => {
    dispatch({ type: "TOGGLE_SUBTOPIC", subTopicId });
  }, []);

  // Intensity actions
  const toggleIntensityStatement = useCallback((statementId: string) => {
    dispatch({ type: "TOGGLE_INTENSITY_STATEMENT", statementId });
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

  const switchToFreetext = useCallback(() => {
    dispatch({ type: "SWITCH_TO_FREETEXT" });
  }, []);

  // Navigation: 1 -> 1.25 (subtopics) -> 1.5 -> 2 -> 2.5 (screening) -> results
  // Alternative: 0.75 (freetext) -> 1 -> ...
  // SubTopics step (1.25) is skipped if no topics selected
  const goNext = useCallback(() => {
    const stepOrder: WizardStep[] = [0.75, 1, 1.25, 1.5, 2, 2.5];
    const currentIndex = stepOrder.indexOf(state.currentStep);

    // Skip SubTopics step if no available subtopics
    if (state.currentStep === 1) {
      const availableSubs = getSubTopicsForTopics(state.selectedTopics);
      if (availableSubs.length === 0) {
        dispatch({ type: "SET_STEP", step: 1.5 }); // Skip to intensity
        return;
      }
    }

    if (currentIndex < stepOrder.length - 1) {
      dispatch({ type: "SET_STEP", step: stepOrder[currentIndex + 1] });
    }
  }, [state.currentStep, state.selectedTopics]);

  const goBack = useCallback(() => {
    const stepOrder: WizardStep[] = [0.75, 1, 1.25, 1.5, 2, 2.5];
    const currentIndex = stepOrder.indexOf(state.currentStep);
    // Can go back from any step except the first (freetext or topics)
    if (currentIndex > 0) {
      // From topics (1), if came from freetext, go back there
      if (state.currentStep === 1 && state.freetextAnalysis) {
        dispatch({ type: "SET_STEP", step: 0.75 });
      } else if (state.currentStep === 1) {
        // Can't go back from topics if no freetext
        return;
      } else if (state.currentStep === 1.5) {
        // From intensity, check if we should skip subtopics
        const availableSubs = getSubTopicsForTopics(state.selectedTopics);
        if (availableSubs.length === 0) {
          dispatch({ type: "SET_STEP", step: 1 }); // Skip back to topics
          return;
        }
      }
      dispatch({ type: "SET_STEP", step: stepOrder[currentIndex - 1] });
    }
  }, [state.currentStep, state.freetextAnalysis, state.selectedTopics]);

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
      case 0.75:
        return true; // Freetext is optional
      case 1:
        return state.selectedTopics.length > 0;
      case 1.25:
        return true; // SubTopics are optional (but recommended)
      case 1.5:
        return true; // Intensity is optional
      case 2:
        return true; // All criteria are optional
      case 2.5:
        return state.screeningCompleted && !state.crisisDetected;
      default:
        return false;
    }
  }, [state.currentStep, state.screeningCompleted, state.crisisDetected, state.selectedTopics.length]);

  // Progress: 1 = 20%, 1.25 = 35%, 1.5 = 50%, 2 = 70%, 2.5 = 90%, results = 100%
  const progress = useMemo(() => {
    const stepProgress: Record<WizardStep, number> = {
      0.75: 10,
      1: 20,
      1.25: 35,
      1.5: 50,
      2: 70,
      2.5: 90,
    };
    return stepProgress[state.currentStep] ?? 0;
  }, [state.currentStep]);

  const value: MatchingContextValue = {
    state,
    actions: {
      setStep,
      setMode,
      // Screening
      completeScreening,
      resetScreening,
      // Freetext
      setFreetext,
      setFreetextAnalysis,
      applyFreetextAnalysis,
      skipFreetext,
      switchToFreetext,
      // Topics
      toggleTopic,
      toggleSubTopic,
      // Intensity
      toggleIntensityStatement,
      setIntensity,
      skipIntensity,
      // Criteria
      setLocation,
      setGender,
      setSessionType,
      toggleInsurance,
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
