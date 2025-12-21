"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, Loader2, Sparkles, BarChart3, ChevronRight } from "lucide-react";
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
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((t) => t !== topicId);
      }
      if (prev.length >= 3) {
        // Max 3 topics - replace the last one
        return [...prev.slice(0, 2), topicId];
      }
      return [...prev, topicId];
    });
  };

  const handleSaveAndNext = () => {
    if (!currentCase || selectedTopics.length === 0) return;

    setSaved(false);
    startTransition(async () => {
      // Save the label
      const result = await saveTrainingLabel({
        caseId: currentCase.id,
        topics: selectedTopics,
      });

      if (result.success) {
        setSaved(true);

        // Get next case
        const nextResult = await getNextTrainingCase();
        if (nextResult.success && nextResult.data) {
          setCurrentCase(nextResult.data);
          setSelectedTopics([]);
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
        setSelectedTopics([]);
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
          Wähle 1-3 passende Themen (Reihenfolge = Priorität)
        </p>
      </div>

      {/* Topic grid - like matching wizard */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {TRAINING_TOPICS.map((topic) => {
          const isSelected = selectedTopics.includes(topic.id);
          const rank = selectedTopics.indexOf(topic.id) + 1;

          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => toggleTopic(topic.id)}
              disabled={isPending}
              className={cn(
                "group relative aspect-[4/3] w-full overflow-hidden rounded-lg border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isSelected
                  ? "border-primary ring-4 ring-primary/40 shadow-lg scale-[1.02]"
                  : "border-transparent hover:border-primary/40"
              )}
            >
              {/* Background Image */}
              <Image
                src={getTopicImageUrl(topic.unsplashId, 200, 150)}
                alt=""
                fill
                className={cn(
                  "object-cover transition-all duration-200",
                  isSelected && "brightness-110"
                )}
                sizes="(max-width: 640px) 33vw, 16vw"
              />

              {/* Gradient Overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-all duration-200",
                  isSelected && "from-primary/90 via-primary/30 to-primary/10"
                )}
              />

              {/* Rank badge or checkmark */}
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
                  {TOPIC_LABELS[topic.id] || topic.id}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected topics summary */}
      {selectedTopics.length > 0 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {selectedTopics.map((topicId, index) => (
            <Badge key={topicId} variant="secondary" className="gap-1">
              <span className="font-bold">{index + 1}.</span>
              {TOPIC_LABELS[topicId]}
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
          disabled={isPending || selectedTopics.length === 0}
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
