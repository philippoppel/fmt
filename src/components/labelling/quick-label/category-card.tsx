"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

export { TOPIC_LABELS, SUBTOPIC_LABELS };

interface CategoryCardProps {
  categoryKey: string;
  rank: 1 | 2 | 3;
  confidence: number;
  suggestedSubtopics?: string[];
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

/**
 * Category suggestion card with rank, confidence, and selection
 */
export function CategoryCard({
  categoryKey,
  rank,
  confidence,
  suggestedSubtopics = [],
  isSelected,
  onToggle,
  disabled = false,
}: CategoryCardProps) {
  const label = TOPIC_LABELS[categoryKey] || categoryKey;
  const confidencePercent = Math.round(confidence * 100);

  // Format subtopics for display
  const subtopicText = suggestedSubtopics
    .slice(0, 2)
    .map((key) => SUBTOPIC_LABELS[key] || key)
    .join(", ");

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "w-full rounded-xl border-2 p-4 text-left transition-all",
        "min-h-[72px] touch-manipulation",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/50 hover:bg-muted/50",
        disabled && "cursor-not-allowed opacity-50"
      )}
      data-testid="category-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Rank badge */}
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                rank === 1 && "bg-primary text-primary-foreground",
                rank === 2 && "bg-secondary text-secondary-foreground",
                rank === 3 && "bg-muted text-muted-foreground"
              )}
            >
              #{rank}
            </span>
            {/* Category name */}
            <span className="font-semibold text-foreground truncate">
              {label}
            </span>
          </div>
          {/* Suggested subtopics */}
          {subtopicText && (
            <p className="mt-1 text-sm text-muted-foreground truncate pl-8">
              {subtopicText}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Confidence chip */}
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              confidencePercent >= 80 && "bg-green-100 text-green-700",
              confidencePercent >= 60 &&
                confidencePercent < 80 &&
                "bg-yellow-100 text-yellow-700",
              confidencePercent < 60 && "bg-gray-100 text-gray-600"
            )}
          >
            {confidencePercent}%
          </Badge>

          {/* Selection indicator */}
          {isSelected && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
