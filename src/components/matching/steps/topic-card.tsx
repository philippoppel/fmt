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
        "group relative aspect-[4/3] h-full w-full overflow-hidden rounded-lg border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        isSelected
          ? "border-primary shadow-md"
          : "border-transparent hover:border-primary/40"
      )}
      aria-pressed={isSelected}
    >
      {/* Background Image */}
      <Image
        src={getTopicImageUrl(topic.unsplashId, 200, 150)}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 640px) 33vw, 16vw"
      />

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
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </div>
      )}

      {/* Label */}
      <div className="absolute inset-x-0 bottom-0 p-1.5">
        <span className="text-xs font-semibold text-white drop-shadow-md sm:text-sm">
          {label}
        </span>
      </div>
    </button>
  );
}
