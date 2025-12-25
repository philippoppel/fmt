"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchingProvider, useMatching, type WizardStep } from "./matching-context";
import { MatchCounter } from "./match-counter";
import { StepIndicator, TopicSelection, SubTopicSelection, CriteriaSelection } from "./steps";
import { SummaryStep } from "./steps/summary-step";
import { CrisisResources } from "./steps/crisis-resources";

function WizardContent() {
  const router = useRouter();
  const t = useTranslations();
  const { state, actions, computed } = useMatching();

  const stepLabels = {
    topics: t("matching.wizard.stepLabels.topics"),
    subtopics: t("matching.wizard.stepLabels.subtopics"),
    preferences: t("matching.wizard.stepLabels.preferences"),
    summary: t("matching.wizard.stepLabels.summary"),
  };

  // New step order: Topics (1) -> SubTopics (1.25) -> Criteria (2) -> Summary (2.5)
  const getStepPosition = () => {
    if (state.currentStep === 1) return 1;
    if (state.currentStep === 1.25) return 2;
    if (state.currentStep === 2) return 3;
    if (state.currentStep === 2.5) return 4;
    return 1;
  };

  const activeStepLabel =
    state.currentStep === 1
      ? stepLabels.topics
      : state.currentStep === 1.25
        ? stepLabels.subtopics
        : state.currentStep === 2
          ? stepLabels.preferences
          : stepLabels.summary;
  const stepPosition = getStepPosition();
  const totalSteps = 4; // Topics, SubTopics, Preferences, Summary

  // Handle navigation to specific step from summary
  const handleNavigateToStep = (step: WizardStep) => {
    actions.setStep(step);
  };

  const handleShowResults = () => {
    // Encode matching data for URL
    const matchingData = {
      selectedTopics: state.selectedTopics,
      selectedSubTopics: state.selectedSubTopics,
      otherTopicSpecialties: state.otherTopicSpecialties,
      location: state.criteria.location,
      gender: state.criteria.gender,
      sessionType: state.criteria.sessionType,
      insurance: state.criteria.insurance,
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

  // If crisis detected and not acknowledged, show crisis resources with option to continue
  if (state.crisisDetected && !state.crisisAcknowledged) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-background via-background to-secondary/30">
        <div className="mx-auto flex min-h-[100dvh] max-w-4xl flex-col px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="flex-1 rounded-3xl border bg-card/80 p-4 sm:p-6 shadow-2xl backdrop-blur">
            <CrisisResources onContinue={actions.acknowledgeCrisis} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      {/* Compact single-line header */}
      <header className="shrink-0 border-b bg-card/95 backdrop-blur-sm px-3 py-1.5 pt-[calc(0.375rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/therapists")}
            className="h-7 w-7 p-0 shrink-0"
            aria-label={t("matching.wizard.close")}
          >
            <X className="h-3.5 w-3.5" />
          </Button>

          {/* Step Indicator - takes remaining space */}
          <div className="flex-1 min-w-0">
            <StepIndicator
              labels={stepLabels}
              compact
            />
          </div>

          {/* Match Counter - inline in header */}
          <MatchCounter compact />
        </div>
      </header>

      {/* Main Content - scrollable if needed */}
      <main className="min-h-0 flex-1 overflow-auto px-3 py-2">
        <div className="mx-auto h-full max-w-6xl">
          {state.currentStep === 1 && <TopicSelection />}
          {state.currentStep === 1.25 && <SubTopicSelection />}
          {state.currentStep === 2 && <CriteriaSelection />}
          {state.currentStep === 2.5 && <SummaryStep onNavigateToStep={handleNavigateToStep} />}
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
            {state.currentStep === 2.5 ? (
              <Button
                size="sm"
                onClick={handleShowResults}
                className="h-8 gap-1.5 px-4 bg-primary"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-sm">{t("matching.wizard.showResults")}</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={actions.goNext}
                disabled={!computed.canProceed}
                className="h-8 gap-1 px-3"
              >
                <span className="text-sm">{t("matching.wizard.next")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

interface MatchingWizardProps {
  initialTopic?: string;
  /** Resume state from sessionStorage (for edit flow from results page) */
  resumeState?: Parameters<typeof MatchingProvider>[0]["resumeState"];
}

export function MatchingWizard({ initialTopic, resumeState }: MatchingWizardProps) {
  return (
    <MatchingProvider initialTopic={initialTopic} resumeState={resumeState}>
      <WizardContent />
    </MatchingProvider>
  );
}
