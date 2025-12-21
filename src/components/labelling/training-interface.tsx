"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, BarChart3, ChevronRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MATCHING_TOPICS } from "@/lib/matching/topics";
import { saveTrainingLabel, generateNewCase, getNextTrainingCase } from "@/lib/actions/labelling/training";
import Link from "next/link";

// Filter out "other" topic - we only want concrete categories
const TRAINING_TOPICS = MATCHING_TOPICS.filter((t) => t.id !== "other");

// German labels for topics
const TOPIC_LABELS: Record<string, string> = {
  family: "Familie",
  anxiety: "Angst",
  depression: "Depression",
  relationships: "Beziehungen",
  burnout: "Burnout",
  trauma: "Trauma",
  addiction: "Sucht",
  eating_disorders: "Essstörungen",
  adhd: "ADHS",
  self_care: "Selbstfürsorge",
  stress: "Stress",
  sleep: "Schlaf",
};

// German labels for subtopics
const SUBTOPIC_LABELS: Record<string, string> = {
  // Family
  divorce: "Scheidung",
  parenting: "Erziehung",
  family_conflicts: "Familienkonflikte",
  generation_conflicts: "Generationenkonflikte",
  // Anxiety
  social_anxiety: "Soziale Angst",
  panic_attacks: "Panikattacken",
  phobias: "Phobien",
  generalized_anxiety: "Generalisierte Angst",
  // Depression
  chronic_sadness: "Chronische Traurigkeit",
  lack_motivation: "Antriebslosigkeit",
  grief: "Trauer",
  loneliness: "Einsamkeit",
  // Relationships
  couple_conflicts: "Paarkonflikte",
  breakup: "Trennung",
  dating_issues: "Dating-Probleme",
  intimacy: "Intimität",
  // Burnout
  work_stress: "Arbeitsstress",
  exhaustion: "Erschöpfung",
  work_life_balance: "Work-Life-Balance",
  // Trauma
  ptsd: "PTBS",
  childhood_trauma: "Kindheitstrauma",
  accident_trauma: "Unfalltrauma",
  loss: "Verlust",
  // Addiction
  alcohol: "Alkohol",
  drugs: "Drogen",
  behavioral_addiction: "Verhaltenssucht",
  gaming: "Gaming",
  // Eating Disorders
  anorexia: "Anorexie",
  bulimia: "Bulimie",
  binge_eating: "Binge Eating",
  // ADHD
  concentration: "Konzentration",
  impulsivity: "Impulsivität",
  adult_adhd: "ADHS im Erwachsenenalter",
  // Self Care
  self_esteem: "Selbstwert",
  boundaries: "Grenzen setzen",
  life_changes: "Lebensveränderungen",
  // Stress
  chronic_stress: "Chronischer Stress",
  exam_anxiety: "Prüfungsangst",
  performance_pressure: "Leistungsdruck",
  // Sleep
  insomnia: "Schlaflosigkeit",
  nightmares: "Albträume",
  sleep_anxiety: "Einschlafangst",
};

interface TrainingCase {
  id: string;
  text: string;
}

interface TrainingStats {
  totalLabeled: number;
  todayLabeled: number;
  topCategories: { category: string; count: number }[];
}

interface TrainingInterfaceProps {
  initialCase: TrainingCase | null;
  stats: TrainingStats | null;
  userId: string;
  userName: string;
}

