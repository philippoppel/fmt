"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { MessageSquareText, ArrowRight, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { MATCHING_TOPICS } from "@/lib/matching/topics";
import { useMatching } from "../matching-context";
import { TopicCard } from "./topic-card";
import { cn } from "@/lib/utils";

export function TopicSelection() {
  const t = useTranslations();
  const { state, actions } = useMatching();
  const [freetextValue, setFreetextValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFreetextSubmit = () => {
    if (freetextValue.trim().length >= 10) {
      // Store the text and switch to freetext mode
      sessionStorage.setItem("freetextDraft", freetextValue);
      actions.switchToFreetext();
    }
  };

  const handleCardClick = () => {
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header - compact */}
      <div className="mb-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-semibold">
            {t("matching.wizard.step1Title")}
          </h2>
          <span className="text-xs text-muted-foreground">
            {state.selectedTopics.length === 0
              ? t("matching.wizard.selectAtLeastOne")
              : t("matching.wizard.selectedCount", { count: state.selectedTopics.length })}
          </span>
        </div>
      </div>

      {/* Topic Grid + Freetext Card */}
      <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6">
        {/* Topic Cards */}
        {MATCHING_TOPICS.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            label={t(topic.labelKey)}
            isSelected={state.selectedTopics.includes(topic.id)}
            onToggle={() => actions.toggleTopic(topic.id)}
          />
        ))}

        {/* Freetext Card - spans 2 columns, positioned at end */}
        <div
          onClick={handleCardClick}
          className={cn(
            "col-span-2 row-span-1 flex cursor-text flex-col overflow-hidden rounded-lg border-2 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 transition-all",
            isFocused || freetextValue.length > 0
              ? "border-primary shadow-md"
              : "border-primary/30 hover:border-primary/50"
          )}
        >
          {/* Card Header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/10">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
              <MessageSquareText className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary">
              {t("matching.wizard.preferToDescribe")}
            </span>
            {freetextValue.length >= 10 && (
              <Sparkles className="ml-auto h-3.5 w-3.5 text-primary animate-pulse" />
            )}
          </div>

          {/* Textarea Area */}
          <div className="flex-1 p-2">
            <Textarea
              ref={textareaRef}
              value={freetextValue}
              onChange={(e) => setFreetextValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={t("matching.freetext.shortPlaceholder")}
              className="h-full min-h-0 resize-none border-0 bg-transparent p-1 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0"
            />
          </div>

          {/* Action Footer - only show when has content */}
          {freetextValue.length > 0 && (
            <div className="flex items-center justify-between border-t border-primary/10 px-3 py-1.5">
              <span className="text-[10px] text-muted-foreground">
                {freetextValue.length}/500
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFreetextSubmit();
                }}
                disabled={freetextValue.trim().length < 10}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all",
                  freetextValue.trim().length >= 10
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {t("matching.freetext.analyze")}
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
