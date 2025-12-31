// Main wizard component
export { WizardV2 } from "./wizard-v2";

// Context and types
export {
  WizardV2Provider,
  useWizardV2,
  type WizardStepV2,
  type WizardStateV2,
  type StyleStructure,
  type StyleEngagement,
  type MatchedTherapistV2,
  type MatchReason,
} from "./wizard-context";

// Steps (for direct use if needed)
export { DisclaimerStep } from "./steps/disclaimer-step";
export { CategorySelection } from "./steps/category-selection";
export { SubcategorySelection } from "./steps/subcategory-selection";
export { SymptomQuestions } from "./steps/symptom-questions";
export { StylePreferences } from "./steps/style-preferences";
export { LogisticsStep } from "./steps/logistics-step";
export { ResultsStep } from "./steps/results-step";
export { CrisisScreen } from "./steps/crisis-screen";

// Components
export { LikertScale } from "./components/likert-scale";
export { StepProgress } from "./components/step-progress";
