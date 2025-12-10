"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTopicImageUrl, type SubTopic } from "@/lib/matching/topics";
import { useMatching } from "../matching-context";

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
          ? "border-primary shadow-md"
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
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
      )}

      {/* Gradient Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent",
          isSelected && "from-primary/80 via-primary/20"
        )}
        aria-hidden="true"
      />

      {/* Selected Checkmark */}
      {isSelected && (
        <div
          className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </div>
      )}

      {/* Label */}
      <div className="absolute inset-x-0 bottom-0 p-2">
        <span className="text-xs font-semibold text-white drop-shadow-md sm:text-sm">
          {label}
        </span>
      </div>
    </button>
  );
}

export function SubTopicSelection() {
  const t = useTranslations();
  const { state, actions, computed } = useMatching();

  // Group subtopics by their parent topic
  const groupedSubTopics = computed.selectedTopicDetails.map((topic) => ({
    topic,
    subTopics: topic.subTopics,
  }));

  const totalSubTopics = groupedSubTopics.reduce(
    (acc, g) => acc + g.subTopics.length,
    0
  );

  if (totalSubTopics === 0) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold">
              {t("matching.wizard.step1_25Title")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {state.selectedSubTopics.length === 0
                ? t("matching.wizard.subtopicHint")
                : t("matching.wizard.selectedSubTopics", {
                    count: state.selectedSubTopics.length,
                  })}
            </p>
          </div>
        </div>
      </div>

      {/* SubTopics grouped by parent topic */}
      <div className="flex-1 space-y-4 overflow-auto">
        {groupedSubTopics.map(({ topic, subTopics }) => (
          <div key={topic.id}>
            {/* Topic Header */}
            <div className="mb-2 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                {t(topic.labelKey)}
              </span>
            </div>

            {/* SubTopic Grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {subTopics.map((subTopic) => (
                <SubTopicCard
                  key={subTopic.id}
                  subTopic={subTopic}
                  label={t(subTopic.labelKey)}
                  isSelected={state.selectedSubTopics.includes(subTopic.id)}
                  onToggle={() => actions.toggleSubTopic(subTopic.id)}
                />
              ))}
            </div>
          </div>
        ))}
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
