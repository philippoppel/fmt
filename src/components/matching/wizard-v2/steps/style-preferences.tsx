"use client";

import { ArrowRight, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useWizardV2 } from "../wizard-context";
import type {
  StyleStructure,
  StyleEngagement,
  TherapyGoal,
  TimeOrientation,
  RelationshipVsMethod,
  Tempo,
  SafetyVsChallenge,
} from "../wizard-context";

// Option button component for single-select
interface OptionButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function OptionButton({ label, isSelected, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left",
        "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
      )}
    >
      {label}
    </button>
  );
}

// Question card component
interface QuestionCardProps {
  question: string;
  children: React.ReactNode;
}

function QuestionCard({ question, children }: QuestionCardProps) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5 space-y-4">
        <p className="text-gray-900 font-medium">{question}</p>
        <div className="space-y-2">{children}</div>
      </CardContent>
    </Card>
  );
}

export function StylePreferences() {
  const { state, actions, computed } = useWizardV2();

  const handleNext = () => {
    if (computed.canProceed) {
      actions.goNext();
    }
  };

  // Structure options
  const structureOptions: { value: StyleStructure; label: string }[] = [
    { value: "structured", label: "Klare Struktur & Übungen" },
    { value: "open", label: "Freies Erzählen" },
    { value: "mixed", label: "Mischung aus beidem" },
    { value: "unsure", label: "Bin mir unsicher" },
  ];

  // Engagement options
  const engagementOptions: { value: StyleEngagement; label: string }[] = [
    { value: "active", label: "Aktiv, mit viel Rückmeldung" },
    { value: "receptive", label: "Eher zuhören" },
    { value: "situational", label: "Situationsabhängig" },
    { value: "unsure", label: "Bin mir unsicher" },
  ];

  // Therapy goal options (P2 - evidence-based)
  const therapyGoalOptions: { value: TherapyGoal; label: string; description: string }[] = [
    {
      value: "symptom_relief",
      label: "Symptome lindern",
      description: "Konkrete Probleme lösen und Beschwerden reduzieren",
    },
    {
      value: "deep_understanding",
      label: "Verstehen & Aufarbeiten",
      description: "Ursachen erforschen und tiefgreifende Veränderung",
    },
    {
      value: "both",
      label: "Beides gleich wichtig",
      description: "Symptome lindern und Ursachen verstehen",
    },
  ];

  // Time orientation options (P3 - evidence-based)
  const timeOrientationOptions: { value: TimeOrientation; label: string }[] = [
    { value: "present", label: "Gegenwart: Aktuelle Situation und Alltag" },
    { value: "past", label: "Vergangenheit: Kindheit und Biografie" },
    { value: "holistic", label: "Beides: Ganzheitlich" },
  ];

  // Optional: Relationship vs Method options
  const relationshipOptions: { value: RelationshipVsMethod; label: string }[] = [
    { value: "relationship", label: "Die Beziehung zur Therapeut:in" },
    { value: "method", label: "Die angewandte Methode" },
    { value: "both", label: "Beides gleich wichtig" },
  ];

  // Optional: Tempo options
  const tempoOptions: { value: Tempo; label: string }[] = [
    { value: "fast", label: "Schnell vorankommen, auch wenn es herausfordernd ist" },
    { value: "slow", label: "Langsam und gründlich" },
    { value: "flexible", label: "Flexibel, je nach Situation" },
  ];

  // Optional: Safety vs Challenge options
  const safetyOptions: { value: SafetyVsChallenge; label: string }[] = [
    { value: "safety", label: "Sicherheit und Geborgenheit" },
    { value: "challenge", label: "Herausforderung und Wachstum" },
    { value: "balanced", label: "Eine Balance aus beidem" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          Dein Therapie-Stil
        </h2>
        <p className="text-gray-600">
          Was ist dir bei der Therapie wichtig?
        </p>
      </div>

      {/* Quick Preferences (always shown) */}
      <div className="space-y-4">
        {/* Structure preference */}
        <QuestionCard question="Wie sollte eine Sitzung ablaufen?">
          {structureOptions.map((option) => (
            <OptionButton
              key={option.value}
              label={option.label}
              isSelected={state.styleStructure === option.value}
              onClick={() => actions.setStyleStructure(option.value)}
            />
          ))}
        </QuestionCard>

        {/* Engagement preference */}
        <QuestionCard question="Wie soll die Therapeut:in agieren?">
          {engagementOptions.map((option) => (
            <OptionButton
              key={option.value}
              label={option.label}
              isSelected={state.styleEngagement === option.value}
              onClick={() => actions.setStyleEngagement(option.value)}
            />
          ))}
        </QuestionCard>

        {/* Therapy goal (P2 - evidence-based, critical for matching) */}
        <QuestionCard question="Was ist dein Hauptziel in der Therapie?">
          {therapyGoalOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => actions.setTherapyGoal(option.value)}
              className={cn(
                "w-full px-4 py-3 rounded-lg border text-left transition-all",
                "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                state.therapyGoal === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              )}
            >
              <span className={cn(
                "font-medium text-sm",
                state.therapyGoal === option.value ? "text-primary-foreground" : "text-gray-900"
              )}>
                {option.label}
              </span>
              <p className={cn(
                "text-xs mt-1",
                state.therapyGoal === option.value ? "text-primary-foreground/80" : "text-gray-500"
              )}>
                {option.description}
              </p>
            </button>
          ))}
        </QuestionCard>

        {/* Time orientation (P3 - evidence-based) */}
        <QuestionCard question="Worauf soll der Fokus liegen?">
          {timeOrientationOptions.map((option) => (
            <OptionButton
              key={option.value}
              label={option.label}
              isSelected={state.timeOrientation === option.value}
              onClick={() => actions.setTimeOrientation(option.value)}
            />
          ))}
        </QuestionCard>
      </div>

      {/* Toggle for optional preferences */}
      <Button
        variant="ghost"
        onClick={actions.toggleOptionalPreferences}
        className="w-full text-gray-500 hover:text-gray-900"
      >
        {state.showOptionalPreferences ? (
          <>
            <ChevronUp className="mr-2 h-4 w-4" />
            Weniger Optionen
          </>
        ) : (
          <>
            <ChevronDown className="mr-2 h-4 w-4" />
            Mehr Optionen (optional)
          </>
        )}
      </Button>

      {/* Optional Preferences (shown on toggle) */}
      {state.showOptionalPreferences && (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
          {/* Relationship vs Method */}
          <QuestionCard question="Was ist dir wichtiger?">
            {relationshipOptions.map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                isSelected={state.relationshipVsMethod === option.value}
                onClick={() => actions.setRelationshipVsMethod(option.value)}
              />
            ))}
          </QuestionCard>

          {/* Tempo */}
          <QuestionCard question="Welches Tempo bevorzugst du?">
            {tempoOptions.map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                isSelected={state.tempo === option.value}
                onClick={() => actions.setTempo(option.value)}
              />
            ))}
          </QuestionCard>

          {/* Safety vs Challenge */}
          <QuestionCard question="Was brauchst du mehr?">
            {safetyOptions.map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                isSelected={state.safetyVsChallenge === option.value}
                onClick={() => actions.setSafetyVsChallenge(option.value)}
              />
            ))}
          </QuestionCard>

          {/* Negative therapy experience checkbox */}
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="negative-experience"
                  checked={state.hadNegativeExperience}
                  onCheckedChange={(checked) =>
                    actions.setNegativeExperience(checked === true)
                  }
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="negative-experience"
                    className="text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    Ich hatte bereits negative Therapie-Erfahrungen
                  </Label>
                  <p className="text-xs text-gray-500">
                    Wir berücksichtigen dies bei der Empfehlung und achten auf
                    besonders einfühlsame Therapeut:innen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
