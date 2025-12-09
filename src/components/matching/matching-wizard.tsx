"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Sparkles, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchingProvider, useMatching } from "./matching-context";
import { PrecisionMeter } from "./precision-meter";
import { StepIndicator, TopicSelection, CriteriaSelection } from "./steps";
import { SuicideScreening } from "./steps/suicide-screening";
import { CrisisResources } from "./steps/crisis-resources";
import { IntensityAssessment } from "./steps/intensity-assessment";

function WizardContent() {
  const router = useRouter();
  const t = useTranslations();
  const { state, actions, computed } = useMatching();

  const stepLabels = {
    topics: t("matching.wizard.stepLabels.topics"),
    intensity: t("matching.wizard.stepLabels.intensity"),
    preferences: t("matching.wizard.stepLabels.preferences"),
  };

  const activeStepLabel =
    state.currentStep === 1
      ? stepLabels.topics
      : state.currentStep === 1.5
        ? stepLabels.intensity
        : stepLabels.preferences;
  const stepPosition =
    state.currentStep === 1 ? 1 : state.currentStep === 1.5 ? 2 : 3;
  const totalSteps = 3;

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

  // Screening step has its own flow
  if (state.currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8 sm:py-12">
          <div className="flex flex-1 flex-col rounded-3xl border bg-card/80 p-6 shadow-2xl backdrop-blur">
            <SuicideScreening />

            {/* Continue button when screening is completed safely */}
            {state.screeningCompleted && !state.crisisDetected && (
              <div className="mt-auto flex justify-center pt-6">
                <Button
                  onClick={actions.goNext}
                  className="w-full justify-center gap-2 bg-primary text-base hover:bg-primary/90 sm:w-auto"
                >
                  {t("matching.wizard.continue")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-3 py-4 sm:px-4 sm:py-6">
        <div className="flex h-[calc(100vh-2rem)] flex-1 flex-col gap-4 rounded-3xl border bg-card/80 p-3 sm:p-5 shadow-2xl backdrop-blur">
          {/* Shell Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/40 px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("matching.wizard.badge")}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {stepLabels.topics} • {stepLabels.intensity} • {stepLabels.preferences}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1 text-[11px] font-semibold text-muted-foreground">
              <span className="text-primary">
                {stepPosition}/{totalSteps}
              </span>
              <span className="hidden sm:inline">· {activeStepLabel}</span>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[280px,1fr]">
            {/* Progress rail */}
            <aside className="min-h-0 flex flex-col gap-3 rounded-2xl border bg-card/70 p-3 shadow-inner">
              <div className="overflow-auto pr-1">
                <StepIndicator
                  labels={stepLabels}
                  optionalLabel={t("matching.intensity.optional")}
                />
              </div>
              <div className="rounded-xl border bg-background/80 p-3">
                <PrecisionMeter compact />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t("matching.wizard.allOptional")}
              </p>
            </aside>

            {/* Step content */}
            <section className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-card p-4 sm:p-5 shadow-lg">
              {/* Top controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={actions.goBack}
                    disabled={state.currentStep === 1}
                    className="gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("matching.wizard.back")}
                  </Button>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                    {stepPosition}/{totalSteps}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {activeStepLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {state.currentStep === 1.5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={actions.skipIntensity}
                      className="gap-2"
                    >
                      <SkipForward className="h-4 w-4" />
                      {t("matching.wizard.skip")}
                    </Button>
                  )}
                  {state.currentStep < 2 ? (
                    <Button
                      size="sm"
                      onClick={actions.goNext}
                      disabled={!computed.canProceed}
                      className="gap-2"
                    >
                      {t("matching.wizard.next")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleShowResults}
                      className="gap-2 bg-primary hover:bg-primary/90"
                    >
                      <Sparkles className="h-4 w-4" />
                      {t("matching.wizard.showResults")}
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                {state.currentStep === 1 && <TopicSelection />}
                {state.currentStep === 1.5 && <IntensityAssessment />}
                {state.currentStep === 2 && <CriteriaSelection />}
              </div>

              {/* Navigation */}
              <div className="sticky bottom-0 left-0 right-0 mt-3 flex flex-col gap-3 border-t bg-card/90 pb-1 pt-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="outline"
                  onClick={actions.goBack}
                  disabled={state.currentStep === 1}
                  className="w-full justify-center gap-2 sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("matching.wizard.back")}
                </Button>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  {state.currentStep === 1.5 && (
                    <Button
                      variant="outline"
                      onClick={actions.skipIntensity}
                      className="w-full justify-center gap-2 sm:w-auto"
                    >
                      <SkipForward className="h-4 w-4" />
                      {t("matching.wizard.skip")}
                    </Button>
                  )}

                  {state.currentStep < 2 ? (
                    <Button
                      onClick={actions.goNext}
                      disabled={!computed.canProceed}
                      className="w-full justify-center gap-2 sm:w-auto"
                    >
                      {t("matching.wizard.next")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleShowResults}
                      className="w-full justify-center gap-2 bg-primary hover:bg-primary/90 sm:w-auto"
                    >
                      <Sparkles className="h-4 w-4" />
                      {t("matching.wizard.showResults")}
                    </Button>
                  )}
                </div>
              </div>
            </section>
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
