"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Check, Sparkles, Loader2, MessageSquareText, ArrowRight, CheckCircle2, RefreshCw, Phone, Heart, HelpCircle, Info, ChevronDown, ChevronUp, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTopicImageUrl, type SubTopic, type Topic } from "@/lib/matching/topics";
import { useMatching } from "../matching-context";
import { Textarea } from "@/components/ui/textarea";
import { matchFreetextToSpecialties, type SpecialtyMatchResult } from "@/lib/actions/analyze-situation";

// Specialty labels for client-side display
const SPECIALTY_LABELS: Record<string, { de: string; en: string }> = {
  depression: { de: "Depression", en: "Depression" },
  anxiety: { de: "Angst & Panik", en: "Anxiety & Panic" },
  trauma: { de: "Trauma", en: "Trauma" },
  relationships: { de: "Beziehungen", en: "Relationships" },
  addiction: { de: "Sucht", en: "Addiction" },
  eating_disorders: { de: "Essstörungen", en: "Eating Disorders" },
  adhd: { de: "ADHS", en: "ADHD" },
  burnout: { de: "Burnout", en: "Burnout" },
};

function getSpecialtyLabel(id: string, lang: "de" | "en" = "de"): string {
  return SPECIALTY_LABELS[id]?.[lang] || id;
}

interface SubTopicCardProps {
  subTopic: SubTopic;
  label: string;
  isSelected: boolean;
  onToggle: () => void;
}

function SubTopicCard({ subTopic, label, isSelected, onToggle }: SubTopicCardProps) {
  const imageUrl = subTopic.unsplashId
    ? getTopicImageUrl(subTopic.unsplashId, 200, 150)
    : null;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group relative aspect-[4/3] h-full w-full overflow-hidden rounded-lg border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        isSelected
          ? "border-primary ring-4 ring-primary/40 shadow-lg shadow-primary/25 scale-[1.02]"
          : "border-transparent hover:border-primary/40"
      )}
      aria-pressed={isSelected}
    >
      {/* Background Image or Fallback */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          className={cn("object-cover transition-all duration-200", isSelected && "brightness-110")}
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
      )}

      {/* Gradient Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-all duration-200",
          isSelected && "from-primary/90 via-primary/30 to-primary/10"
        )}
        aria-hidden="true"
      />

      {/* Selected Checkmark - larger and more prominent */}
      {isSelected && (
        <div
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
          aria-hidden="true"
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </div>
      )}

      {/* Label */}
      <div className={cn(
        "absolute inset-x-0 bottom-0 p-2 transition-all duration-200",
        isSelected && "bg-primary/20 backdrop-blur-[2px]"
      )}>
        <span className={cn(
          "text-xs font-semibold text-white drop-shadow-md sm:text-sm",
          isSelected && "text-white"
        )}>
          {label}
        </span>
      </div>
    </button>
  );
}

// Accordion Section for each Topic
interface TopicAccordionProps {
  topic: Topic;
  subTopics: SubTopic[];
  selectedSubTopics: string[];
  onToggleSubTopic: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  stepNumber: number;
  totalSteps: number;
  isCompleted: boolean;
  isNoneSelected: boolean;
  onNoneToggle: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  t: ReturnType<typeof useTranslations>;
}

