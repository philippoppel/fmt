"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Sparkles, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchingProvider, useMatching } from "./matching-context";
import { PrecisionMeter } from "./precision-meter";
import {
  StepIndicator,
  TopicSelection,
  CriteriaSelection,
} from "./steps";
import { TherapyStyleQuiz } from "./steps/therapy-style-quiz";
import { SuicideScreening } from "./steps/suicide-screening";
import { CrisisResources } from "./steps/crisis-resources";
import { IntensityAssessment } from "./steps/intensity-assessment";

function WizardContent() {
  const router = useRouter();
  const t = useTranslations();
  const { state, actions, computed } = useMatching();

  const handleShowResults = () => {
    // Encode matching data for URL
    const matchingData = {
      selectedTopics: state.selectedTopics,
      selectedSubTopics: state.selectedSubTopics,
      selectedIntensityStatements: state.selectedIntensityStatements,
      intensityScore: state.intensityScore,
      intensityLevel: state.intensityLevel,
      location: state.criteria.location,
      gender: state.criteria.gender,
      sessionType: state.criteria.sessionType,
      insurance: state.criteria.insurance,
      therapyStyle: state.therapyStyle,
    };

    // Store in sessionStorage for larger data
    sessionStorage.setItem("matchingCriteria", JSON.stringify(matchingData));

    // Navigate to search page with matching flag
    const params = new URLSearchParams();
    params.set("matching", "true");

    // Add basic filters to URL for sharing
    if (state.criteria.location) {
      params.set("location", state.criteria.location);
    }
    if (state.criteria.gender) {
      params.set("gender", state.criteria.gender);
    }
    if (state.criteria.sessionType) {
      params.set("sessionType", state.criteria.sessionType);
    }

    router.push(`/therapists?${params.toString()}`);
  };

  // If crisis detected, show crisis resources only
  if (state.crisisDetected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <CrisisResources />
        </div>
      </div>
    );
  }

  const stepLabels = {
    topics: t("matching.wizard.stepLabels.topics"),
    intensity: t("matching.wizard.stepLabels.intensity"),
    preferences: t("matching.wizard.stepLabels.preferences"),
    style: t("matching.wizard.stepLabels.style"),
  };

  // Screening step has no header/navigation
  if (state.currentStep === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <SuicideScreening />

          {/* Continue button when screening is completed safely */}
          {state.screeningCompleted && !state.crisisDetected && (
            <div className="mx-auto mt-8 max-w-xl text-center">
              <Button
                onClick={actions.goNext}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {t("matching.wizard.continue")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">
              {t("matching.wizard.badge")}
            </span>
          </div>
        </div>

        {/* Step Indicator (for steps 1-3, not showing screening) */}
        <StepIndicator labels={stepLabels} />

        {/* Precision Meter - motivates users to provide more info */}
        <div className="mx-auto mt-6 max-w-md">
          <PrecisionMeter />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {state.currentStep === 1 && <TopicSelection />}
          {state.currentStep === 1.5 && <IntensityAssessment />}
          {state.currentStep === 2 && <CriteriaSelection />}
          {state.currentStep === 3 && <TherapyStyleQuiz />}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={actions.goBack}
            disabled={state.currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("matching.wizard.back")}
          </Button>

          {/* Next/Skip/Results Buttons */}
          <div className="flex gap-2">
            {/* Skip button for intensity assessment */}
            {state.currentStep === 1.5 && (
              <Button
                variant="outline"
                onClick={actions.skipIntensity}
                className="gap-2"
              >
                <SkipForward className="h-4 w-4" />
                {t("matching.wizard.skip")}
              </Button>
            )}

            {/* Skip button for style quiz */}
            {state.currentStep === 3 && (
              <Button variant="outline" onClick={handleShowResults}>
                {t("matching.wizard.skip")}
              </Button>
            )}

            {state.currentStep < 3 ? (
              <Button
                onClick={actions.goNext}
                disabled={!computed.canProceed}
                className="gap-2"
              >
                {t("matching.wizard.next")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleShowResults}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4" />
                {t("matching.wizard.showResults")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MatchingWizard() {
  return (
    <MatchingProvider>
      <WizardContent />
    </MatchingProvider>
  );
}
