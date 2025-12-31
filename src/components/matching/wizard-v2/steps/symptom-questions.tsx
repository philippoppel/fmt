"use client";

import { ArrowRight, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useWizardV2 } from "../wizard-context";
import { LikertScale } from "../components/likert-scale";
import { getSymptomQuestions, type SeverityLevel } from "@/lib/matching/wizard-categories";

export function SymptomQuestions() {
  const { state, actions, computed } = useWizardV2();

  const { selectedCategory, selectedSubcategory, questionsToShow } = computed;

  // Get questions for the selected subcategory
  const allQuestions = state.selectedSubcategoryId
    ? getSymptomQuestions(state.selectedSubcategoryId)
    : [];

  // Filter to only show the questions determined by adaptive logic
  const visibleQuestions = allQuestions.filter((q) =>
    questionsToShow.includes(q.order)
  );

  const handleAnswer = (questionOrder: 1 | 2 | 3 | 4, value: SeverityLevel) => {
    actions.answerSymptom(questionOrder, value);
  };

  const getAnswerForQuestion = (order: 1 | 2 | 3 | 4): SeverityLevel | null => {
    const key = `q${order}` as keyof typeof state.symptomAnswers;
    return state.symptomAnswers[key];
  };

  const handleNext = () => {
    if (computed.canProceed) {
      actions.goNext();
    }
  };

  if (!selectedCategory || !selectedSubcategory) {
    return null;
  }

  // Show a hint about the adaptive logic
  const showAdaptiveHint =
    state.symptomAnswers.q1 !== null && state.adaptiveMode === "short";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {selectedCategory.labelDE} &middot; {selectedSubcategory.labelDE}
        </p>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Wie stark belastet dich das?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Bewerte auf einer Skala von 0 (gar nicht) bis 3 (sehr stark)
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {visibleQuestions.map((question, index) => {
          const answer = getAnswerForQuestion(question.order);
          const isAnswered = answer !== null;

          return (
            <Card
              key={question.id}
              className={cn(
                "transition-all duration-300",
                isAnswered ? "border-primary/30 bg-primary/5" : ""
              )}
            >
              <CardContent className="pt-5 pb-5">
                <div className="space-y-4">
                  {/* Question number and text */}
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed pt-1">
                      {question.textDE}
                    </p>
                  </div>

                  {/* Likert Scale */}
                  <div className="pl-11">
                    <LikertScale
                      value={answer}
                      onChange={(value) => handleAnswer(question.order, value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Adaptive mode hint */}
      {showAdaptiveHint && (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700">
          <HelpCircle className="h-4 w-4 mt-0.5 shrink-0 text-gray-500" />
          <span>
            Basierend auf deiner ersten Antwort haben wir die Fragen angepasst.
          </span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={actions.goBack}
          className="flex-1 sm:flex-none"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <Button
          onClick={handleNext}
          disabled={!computed.canProceed}
          className="flex-1 sm:flex-none sm:ml-auto"
        >
          Weiter
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