function TopicAccordion({
  topic,
  subTopics,
  selectedSubTopics,
  onToggleSubTopic,
  isExpanded,
  onToggleExpand,
  stepNumber,
  totalSteps,
  isCompleted,
  isNoneSelected,
  onNoneToggle,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  t,
}: TopicAccordionProps) {
  const selectedCount = subTopics.filter(st => selectedSubTopics.includes(st.id)).length;
  const showPriorityControls = totalSteps > 1;

  return (
    <div
      className={cn(
        "rounded-xl border-2 transition-all duration-300 overflow-hidden",
        isExpanded
          ? "border-primary bg-card shadow-lg"
          : isCompleted
            ? isNoneSelected
              ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20"
              : "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
            : "border-muted bg-muted/30"
      )}
    >
      {/* Accordion Header */}
      <div className={cn(
        "flex items-center gap-2 transition-colors",
        isExpanded ? "bg-primary/5" : "hover:bg-muted/50"
      )}>
        {/* Priority controls - only show if multiple topics */}
        {showPriorityControls && (
          <div className="flex flex-col pl-2 py-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              disabled={!canMoveUp}
              className={cn(
                "p-1 rounded transition-colors",
                canMoveUp
                  ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                  : "text-muted-foreground/30 cursor-not-allowed"
              )}
              title={t("matching.wizard.moveUp")}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              disabled={!canMoveDown}
              className={cn(
                "p-1 rounded transition-colors",
                canMoveDown
                  ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                  : "text-muted-foreground/30 cursor-not-allowed"
              )}
              title={t("matching.wizard.moveDown")}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleExpand}
          className={cn(
            "flex-1 flex items-center gap-3 p-4 text-left",
            !showPriorityControls && "pl-4"
          )}
        >
          {/* Priority number badge */}
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
              isExpanded
                ? "bg-primary text-primary-foreground"
                : isCompleted
                  ? isNoneSelected
                    ? "bg-amber-500 text-white"
                    : "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {isCompleted && !isNoneSelected ? <Check className="h-4 w-4" /> : stepNumber}
          </div>

          {/* Topic info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn(
                "font-semibold truncate",
                isExpanded
                  ? "text-primary"
                  : isCompleted
                    ? isNoneSelected
                      ? "text-warning-foreground"
                      : "text-success-foreground"
                    : "text-foreground"
              )}>
                {t(topic.labelKey)}
              </h3>
              {showPriorityControls && (
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {t("matching.wizard.priority")} {stepNumber}
                </span>
              )}
              {isNoneSelected ? (
                <span className="shrink-0 rounded-full bg-warning-muted px-2 py-0.5 text-xs font-medium text-warning-foreground">
                  {t("matching.wizard.noneSelected")}
                </span>
              ) : selectedCount > 0 && (
                <span className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                  isCompleted
                    ? "bg-success-muted text-success-foreground"
                    : "bg-primary/10 text-primary"
                )}>
                  {selectedCount} {t("matching.wizard.selected")}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {subTopics.length} {t("matching.wizard.optionsAvailable")}
            </p>
          </div>

          {/* Expand/Collapse icon */}
          <div className={cn(
            "shrink-0 transition-transform duration-200",
            isExpanded && "rotate-180"
          )}>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </div>
        </button>
      </div>

      {/* Accordion Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-0">
            {/* Separator line */}
            <div className="mb-4 border-t border-border" />

            {/* SubTopic Grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {subTopics.map((subTopic) => (
                <SubTopicCard
                  key={subTopic.id}
                  subTopic={subTopic}
                  label={t(subTopic.labelKey)}
                  isSelected={selectedSubTopics.includes(subTopic.id)}
                  onToggle={() => onToggleSubTopic(subTopic.id)}
                />
              ))}
            </div>

            {/* "None of these" button */}
            <div className="mt-4 pt-3 border-t border-dashed border-border">
              <button
                type="button"
                onClick={onNoneToggle}
                className={cn(
                  "w-full flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all",
                  isNoneSelected
                    ? "border-warning bg-warning-muted text-warning-foreground"
                    : "border-dashed border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/50"
                )}
              >
                {isNoneSelected && <Check className="h-4 w-4" />}
                {t("matching.wizard.noneOfThese")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SubTopicSelection() {
  const t = useTranslations();
  const { state, actions, computed } = useMatching();
  const [freetextValue, setFreetextValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [understandingSummary, setUnderstandingSummary] = useState<string>("");
  const [analysisState, setAnalysisState] = useState<"idle" | "success" | "empty" | "crisis">("idle");
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // "Other" topic state
  const [otherFreetextValue, setOtherFreetextValue] = useState("");
  const [otherMatchResult, setOtherMatchResult] = useState<SpecialtyMatchResult | null>(null);
  const [otherAnalysisState, setOtherAnalysisState] = useState<"idle" | "pending" | "success" | "empty">("idle");
  const otherTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Accordion state - track which topic is expanded
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // Track which topics have "none of these" selected
  const [noneSelectedTopics, setNoneSelectedTopics] = useState<Set<string>>(new Set());

  // Check if "unsureOther" topic is selected
  const hasOtherTopic = state.selectedTopics.includes("unsureOther");
  const onlyOtherTopic = state.selectedTopics.length === 1 && hasOtherTopic;

  // Group subtopics by their parent topic (excluding "unsureOther" which has no subtopics)
  const initialGroupedSubTopics = computed.selectedTopicDetails
    .filter(topic => topic.id !== "unsureOther")
    .map((topic) => ({
      topic,
      subTopics: topic.subTopics,
    }));

  // Track custom order of topics (for priority)
  const [topicOrder, setTopicOrder] = useState<string[]>([]);

  // Initialize topic order when topics change
  useEffect(() => {
    const currentIds = initialGroupedSubTopics.map(g => g.topic.id);
    const needsUpdate = currentIds.length !== topicOrder.length ||
      !currentIds.every(id => topicOrder.includes(id));

    if (needsUpdate) {
      setTopicOrder(currentIds);
    }
  }, [initialGroupedSubTopics.map(g => g.topic.id).join(',')]);

  // Apply custom order to grouped subtopics
  const groupedSubTopics = topicOrder.length > 0
    ? topicOrder
        .map(id => initialGroupedSubTopics.find(g => g.topic.id === id))
        .filter((g): g is NonNullable<typeof g> => g !== undefined)
    : initialGroupedSubTopics;

  const totalSubTopics = groupedSubTopics.reduce(
    (acc, g) => acc + g.subTopics.length,
    0
  );

  // Move topic up/down in priority
  const moveTopicUp = (topicId: string) => {
    setTopicOrder(prev => {
      const index = prev.indexOf(topicId);
      if (index <= 0) return prev;
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveTopicDown = (topicId: string) => {
    setTopicOrder(prev => {
      const index = prev.indexOf(topicId);
      if (index < 0 || index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  // Auto-expand first topic on mount or when no topic is expanded
  const firstTopicId = groupedSubTopics[0]?.topic.id;
  useEffect(() => {
    if (firstTopicId && expandedTopicId === null) {
      setExpandedTopicId(firstTopicId);
    }
  }, [firstTopicId, expandedTopicId]);

  // Check if a topic section is "completed" (has at least one selection OR "none" selected)
  const isTopicCompleted = (topicId: string) => {
    if (noneSelectedTopics.has(topicId)) return true;
    const group = groupedSubTopics.find(g => g.topic.id === topicId);
    if (!group) return false;
    return group.subTopics.some(st => state.selectedSubTopics.includes(st.id));
  };

  // Check if ANY topic has "none of these" selected
  const anyNoneSelected = groupedSubTopics.some(g => noneSelectedTopics.has(g.topic.id));

  // Handle "none of these" toggle
  const handleNoneToggle = (topicId: string) => {
    const group = groupedSubTopics.find(g => g.topic.id === topicId);
    if (!group) return;

    // Remove all subtopic selections for this topic
    group.subTopics.forEach(st => {
      if (state.selectedSubTopics.includes(st.id)) {
        actions.toggleSubTopic(st.id);
      }
    });

    // Toggle "none" for this topic
    setNoneSelectedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
        // Auto-advance to next section
        const currentIndex = groupedSubTopics.findIndex(g => g.topic.id === topicId);
        if (currentIndex < groupedSubTopics.length - 1) {
          setTimeout(() => {
            const nextTopic = groupedSubTopics[currentIndex + 1];
            setExpandedTopicId(nextTopic.topic.id);
          }, 400);
        }
      }
      return next;
    });
  };

  // Handle subtopic toggle with auto-advance to next section
  const handleSubTopicToggle = (subTopicId: string, topicId: string) => {
    // Clear "none" selection for this topic when selecting a subtopic
    if (noneSelectedTopics.has(topicId)) {
      setNoneSelectedTopics(prev => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }

    // Check if this is the first selection BEFORE toggling
    const group = groupedSubTopics.find(g => g.topic.id === topicId);
    const wasEmpty = group ? !group.subTopics.some(st => state.selectedSubTopics.includes(st.id)) : false;
    const isDeselecting = state.selectedSubTopics.includes(subTopicId);

    actions.toggleSubTopic(subTopicId);

    // If this was the first selection (not a deselection), auto-advance to next section
    if (wasEmpty && !isDeselecting) {
      const currentIndex = groupedSubTopics.findIndex(g => g.topic.id === topicId);
      if (currentIndex < groupedSubTopics.length - 1) {
        // Short delay for visual feedback before advancing
        setTimeout(() => {
          const nextTopic = groupedSubTopics[currentIndex + 1];
          setExpandedTopicId(nextTopic.topic.id);
        }, 400);
      }
    }
  };

  const handleAnalyze = () => {
    if (freetextValue.trim().length < 10) return;

    startTransition(async () => {
      // Use empathic matcher for consistent, caring UX
      const result = await matchFreetextToSpecialties(freetextValue);

      // Check for crisis detection
      if (result.crisisDetected) {
        setShowCrisisAlert(true);
        setAnalysisState("crisis");
        return;
      }

      // Show empathic reflection (not specialty matches - user already chose topic)
      const reflection = result.reflection || "";
      setUnderstandingSummary(reflection);

      if (reflection.length > 0) {
        setAnalysisState("success");
        // NO auto-selection - user picks subtopics manually
      } else {
        setAnalysisState("empty");
      }
    });
  };

  const handleCardClick = () => {
    textareaRef.current?.focus();
  };

  const resetAnalysis = () => {
    setAnalysisState("idle");
    setUnderstandingSummary("");
  };

  // Handle "Other" topic analysis
  const handleOtherAnalyze = () => {
    if (otherFreetextValue.trim().length < 10) return;

    setOtherAnalysisState("pending");
    startTransition(async () => {
      const result = await matchFreetextToSpecialties(otherFreetextValue);

      // CRITICAL: Check for crisis detection FIRST
      if (result.crisisDetected) {
        actions.setCrisisDetected(true);
        setOtherAnalysisState("idle"); // Reset so user can try again after crisis
        return; // Crisis UI will be shown by parent component
      }

      setOtherMatchResult(result);

      if (result.matchedSpecialties.length > 0) {
        // Store matched specialties in state for later use in search
        actions.setOtherTopicSpecialties(result.matchedSpecialties);
        setOtherAnalysisState("success");
      } else {
        setOtherAnalysisState("empty");
      }
    });
  };

  const resetOtherAnalysis = () => {
    setOtherAnalysisState("idle");
    setOtherMatchResult(null);
    actions.setOtherTopicSpecialties([]);
  };

  // Crisis hotlines
  const crisisHotline = "0800 111 0 111";
  const crisisHotlineAlt = "0800 111 0 222";

  // If crisis detected, show immediate help
  if (showCrisisAlert) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("matching.crisis.notAloneInformal")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            {t("matching.crisis.helpAvailable")}
          </p>
        </div>

        <div className="mx-auto max-w-xl space-y-6">
          <div className="rounded-lg border-2 border-red-500 bg-white p-4 dark:border-red-600 dark:bg-red-950/40">
            <div className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                {t("matching.crisis.available247")}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={`tel:${crisisHotline.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-600 bg-red-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-red-700"
            >
              <Phone className="h-5 w-5" />
              {crisisHotline}
            </a>
            <a
              href={`tel:${crisisHotlineAlt.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-500 bg-white px-6 py-4 text-lg font-bold text-red-700 transition-all hover:bg-red-50 dark:border-red-600 dark:bg-red-950/50 dark:text-red-300"
            >
              <Phone className="h-5 w-5" />
              {crisisHotlineAlt}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Special UI for "Other" topic - only show freetext matching
  if (onlyOtherTopic) {
    return (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {t("matching.other.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("matching.other.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Freetext Input Card */}
        <div className={cn(
          "flex-1 rounded-lg border-2 transition-all",
          otherAnalysisState === "success"
            ? "border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-950/30"
            : otherAnalysisState === "empty"
              ? "border-amber-600 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/30"
              : otherFreetextValue.length > 0
                ? "border-primary bg-card"
                : "border-dashed border-muted-foreground/40 bg-muted/30"
        )}>
          {otherAnalysisState === "success" && otherMatchResult ? (
            <div className="p-4 space-y-4">
              {/* Empathic Reflection - most important, shown first */}
              {otherMatchResult.reflection && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-base text-foreground leading-relaxed italic">
                      "{otherMatchResult.reflection}"
                    </p>
                  </div>
                </div>
              )}

              {/* Recognized Themes */}
              {otherMatchResult.recognizedThemes && otherMatchResult.recognizedThemes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {otherMatchResult.recognizedThemes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}

              {/* Explanation - why these therapists can help */}
              {otherMatchResult.explanation && (
                <p className="text-sm text-muted-foreground">
                  {otherMatchResult.explanation}
                </p>
              )}

              {/* Matched Specialties */}
              <div className="rounded-md bg-green-100 dark:bg-green-900/40 p-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                  {t("matching.other.matchedTo")}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {otherMatchResult.matchedSpecialties.map(specialtyId => (
                    <span
                      key={specialtyId}
                      className="inline-flex items-center gap-1 rounded-full bg-green-200 dark:bg-green-800 px-3 py-1 text-sm font-medium text-green-900 dark:text-green-100"
                    >
                      <Check className="h-3 w-3" />
                      {getSpecialtyLabel(specialtyId, "de")}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setOtherFreetextValue("");
                    resetOtherAnalysis();
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("matching.other.describeAgain")}
                </button>
              </div>
            </div>
          ) : otherAnalysisState === "empty" ? (
            <div className="p-4 space-y-4">
              {/* Empty: No match found */}
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-800 dark:text-amber-300">
                  {t("matching.other.noMatch")}
                </span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {t("matching.other.tryAgainHint")}
              </p>
              <button
                onClick={() => {
                  setOtherFreetextValue("");
                  resetOtherAnalysis();
                }}
                className="flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80"
              >
                <RefreshCw className="h-4 w-4" />
                {t("matching.other.describeAgain")}
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4 h-full flex flex-col">
              {/* Idle: Input form */}
              <p className="text-sm text-muted-foreground">
                {t("matching.other.instructions")}
              </p>

              <div className="flex-1 flex flex-col">
                <Textarea
                  ref={otherTextareaRef}
                  value={otherFreetextValue}
                  onChange={(e) => setOtherFreetextValue(e.target.value)}
                  placeholder={t("matching.other.placeholder")}
                  disabled={otherAnalysisState === "pending"}
                  className="flex-1 min-h-[120px] resize-none text-base"
                />

                {/* Privacy hint */}
                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground/70">
                  <Info className="h-3 w-3" />
                  <span>{t("matching.freetext.privacyHint")}</span>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  {otherFreetextValue.length}/500
                </span>
                <button
                  onClick={handleOtherAnalyze}
                  disabled={otherFreetextValue.trim().length < 10 || otherAnalysisState === "pending"}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all",
                    otherFreetextValue.trim().length >= 10 && otherAnalysisState !== "pending"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {otherAnalysisState === "pending" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("matching.freetext.analyzing")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t("matching.other.findMatch")}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // No subtopics and no "other" topic
  if (totalSubTopics === 0 && !hasOtherTopic) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {t("matching.wizard.step1_25Title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {state.selectedSubTopics.length === 0
                ? t("matching.wizard.subtopicHint")
                : t("matching.wizard.selectedSubTopics", {
                    count: state.selectedSubTopics.length,
                  })}
            </p>
          </div>
        </div>
      </div>

      {/* Priority hint - only show if multiple topics */}
      {groupedSubTopics.length > 1 && (
        <div className="mb-3 rounded-lg bg-info-muted border border-info-border p-3">
          <p className="text-xs text-info-foreground">
            <strong>{t("matching.wizard.priorityHint")}</strong> {t("matching.wizard.priorityExplanation")}
          </p>
        </div>
      )}

      {/* Progress indicator */}
      {groupedSubTopics.length > 1 && (
        <div className="mb-4 flex items-center gap-2">
          {groupedSubTopics.map((group) => (
            <div
              key={group.topic.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                isTopicCompleted(group.topic.id)
                  ? noneSelectedTopics.has(group.topic.id)
                    ? "bg-amber-500"
                    : "bg-green-500"
                  : expandedTopicId === group.topic.id
                    ? "bg-primary"
                    : "bg-muted"
              )}
            />
          ))}
        </div>
      )}

      {/* Topic Accordion Sections */}
      <div className="flex-1 space-y-3 overflow-auto">
        {groupedSubTopics.map(({ topic, subTopics }, index) => (
          <TopicAccordion
            key={topic.id}
            topic={topic}
            subTopics={subTopics}
            selectedSubTopics={state.selectedSubTopics}
            onToggleSubTopic={(subTopicId) => handleSubTopicToggle(subTopicId, topic.id)}
            isExpanded={expandedTopicId === topic.id}
            onToggleExpand={() => setExpandedTopicId(
              expandedTopicId === topic.id ? null : topic.id
            )}
            stepNumber={index + 1}
            totalSteps={groupedSubTopics.length}
            isCompleted={isTopicCompleted(topic.id)}
            isNoneSelected={noneSelectedTopics.has(topic.id)}
            onNoneToggle={() => handleNoneToggle(topic.id)}
            canMoveUp={index > 0}
            canMoveDown={index < groupedSubTopics.length - 1}
            onMoveUp={() => moveTopicUp(topic.id)}
            onMoveDown={() => moveTopicDown(topic.id)}
            t={t}
          />
        ))}

        {/* Freetext Card - Shown when ANY topic has "none of these" selected */}
        {anyNoneSelected && (
          <div
            onClick={handleCardClick}
            className={cn(
              "cursor-text rounded-xl border-2 transition-all",
              analysisState === "success"
                ? "border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-950/30"
                : analysisState === "empty"
                  ? "border-amber-600 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/30"
                  : isFocused || freetextValue.length > 0
                    ? "border-primary shadow-lg bg-card"
                    : "border-primary/50 bg-primary/5"
            )}
          >
            {/* Card Header */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-3 border-b",
              analysisState === "success" ? "border-green-600/30" : analysisState === "empty" ? "border-amber-600/30" : "border-border"
            )}>
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                analysisState === "success" ? "bg-green-600/20" : analysisState === "empty" ? "bg-amber-600/20" : "bg-primary/15"
              )}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                ) : analysisState === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-400" />
                ) : (
                  <MessageSquareText className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <span className={cn(
                  "font-semibold",
                  analysisState === "success" ? "text-green-800 dark:text-green-300" : analysisState === "empty" ? "text-amber-800 dark:text-amber-300" : "text-foreground"
                )}>
                  {isPending
                    ? t("matching.freetext.analyzing")
                    : analysisState === "success"
                      ? t("matching.freetext.understood")
                      : t("matching.wizard.describeYourSituation")}
                </span>
                {analysisState === "idle" && (
                  <p className="text-xs text-muted-foreground">
                    {t("matching.wizard.noneSelectedHint")}
                  </p>
                )}
              </div>
              {freetextValue.length >= 10 && analysisState === "idle" && !isPending && (
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              )}
            </div>

            {/* Content Area */}
            <div className="p-4">
              {analysisState === "success" ? (
                <div className="space-y-3">
                  <p className="text-sm text-foreground leading-relaxed italic">
                    "{understandingSummary}"
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFreetextValue("");
                      resetAnalysis();
                      textareaRef.current?.focus();
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/80"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t("matching.freetext.resetInput")}
                  </button>
                </div>
              ) : analysisState === "empty" ? (
                <div className="space-y-3">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {t("matching.freetext.couldNotUnderstand")}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFreetextValue("");
                      resetAnalysis();
                      textareaRef.current?.focus();
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/80"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t("matching.freetext.tryAgain")}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    ref={textareaRef}
                    value={freetextValue}
                    onChange={(e) => {
                      setFreetextValue(e.target.value);
                      resetAnalysis();
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={t("matching.wizard.noneSelectedPlaceholder")}
                    disabled={isPending}
                    className="min-h-[100px] resize-none text-base"
                  />
                  {/* Privacy hint */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                    <Info className="h-3 w-3" />
                    <span>{t("matching.freetext.privacyHint")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            {freetextValue.length > 0 && analysisState === "idle" && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <span className="text-xs text-muted-foreground">
                  {freetextValue.length}/500
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnalyze();
                  }}
                  disabled={freetextValue.trim().length < 10 || isPending}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                    freetextValue.trim().length >= 10 && !isPending
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t("matching.freetext.analyze")}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="mt-3 rounded-lg bg-muted/50 p-2 text-center">
        <p className="text-xs text-muted-foreground">
          {t("matching.wizard.subtopicBenefit")}
        </p>
      </div>
    </div>
  );
}
