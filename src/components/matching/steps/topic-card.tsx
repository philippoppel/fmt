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
          ? "border-primary ring-4 ring-primary/40 shadow-lg shadow-primary/25 scale-[1.02]"
          : "border-transparent hover:border-primary/40"
      )}
      aria-pressed={isSelected}
    >
      {/* Background Image */}
      <Image
        src={getTopicImageUrl(topic.unsplashId, 200, 150)}
        alt=""
        fill
        className={cn("object-cover transition-all duration-200", isSelected && "brightness-110")}
        sizes="(max-width: 640px) 33vw, 16vw"
      />

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
        "absolute inset-x-0 bottom-0 p-1.5 transition-all duration-200",
        isSelected && "bg-primary/20 backdrop-blur-[2px]"
      )}>
        <span className="text-xs font-semibold text-white drop-shadow-md sm:text-sm">
          {label}
        </span>
      </div>
    </button>
  );
}
