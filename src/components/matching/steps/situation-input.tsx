"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, CheckCircle2, Lightbulb, Phone, Heart } from "lucide-react";
import { analyzeSituation, type SituationAnalysis } from "@/lib/actions/analyze-situation";
import { cn } from "@/lib/utils";

interface SituationInputProps {
  onAnalysisComplete: (analysis: SituationAnalysis) => void;
  onSkip: () => void;
  onCrisisDetected?: () => void;
}

const EXAMPLE_PROMPTS = [
  "matching.freetext.example1",
  "matching.freetext.example2",
  "matching.freetext.example3",
];

export function SituationInput({ onAnalysisComplete, onSkip, onCrisisDetected }: SituationInputProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [text, setText] = useState(() => {
    // Load draft from sessionStorage if available
    if (typeof window !== "undefined") {
      const draft = sessionStorage.getItem("freetextDraft");
      if (draft) {
        sessionStorage.removeItem("freetextDraft");
        return draft;
      }
    }
    return "";
  });
  const [isPending, startTransition] = useTransition();
  const [analysis, setAnalysis] = useState<SituationAnalysis | null>(null);
  const [showExamples, setShowExamples] = useState(() => !text);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  const handleAnalyze = () => {
    if (text.trim().length < 10) return;

    startTransition(async () => {
      const result = await analyzeSituation(text);

      // If crisis detected, show immediate help
      if (result.crisisDetected) {
        setShowCrisisAlert(true);
        if (onCrisisDetected) {
          onCrisisDetected();
        }
        return;
      }

      setAnalysis(result);
      onAnalysisComplete(result);
    });
  };

  const handleExampleClick = (exampleKey: string) => {
    setText(t(exampleKey));
    setShowExamples(false);
  };

  // Crisis hotline numbers
  const crisisHotline = "0800 111 0 111";
  const crisisHotlineAlt = "0800 111 0 222";

  // If crisis detected, show immediate help in same style as screening questions
  if (showCrisisAlert) {
    return (
      <div className="space-y-6">
        {/* Header - same style as screening */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {locale === "de" ? "Du bist nicht allein" : "You're not alone"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            {locale === "de"
              ? "Bitte wende dich an professionelle Hilfe."
              : "Please reach out to professional help."}
          </p>
        </div>

        <div className="mx-auto max-w-xl space-y-6">
          {/* Notice box - high contrast */}
          <div className="rounded-lg border-2 border-red-500 bg-white p-4 dark:border-red-600 dark:bg-red-950/40">
            <div className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                {locale === "de"
                  ? "Kostenlose & anonyme Hilfe, rund um die Uhr erreichbar."
                  : "Free & anonymous help, available 24/7."}
              </p>
            </div>
          </div>

          {/* Hotline buttons - high contrast */}
          <div className="space-y-3">
            <p className="text-base font-semibold leading-relaxed">
              {locale === "de" ? "Telefonseelsorge anrufen:" : "Call crisis hotline:"}
            </p>
            <a
              href={`tel:${crisisHotline.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-600 bg-red-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              <Phone className="h-5 w-5" />
              {crisisHotline}
            </a>
            <a
              href={`tel:${crisisHotlineAlt.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-500 bg-white px-6 py-4 text-lg font-bold text-red-700 transition-all hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-red-600 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-950/70"
            >
              <Phone className="h-5 w-5" />
              {crisisHotlineAlt}
            </a>
          </div>

          {/* Online option */}
          <div className="space-y-3">
            <p className="text-base font-semibold leading-relaxed">
              {locale === "de" ? "Oder schriftlich:" : "Or in writing:"}
            </p>
            <a
              href="https://online.telefonseelsorge.de"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-amber-600 bg-white px-6 py-4 text-lg font-bold text-amber-800 transition-all hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-950/70"
            >
              {locale === "de" ? "Online-Beratung (Chat/E-Mail)" : "Online counseling (Chat/Email)"}
            </a>
          </div>

          {/* Info box - high contrast */}
          <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4 text-center dark:border-green-600 dark:bg-green-950/30">
            <p className="text-sm font-semibold text-green-800 dark:text-green-200">
              {locale === "de"
                ? "24/7 erreichbar • Kostenlos • Anonym"
                : "Available 24/7 • Free • Anonymous"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
          <Search className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {t("matching.freetext.badge")}
          </span>
        </div>
        <h2 className="text-xl font-bold sm:text-2xl">
          {t("matching.freetext.title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
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
                        {t(`matching.freetext.methods.${method}`)}
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
              <Search className="h-4 w-4" />
              {t("matching.freetext.analyze")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
