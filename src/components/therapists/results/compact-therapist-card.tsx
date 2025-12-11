"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Video, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Therapist } from "@/types/therapist";

interface CompactTherapistCardProps {
  therapist: Therapist;
  matchScore?: number;
  onClick: () => void;
}

export function CompactTherapistCard({
  therapist,
  matchScore,
  onClick,
}: CompactTherapistCardProps) {
  const t = useTranslations("therapists");
  const tSpec = useTranslations("therapists.specialties");

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500 text-white";
    if (score >= 60) return "bg-yellow-500 text-white";
    if (score >= 40) return "bg-orange-500 text-white";
    return "bg-gray-500 text-white";
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-200",
        "hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`${t("viewDetails")} ${therapist.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={therapist.imageUrl}
          alt={therapist.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Match Score Badge */}
        {matchScore !== undefined && (
          <div className="absolute right-2 top-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-sm font-bold shadow-lg",
                getMatchScoreColor(matchScore)
              )}
            >
              {matchScore}%
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Name */}
        <h3 className="font-semibold text-sm leading-tight line-clamp-1">
          {therapist.name}
        </h3>

        {/* Location & Session Type */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {therapist.location.city}
          </span>
          <span className="text-muted-foreground/50">|</span>
          {therapist.sessionType === "online" && (
            <span className="flex items-center gap-1">
              <Video className="h-3 w-3" />
              {t("online")}
            </span>
          )}
          {therapist.sessionType === "in_person" && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {t("inPerson")}
            </span>
          )}
          {therapist.sessionType === "both" && (
            <span className="flex items-center gap-0.5">
              <Video className="h-3 w-3" />
              <span className="mx-0.5">&</span>
              <Building2 className="h-3 w-3" />
            </span>
          )}
        </div>

        {/* Specializations (max 2) */}
        <div className="flex flex-wrap gap-1">
          {therapist.specializations.slice(0, 2).map((spec) => (
            <Badge
              key={spec}
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
            >
              {tSpec(spec)}
            </Badge>
          ))}
          {therapist.specializations.length > 2 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{therapist.specializations.length - 2}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