export function TrainingInterface({
  initialCase,
  stats,
  userId,
  userName,
}: TrainingInterfaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);

  const [currentCase, setCurrentCase] = useState<TrainingCase | null>(initialCase);
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [isUncertain, setIsUncertain] = useState(false);

  const toggleSubtopic = (subtopicId: string) => {
    setSelectedSubtopics((prev) => {
      if (prev.includes(subtopicId)) {
        return prev.filter((t) => t !== subtopicId);
      }
      if (prev.length >= 3) {
        // Max 3 subtopics - replace the last one
        return [...prev.slice(0, 2), subtopicId];
      }
      return [...prev, subtopicId];
    });
  };

  // Check if topic has any selected subtopics
  const getTopicSelectedCount = (topicId: string) => {
    const topic = TRAINING_TOPICS.find((t) => t.id === topicId);
    if (!topic) return 0;
    return topic.subTopics.filter((st) => selectedSubtopics.includes(st.id)).length;
  };

  const handleSaveAndNext = () => {
    if (!currentCase || selectedSubtopics.length === 0) return;

    setSaved(false);
    startTransition(async () => {
      // Save the label with subtopics
      const result = await saveTrainingLabel({
        caseId: currentCase.id,
        topics: selectedSubtopics,
        uncertain: isUncertain,
      });

      if (result.success) {
        setSaved(true);

        // Get next case
        const nextResult = await getNextTrainingCase();
        if (nextResult.success && nextResult.data) {
          setCurrentCase(nextResult.data);
          setSelectedSubtopics([]);
          setIsUncertain(false);
          setSaved(false);
        } else {
          // No more cases - generate new one
          setCurrentCase(null);
        }

        router.refresh();
      }
    });
  };

  const handleGenerateNew = () => {
    setIsGenerating(true);
    startTransition(async () => {
      const result = await generateNewCase();
      if (result.success && result.data) {
        setCurrentCase(result.data);
        setSelectedSubtopics([]);
        setIsUncertain(false);
      }
      setIsGenerating(false);
    });
  };

  // No case available - show generate button
  if (!currentCase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Keine Fälle verfügbar</h2>
          <p className="text-muted-foreground">
            Generiere einen neuen Trainingsfall mit KI
          </p>
        </div>
        <Button
          size="lg"
          onClick={handleGenerateNew}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
          Neuen Fall generieren
        </Button>

        {stats && stats.totalLabeled > 0 && (
          <Link href="/de/labelling">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {stats.totalLabeled} Fälle gelabelt - Statistik ansehen
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Hallo {userName.split(" ")[0]}!</h1>
          <p className="text-sm text-muted-foreground">
            {stats?.todayLabeled || 0} heute · {stats?.totalLabeled || 0} insgesamt
          </p>
        </div>
        <Link href="/de/labelling">
          <Button variant="outline" size="sm" className="gap-1">
            <BarChart3 className="h-4 w-4" />
            Statistik
          </Button>
        </Link>
      </div>

      {/* Kurze Erklärung für Therapeutinnen */}
      <div className="rounded-lg bg-muted/50 p-4 text-sm">
        <p className="font-medium mb-1">So funktioniert&apos;s:</p>
        <p className="text-muted-foreground">
          Lies den Text und wähle 1-3 Schwerpunkte, die du als Therapeut:in
          empfehlen würdest. Die Reihenfolge bestimmt die Priorität.
        </p>
      </div>

      {/* The case text */}
      <Card className="border-2">
        <CardContent className="p-6">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            &ldquo;{currentCase.text}&rdquo;
          </p>
        </CardContent>
      </Card>

      {/* Topic selection instruction */}
      <div className="text-center space-y-1">
        <p className="font-medium">Welche Schwerpunkte würdest du empfehlen?</p>
        <p className="text-sm text-muted-foreground">
          Wähle 1-3 passende Schwerpunkte (Reihenfolge = Priorität)
        </p>
      </div>

      {/* Flat subtopic selection - all visible */}
      <div className="space-y-4">
        {TRAINING_TOPICS.map((topic) => {
          const selectedCount = getTopicSelectedCount(topic.id);

          return (
            <div key={topic.id}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  "text-sm font-medium",
                  selectedCount > 0 ? "text-primary" : "text-muted-foreground"
                )}>
                  {TOPIC_LABELS[topic.id] || topic.id}
                </span>
                {selectedCount > 0 && (
                  <span className="text-xs text-primary">({selectedCount})</span>
                )}
              </div>

              {/* Subtopic chips */}
              <div className="flex flex-wrap gap-1.5">
                {topic.subTopics.map((subtopic) => {
                  const isSelected = selectedSubtopics.includes(subtopic.id);
                  const rank = selectedSubtopics.indexOf(subtopic.id) + 1;

                  return (
                    <button
                      key={subtopic.id}
                      type="button"
                      onClick={() => toggleSubtopic(subtopic.id)}
                      disabled={isPending}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      )}
                    >
                      {isSelected && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground/20 text-xs font-bold">
                          {rank}
                        </span>
                      )}
                      {SUBTOPIC_LABELS[subtopic.id] || subtopic.id}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected subtopics summary */}
      {selectedSubtopics.length > 0 && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
          <p className="text-xs text-muted-foreground mb-2">Deine Auswahl:</p>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedSubtopics.map((subtopicId, index) => (
              <Badge key={subtopicId} className="gap-1 bg-primary text-primary-foreground">
                <span className="font-bold">{index + 1}.</span>
                {SUBTOPIC_LABELS[subtopicId] || subtopicId}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Unsicher Checkbox */}
      <label className="flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
        <Checkbox
          checked={isUncertain}
          onCheckedChange={(checked) => setIsUncertain(checked === true)}
        />
        <span>Ich bin mir bei diesem Fall unsicher</span>
        <HelpCircle className="h-4 w-4" />
      </label>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          onClick={handleGenerateNew}
          disabled={isPending || isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Überspringen
        </Button>

        <Button
          size="lg"
          onClick={handleSaveAndNext}
          disabled={isPending || selectedSubtopics.length === 0}
          className="gap-2 min-w-[200px]"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Speichern & Weiter
        </Button>
      </div>

      {saved && (
        <p className="text-center text-sm text-green-600">
          Gespeichert!
        </p>
      )}
    </div>
  );
}
