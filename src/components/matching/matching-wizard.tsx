"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchingProvider, useMatching } from "./matching-context";
import {
  StepIndicator,
  TopicSelection,
  CriteriaSelection,
} from "./steps";
import { TherapyStyleQuiz } from "./steps/therapy-style-quiz";

function WizardContent() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const { state, actions, computed } = useMatching();

  const handleShowResults = () => {
    // Encode matching data for URL
    const matchingData = {
      selectedTopics: state.selectedTopics,
      selectedSubTopics: state.selectedSubTopics,
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

    router.push(`/${locale}/therapists?${params.toString()}`);
  };

  const stepLabels = {
    topics: t("matching.wizard.stepLabels.topics"),
    preferences: t("matching.wizard.stepLabels.preferences"),
    style: t("matching.wizard.stepLabels.style"),
  };

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

        {/* Step Indicator */}
        <StepIndicator labels={stepLabels} />

        {/* Step Content */}
        <div className="min-h-[400px]">
          {state.currentStep === 1 && <TopicSelection />}
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

          {/* Next/Results Button */}
          <div className="flex gap-2">
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
