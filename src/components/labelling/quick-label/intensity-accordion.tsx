"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TOPIC_LABELS } from "./category-card";
import { INTENSITY_STATEMENTS } from "@/lib/matching/intensity";

// German labels for intensity statements
const INTENSITY_LABELS: Record<string, string> = {
  // Depression
  dep_daily: "Ich fühle mich fast jeden Tag so",
  dep_sleep: "Ich habe Schlafprobleme deswegen",
  dep_work: "Es beeinträchtigt meine Arbeit/Studium",
  dep_isolation: "Ich ziehe mich von anderen zurück",
  dep_hopeless: "Ich fühle mich hoffnungslos",
  // Anxiety
  anx_daily: "Ich habe fast täglich Angst",
  anx_avoid: "Ich vermeide bestimmte Situationen",
  anx_physical: "Ich habe körperliche Symptome",
  anx_panic: "Ich habe Panikattacken",
  anx_work: "Es beeinträchtigt meinen Alltag",
  // Family
  fam_daily: "Die Konflikte sind allgegenwärtig",
  fam_communication: "Wir können nicht mehr reden",
  fam_avoidance: "Ich meide den Kontakt",
  fam_children: "Kinder sind betroffen",
  // Relationships
  rel_daily: "Es belastet mich täglich",
  rel_trust: "Das Vertrauen ist erschüttert",
  rel_communication: "Wir reden aneinander vorbei",
  rel_separation: "Trennung steht im Raum",
  // Burnout
  burn_exhausted: "Ich fühle mich ständig erschöpft",
  burn_work: "Ich funktioniere nur noch",
  burn_cynical: "Ich bin zynisch geworden",
  burn_physical: "Ich habe körperliche Beschwerden",
  burn_weekend: "Auch am Wochenende keine Erholung",
  // Trauma
  trauma_flashbacks: "Ich habe Flashbacks oder Albträume",
  trauma_avoid: "Ich vermeide Erinnerungen",
  trauma_sleep: "Mein Schlaf ist gestört",
  trauma_trust: "Ich kann niemandem vertrauen",
  trauma_daily: "Es beeinflusst meinen Alltag stark",
  // Addiction
  add_control: "Ich habe die Kontrolle verloren",
  add_daily: "Ich konsumiere täglich",
  add_relationships: "Es belastet meine Beziehungen",
  add_withdrawal: "Ich habe Entzugserscheinungen",
  add_hide: "Ich verstecke mein Verhalten",
  // Eating Disorders
  eat_thoughts: "Gedanken ums Essen beherrschen mich",
  eat_control: "Ich kontrolliere obsessiv",
  eat_physical: "Es hat körperliche Folgen",
  eat_social: "Ich meide gemeinsames Essen",
  // ADHD
  adhd_focus: "Ich kann mich nicht konzentrieren",
  adhd_organize: "Organisation fällt mir sehr schwer",
  adhd_impulsive: "Ich handle oft impulsiv",
  adhd_work: "Es beeinträchtigt meine Arbeit",
  adhd_relationships: "Es belastet meine Beziehungen",
  // Self Care
  self_worth: "Ich zweifle an meinem Wert",
  self_boundaries: "Ich kann keine Grenzen setzen",
  self_neglect: "Ich vernachlässige mich selbst",
  self_overwhelm: "Ich fühle mich überfordert",
  // Stress
  stress_constant: "Der Stress ist ständig da",
  stress_physical: "Ich habe körperliche Symptome",
  stress_sleep: "Ich kann nicht mehr abschalten",
  stress_control: "Ich habe das Gefühl die Kontrolle zu verlieren",
  // Sleep
  sleep_falling: "Ich kann nicht einschlafen",
  sleep_staying: "Ich wache nachts oft auf",
  sleep_daily: "Ich bin tagsüber ständig müde",
  sleep_nightmares: "Ich habe Albträume",
  sleep_medication: "Ich brauche Schlafmittel",
};

export { INTENSITY_LABELS };

interface IntensityAccordionProps {
  categoryKey: string;
  selectedIntensity: string[];
  suggestedIntensity?: string[];
  onToggle: (intensityId: string) => void;
  defaultOpen?: boolean;
  disabled?: boolean;
}

/**
 * Collapsible intensity question selection for a category
 */
export function IntensityAccordion({
  categoryKey,
  selectedIntensity,
  suggestedIntensity = [],
  onToggle,
  defaultOpen = false,
  disabled = false,
}: IntensityAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Get intensity statements for this category
  const statements = INTENSITY_STATEMENTS[categoryKey] || [];

  if (statements.length === 0) {
    return null;
  }

  const categoryLabel = TOPIC_LABELS[categoryKey] || categoryKey;
  const selectedCount = selectedIntensity.filter((id) =>
    statements.some((s) => s.id === id)
  ).length;

  return (
    <div className="rounded-lg border border-border">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between p-3",
          "min-h-[44px] touch-manipulation",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        )}
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Intensität: {categoryLabel}
          </span>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedCount}
            </Badge>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-border p-3 space-y-2">
          {statements.map((statement) => {
            const isSelected = selectedIntensity.includes(statement.id);
            const isSuggested = suggestedIntensity.includes(statement.id);
            const label = INTENSITY_LABELS[statement.id] || statement.id;

            return (
              <label
                key={statement.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg p-2 cursor-pointer transition-colors",
                  "min-h-[44px] touch-manipulation",
                  isSelected && "bg-primary/5",
                  isSuggested && !isSelected && "bg-primary/5 ring-1 ring-primary/20",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => !disabled && onToggle(statement.id)}
                  disabled={disabled}
                  className="mt-0.5"
                />
                <span className="text-sm leading-snug">{label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
