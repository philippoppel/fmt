"use client";

import { WizardV2Provider, useWizardV2 } from "./wizard-context";
import { StepProgress } from "./components/step-progress";
import { DisclaimerStep } from "./steps/disclaimer-step";
import { CategorySelection } from "./steps/category-selection";
import { SubcategorySelection } from "./steps/subcategory-selection";
import { SymptomQuestions } from "./steps/symptom-questions";
import { StylePreferences } from "./steps/style-preferences";
import { LogisticsStep } from "./steps/logistics-step";
import { ResultsStep } from "./steps/results-step";
import { CrisisScreen } from "./steps/crisis-screen";
import { Card, CardContent } from "@/components/ui/card";

function WizardContent() {
  const { state } = useWizardV2();

  // Show crisis screen if crisis is detected and not acknowledged
  if (state.crisisDetected && !state.crisisAcknowledged) {
    return <CrisisScreen />;
  }

  // Render step based on current step
  switch (state.currentStep) {
    case 0:
      return <DisclaimerStep />;
    case 1:
      return <CategorySelection />;
    case 2:
      return <SubcategorySelection />;
    case 3:
      return <SymptomQuestions />;
    case 4:
      return <StylePreferences />;
    case 5:
      return <LogisticsStep />;
    case 6:
      return <ResultsStep />;
    default:
      return <DisclaimerStep />;
  }
}

function WizardContainer() {
  const { state } = useWizardV2();

  // Don't show progress bar on disclaimer step or crisis screen
  const showProgress =
    state.currentStep > 0 &&
    !(state.crisisDetected && !state.crisisAcknowledged);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress indicator */}
      {showProgress && <StepProgress />}

      {/* Main content card */}
      <Card className="shadow-lg">
        <CardContent className="p-6 sm:p-8">
          <WizardContent />
        </CardContent>
      </Card>
    </div>
  );
}

export function WizardV2() {
  return (
    <WizardV2Provider>
      <WizardContainer />
    </WizardV2Provider>
  );
}
