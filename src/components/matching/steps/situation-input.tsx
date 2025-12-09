"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle2, Lightbulb } from "lucide-react";
import { analyzeSituation, type SituationAnalysis } from "@/lib/actions/analyze-situation";
import { cn } from "@/lib/utils";

interface SituationInputProps {
  onAnalysisComplete: (analysis: SituationAnalysis) => void;
  onSkip: () => void;
}

const EXAMPLE_PROMPTS = [
  "matching.freetext.example1",
  "matching.freetext.example2",
  "matching.freetext.example3",
];

export function SituationInput({ onAnalysisComplete, onSkip }: SituationInputProps) {
  const t = useTranslations();
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [analysis, setAnalysis] = useState<SituationAnalysis | null>(null);
  const [showExamples, setShowExamples] = useState(true);

  const handleAnalyze = () => {
    if (text.trim().length < 10) return;

    startTransition(async () => {
      const result = await analyzeSituation(text);
      setAnalysis(result);
      onAnalysisComplete(result);
    });
  };

  const handleExampleClick = (exampleKey: string) => {
    setText(t(exampleKey));
    setShowExamples(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            {t("matching.freetext.badge")}
          </span>
        </div>
        <h2 className="text-xl font-bold sm:text-2xl">
          {t("matching.freetext.title")}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t("matching.freetext.subtitle")}
        </p>
      </div>

      {/* Textarea */}
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setText(e.target.value);
            setShowExamples(false);
            setAnalysis(null);
          }}
          placeholder={t("matching.freetext.placeholder")}
          className="min-h-[150px] resize-none text-base"
          disabled={isPending}
        />
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {text.length}/500
        </div>
      </div>

      {/* Example Prompts */}
      {showExamples && text.length === 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="h-4 w-4" />
            <span>{t("matching.freetext.examples")}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((key, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(key)}
                className="rounded-full border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t(key).slice(0, 40)}...
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Result */}
      {analysis && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
            <div className="space-y-3">
              <p className="font-medium text-foreground">
                {analysis.understandingSummary}
              </p>

              {analysis.suggestedTopics.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("matching.freetext.detectedTopics")}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.suggestedTopics.slice(0, 4).map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {t(`matching.topics.${topic}`)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.suggestedMethods.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("matching.freetext.suggestedMethods")}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.suggestedMethods.slice(0, 3).map((method) => (
                      <Badge key={method} variant="outline" className="text-xs">
                        {method.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button
          variant="ghost"
          onClick={onSkip}
          disabled={isPending}
        >
          {t("matching.freetext.skip")}
        </Button>

        <Button
          onClick={handleAnalyze}
          disabled={text.trim().length < 10 || isPending}
          className={cn(
            "gap-2",
            analysis && "bg-green-600 hover:bg-green-700"
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("matching.freetext.analyzing")}
            </>
          ) : analysis ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              {t("matching.freetext.continue")}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {t("matching.freetext.analyze")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
