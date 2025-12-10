"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Sparkles, SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchingProvider, useMatching, type FreetextAnalysis } from "./matching-context";
import { PrecisionMeter } from "./precision-meter";
import { StepIndicator, TopicSelection, CriteriaSelection } from "./steps";
import { SuicideScreening } from "./steps/suicide-screening";
import { CrisisResources } from "./steps/crisis-resources";
import { IntensityAssessment } from "./steps/intensity-assessment";
import { SituationInput } from "./steps/situation-input";
import type { SituationAnalysis } from "@/lib/actions/analyze-situation";

function WizardContent() {
  const router = useRouter();
  const t = useTranslations();
  const { state, actions, computed } = useMatching();

  const stepLabels = {
    topics: t("matching.wizard.stepLabels.topics"),
    intensity: t("matching.wizard.stepLabels.intensity"),
    preferences: t("matching.wizard.stepLabels.preferences"),
  };

  // Determine step position for display (freetext counts as topics step)
  const getStepPosition = () => {
    if (state.currentStep === 0.75 || state.currentStep === 1) return 1;
    if (state.currentStep === 1.5) return 2;
    if (state.currentStep === 2) return 3;
    if (state.currentStep === 2.5) return 4;
    return 1;
  };

  const activeStepLabel =
    state.currentStep === 0.75 || state.currentStep === 1
      ? stepLabels.topics
      : state.currentStep === 1.5
        ? stepLabels.intensity
        : stepLabels.preferences;
  const stepPosition = getStepPosition();
  const totalSteps = 4; // Topics, Intensity, Preferences, Safety Check

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
      <div className="min-h-[100dvh] bg-gradient-to-b from-background via-background to-secondary/30">
        <div className="mx-auto flex min-h-[100dvh] max-w-4xl flex-col px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="flex-1 rounded-3xl border bg-card/80 p-4 sm:p-6 shadow-2xl backdrop-blur">
            <CrisisResources />
          </div>
        </div>
      </div>
    );
  }

  // Handle freetext analysis callback
  const handleFreetextAnalysis = (analysis: SituationAnalysis) => {
    const freetextAnalysis: FreetextAnalysis = {
      suggestedTopics: analysis.suggestedTopics,
      suggestedSubTopics: analysis.suggestedSubTopics,
      suggestedSpecialties: analysis.suggestedSpecialties,
      suggestedCommunicationStyle: analysis.suggestedCommunicationStyle,
      suggestedTherapyFocus: analysis.suggestedTherapyFocus,
      suggestedIntensityLevel: analysis.suggestedIntensityLevel,
      understandingSummary: analysis.understandingSummary,
      suggestedMethods: analysis.suggestedMethods,
      keywords: analysis.keywords,
    };
    actions.setFreetextAnalysis(freetextAnalysis);
    actions.applyFreetextAnalysis();
  };

  // Freetext analysis step (alternative to topic selection)
  if (state.currentStep === 0.75) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-background via-background to-secondary/30">
        <div className="mx-auto flex min-h-[100dvh] max-w-4xl flex-col px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="flex flex-1 flex-col rounded-3xl border bg-card/80 p-4 sm:p-6 shadow-2xl backdrop-blur">
            <SituationInput
              onAnalysisComplete={handleFreetextAnalysis}
              onSkip={actions.skipFreetext}
            />
          </div>
        </div>
      </div>
    );
  }

  // Screening step (at the end, before results)
  if (state.currentStep === 2.5) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-background via-background to-secondary/30">
        <div className="mx-auto flex min-h-[100dvh] max-w-4xl flex-col px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="flex flex-1 flex-col rounded-3xl border bg-card/80 p-4 sm:p-6 shadow-2xl backdrop-blur">
            <SuicideScreening />

            {/* Continue button when screening is completed safely */}
            {state.screeningCompleted && !state.crisisDetected && (
              <div className="mt-auto flex justify-center pt-4">
                <Button
                  onClick={handleShowResults}
                  className="w-full justify-center gap-2 bg-primary text-base hover:bg-primary/90 sm:w-auto"
                >
                  <Sparkles className="h-4 w-4" />
                  {t("matching.wizard.showResults")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      {/* Combined Header + Progress - single compact row */}
      <header className="shrink-0 border-b bg-card px-3 py-2 pt-[calc(0.5rem+env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/therapists")}
            className="h-7 w-7 shrink-0 p-0"
            aria-label={t("matching.wizard.close")}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Logo + Title */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="hidden text-sm font-semibold sm:inline">{t("matching.wizard.badge")}</span>
          </div>

          {/* Step Indicator - takes remaining space */}
          <div className="min-w-0 flex-1">
            <StepIndicator
              labels={stepLabels}
              optionalLabel={t("matching.intensity.optional")}
            />
          </div>

          {/* Precision Meter */}
          <div className="w-24 shrink-0">
            <PrecisionMeter compact />
          </div>
        </div>
      </header>

      {/* Main Content - scrollable if needed */}
      <main className="min-h-0 flex-1 overflow-auto px-3 py-2">
        <div className="mx-auto h-full max-w-6xl">
          {state.currentStep === 1 && <TopicSelection />}
          {state.currentStep === 1.5 && <IntensityAssessment />}
          {state.currentStep === 2 && <CriteriaSelection />}
        </div>
      </main>

      {/* Fixed Footer Navigation - more compact, with safe area for iOS */}
      <nav className="shrink-0 border-t bg-card px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.goBack}
            disabled={state.currentStep === 1}
            className="h-8 gap-1 px-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-sm">{t("matching.wizard.back")}</span>
          </Button>

          <div className="flex items-center gap-2">
            {state.currentStep === 1.5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={actions.skipIntensity}
                className="h-8 gap-1 px-2 text-muted-foreground"
              >
                <SkipForward className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-sm">{t("matching.wizard.skip")}</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={actions.goNext}
              disabled={!computed.canProceed}
              className="h-8 gap-1 px-3"
            >
              <span className="text-sm">{t("matching.wizard.next")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </nav>
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
