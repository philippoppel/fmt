"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Sparkles, SkipForward } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8 sm:py-12">
          <div className="flex-1 rounded-3xl border bg-card/80 p-6 shadow-2xl backdrop-blur">
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
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8 sm:py-12">
          <div className="flex flex-1 flex-col rounded-3xl border bg-card/80 p-6 shadow-2xl backdrop-blur">
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
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8 sm:py-12">
          <div className="flex flex-1 flex-col rounded-3xl border bg-card/80 p-6 shadow-2xl backdrop-blur">
            <SuicideScreening />

            {/* Continue button when screening is completed safely */}
            {state.screeningCompleted && !state.crisisDetected && (
              <div className="mt-auto flex justify-center pt-6">
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
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-6 sm:py-10">
        {/* Compact Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{t("matching.wizard.badge")}</h1>
              <p className="text-sm text-muted-foreground">
                {t("matching.wizard.stepLabels.topics")} → {t("matching.wizard.stepLabels.preferences")}
              </p>
            </div>
          </div>
          <div className="w-36">
            <PrecisionMeter compact />
          </div>
        </header>

        {/* Progress Steps */}
        <div className="mb-8">
          <StepIndicator
            labels={stepLabels}
            optionalLabel={t("matching.intensity.optional")}
          />
        </div>

        {/* Main Content Card */}
        <main className="flex flex-1 flex-col rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex-1 overflow-auto">
            {state.currentStep === 1 && <TopicSelection />}
            {state.currentStep === 1.5 && <IntensityAssessment />}
            {state.currentStep === 2 && <CriteriaSelection />}
          </div>

          {/* Single Navigation Bar */}
          <nav className="mt-6 flex items-center justify-between border-t pt-6">
            <Button
              variant="ghost"
              onClick={actions.goBack}
              disabled={state.currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("matching.wizard.back")}
            </Button>

            <div className="flex items-center gap-3">
              {/* Step indicator pill */}
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {stepPosition} / {totalSteps}
              </span>

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

              <Button
                onClick={actions.goNext}
                disabled={!computed.canProceed}
                className="gap-2"
              >
                {t("matching.wizard.next")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </nav>
        </main>
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
