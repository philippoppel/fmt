"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, Loader2, Sparkles, BarChart3, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MATCHING_TOPICS, getTopicImageUrl } from "@/lib/matching/topics";
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
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

  const toggleTopicExpansion = (topicId: string) => {
    setExpandedTopic((prev) => (prev === topicId ? null : topicId));
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
      });

      if (result.success) {
        setSaved(true);

        // Get next case
        const nextResult = await getNextTrainingCase();
        if (nextResult.success && nextResult.data) {
          setCurrentCase(nextResult.data);
          setSelectedSubtopics([]);
          setExpandedTopic(null);
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
        setExpandedTopic(null);
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
          Klicke auf eine Kategorie und wähle 1-3 passende Schwerpunkte
        </p>
      </div>

      {/* Expandable topic sections */}
      <div className="space-y-2">
        {TRAINING_TOPICS.map((topic) => {
          const isExpanded = expandedTopic === topic.id;
          const selectedCount = getTopicSelectedCount(topic.id);

          return (
            <div
              key={topic.id}
              className={cn(
                "rounded-lg border-2 transition-all overflow-hidden",
                isExpanded
                  ? "border-primary bg-primary/5"
                  : selectedCount > 0
                    ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                    : "border-muted hover:border-muted-foreground/30"
              )}
            >
              {/* Topic Header - clickable to expand */}
              <button
                type="button"
                onClick={() => toggleTopicExpansion(topic.id)}
                disabled={isPending}
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                {/* Topic thumbnail */}
                <div className="relative h-12 w-16 shrink-0 rounded overflow-hidden">
                  <Image
                    src={getTopicImageUrl(topic.unsplashId, 100, 75)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                {/* Topic name & selection count */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-semibold truncate",
                    isExpanded && "text-primary"
                  )}>
                    {TOPIC_LABELS[topic.id] || topic.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {topic.subTopics.length} Schwerpunkte
                  </p>
                </div>

                {/* Selection badge */}
                {selectedCount > 0 && (
                  <Badge variant="secondary" className="shrink-0 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {selectedCount} gewählt
                  </Badge>
                )}

                {/* Expand indicator */}
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform shrink-0",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>

              {/* Expanded Subtopics Grid */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-border/50">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
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
                            "group relative aspect-[4/3] w-full overflow-hidden rounded-lg border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            isSelected
                              ? "border-primary ring-4 ring-primary/40 shadow-lg scale-[1.02]"
                              : "border-transparent hover:border-primary/40"
                          )}
                        >
                          {/* Background Image */}
                          {subtopic.unsplashId && (
                            <Image
                              src={getTopicImageUrl(subtopic.unsplashId, 200, 150)}
                              alt=""
                              fill
                              className={cn(
                                "object-cover transition-all duration-200",
                                isSelected && "brightness-110"
                              )}
                              sizes="(max-width: 640px) 50vw, 25vw"
                            />
                          )}

                          {/* Gradient Overlay */}
                          <div
                            className={cn(
                              "absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-all duration-200",
                              isSelected && "from-primary/90 via-primary/30 to-primary/10"
                            )}
                          />

                          {/* Rank badge */}
                          {isSelected && (
                            <div className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg text-xs font-bold">
                              {rank}
                            </div>
                          )}

                          {/* Label */}
                          <div className={cn(
                            "absolute inset-x-0 bottom-0 p-1.5",
                            isSelected && "bg-primary/20 backdrop-blur-[2px]"
                          )}>
                            <span className="text-xs font-semibold text-white drop-shadow-md">
                              {SUBTOPIC_LABELS[subtopic.id] || subtopic.id}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected subtopics summary */}
      {selectedSubtopics.length > 0 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {selectedSubtopics.map((subtopicId, index) => (
            <Badge key={subtopicId} variant="secondary" className="gap-1">
              <span className="font-bold">{index + 1}.</span>
              {SUBTOPIC_LABELS[subtopicId] || subtopicId}
            </Badge>
          ))}
        </div>
      )}

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
