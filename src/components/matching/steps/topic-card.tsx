"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTopicImageUrl, type Topic } from "@/lib/matching/topics";

interface TopicCardProps {
  topic: Topic;
  label: string;
  isSelected: boolean;
  onToggle: () => void;
}

export function TopicCard({
  topic,
  label,
  isSelected,
  onToggle,
}: TopicCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary shadow-lg ring-2 ring-primary/20"
          : "border-transparent hover:border-primary/50 hover:shadow-md"
      )}
      aria-pressed={isSelected}
    >
      {/* Background Image */}
      <Image
        src={getTopicImageUrl(topic.unsplashId, 400, 300)}
        alt=""
        fill
        className={cn(
          "object-cover transition-transform duration-300",
          !isSelected && "group-hover:scale-105"
        )}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
      />

      {/* Gradient Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity",
          isSelected && "from-primary/80 via-primary/30"
        )}
        aria-hidden="true"
      />

      {/* Selected Checkmark */}
      {isSelected && (
        <div
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
          aria-hidden="true"
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </div>
      )}

      {/* Label */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <span
          className={cn(
            "text-base font-semibold text-white drop-shadow-md sm:text-lg",
            isSelected && "text-white"
          )}
        >
          {label}
        </span>
      </div>
    </button>
  );
}
