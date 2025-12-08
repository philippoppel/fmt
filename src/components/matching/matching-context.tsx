"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Gender, SessionType, Insurance } from "@/types/therapist";
import {
  MATCHING_TOPICS,
  getSubTopicsForTopics,
  type Topic,
  type SubTopic,
} from "@/lib/matching/topics";

export type WizardStep = 1 | 2 | 3;

export interface MatchingState {
  currentStep: WizardStep;
  selectedTopics: string[];
  selectedSubTopics: string[];
  criteria: {
    location: string;
    gender: Gender | null;
    sessionType: SessionType | null;
    insurance: Insurance[];
  };
}

type MatchingAction =
  | { type: "SET_STEP"; step: WizardStep }
  | { type: "TOGGLE_TOPIC"; topicId: string }
  | { type: "TOGGLE_SUBTOPIC"; subTopicId: string }
  | { type: "SET_LOCATION"; location: string }
  | { type: "SET_GENDER"; gender: Gender | null }
  | { type: "SET_SESSION_TYPE"; sessionType: SessionType | null }
  | { type: "TOGGLE_INSURANCE"; insurance: Insurance }
  | { type: "RESET" };

const initialState: MatchingState = {
  currentStep: 1,
  selectedTopics: [],
  selectedSubTopics: [],
  criteria: {
    location: "",
    gender: null,
    sessionType: null,
    insurance: [],
  },
};

function matchingReducer(
  state: MatchingState,
  action: MatchingAction
): MatchingState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };

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
    toggleTopic: (topicId: string) => void;
    toggleSubTopic: (subTopicId: string) => void;
    setLocation: (location: string) => void;
    setGender: (gender: Gender | null) => void;
    setSessionType: (sessionType: SessionType | null) => void;
    toggleInsurance: (insurance: Insurance) => void;
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

  const toggleTopic = useCallback((topicId: string) => {
    dispatch({ type: "TOGGLE_TOPIC", topicId });
  }, []);

  const toggleSubTopic = useCallback((subTopicId: string) => {
    dispatch({ type: "TOGGLE_SUBTOPIC", subTopicId });
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

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const goNext = useCallback(() => {
    if (state.currentStep < 3) {
      dispatch({ type: "SET_STEP", step: (state.currentStep + 1) as WizardStep });
    }
  }, [state.currentStep]);

  const goBack = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({ type: "SET_STEP", step: (state.currentStep - 1) as WizardStep });
    }
  }, [state.currentStep]);

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
        return state.selectedTopics.length > 0;
      case 2:
        return true; // All criteria are optional
      case 3:
        return true; // Can be skipped
      default:
        return false;
    }
  }, [state.currentStep, state.selectedTopics.length]);

  const progress = useMemo(() => {
    return ((state.currentStep - 1) / 2) * 100;
  }, [state.currentStep]);

  const value: MatchingContextValue = {
    state,
    actions: {
      setStep,
      toggleTopic,
      toggleSubTopic,
      setLocation,
      setGender,
      setSessionType,
      toggleInsurance,
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
