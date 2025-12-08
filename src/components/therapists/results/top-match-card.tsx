"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import {
  MapPin,
  Euro,
  Video,
  Building2,
  Crown,
  Medal,
  Award,
} from "lucide-react";
import type { MatchedTherapist } from "@/types/therapist";
import { MatchScoreBadge } from "./match-score-badge";
import { ScoreBreakdownCard } from "./score-breakdown-card";
import { cn } from "@/lib/utils";

interface TopMatchCardProps {
  therapist: MatchedTherapist;
  rank: 1 | 2 | 3;
}

const rankConfig = {
  1: {
    label: "matching.results.bestMatch",
    Icon: Crown,
    bgClass: "bg-gradient-to-r from-yellow-500/10 to-amber-500/10",
    borderClass: "border-yellow-500/50",
    iconClass: "text-yellow-500",
  },
  2: {
    label: "matching.results.veryGoodMatch",
    Icon: Medal,
    bgClass: "bg-gradient-to-r from-slate-400/10 to-slate-500/10",
    borderClass: "border-slate-400/50",
    iconClass: "text-slate-400",
  },
  3: {
    label: "matching.results.goodMatch",
    Icon: Award,
    bgClass: "bg-gradient-to-r from-amber-600/10 to-orange-600/10",
    borderClass: "border-amber-600/50",
    iconClass: "text-amber-600",
  },
};

export function TopMatchCard({ therapist, rank }: TopMatchCardProps) {
  const t = useTranslations();
  const tFilters = useTranslations("therapists.filters");
  const tSpec = useTranslations("therapists.specialties");

  const config = rankConfig[rank];
  const RankIcon = config.Icon;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-xl",
        rank === 1 && "border-2 shadow-lg",
        config.borderClass
      )}
    >
      {/* Rank Banner */}
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium",
          config.bgClass
        )}
      >
        <RankIcon className={cn("h-4 w-4", config.iconClass)} />
        <span>#{rank} {t(config.label)}</span>
        <div className="ml-auto">
          <MatchScoreBadge score={therapist.matchScore} size="sm" />
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Profile Info */}
          <div className="flex gap-4 lg:w-1/3">
            {/* Profile Image */}
            <div className="relative h-24 w-24 rounded-full overflow-hidden shrink-0 ring-2 ring-offset-2 ring-primary/20">
              <Image
                src={therapist.imageUrl}
                alt={therapist.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold truncate">{therapist.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {therapist.title}
              </p>
              <div className="mt-1">
                <StarRating rating={therapist.rating} size="sm" />
              </div>

              {/* Meta */}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {therapist.location.city}
                </span>
                <span className="flex items-center gap-1">
                  <Euro className="h-3 w-3" />
                  {therapist.pricePerSession}€
                </span>
                <span className="flex items-center gap-1">
                  {therapist.sessionType === "online" ? (
                    <Video className="h-3 w-3" />
                  ) : (
                    <Building2 className="h-3 w-3" />
                  )}
                  {tFilters(`sessionType.${therapist.sessionType}`)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Score Breakdown */}
          <div className="flex-1 lg:border-l lg:pl-6">
            {therapist.scoreBreakdown ? (
              <ScoreBreakdownCard
                breakdown={therapist.scoreBreakdown}
                therapistName={therapist.name}
              />
            ) : (
              <div className="space-y-2">
                {/* Fallback: Specializations */}
                <div className="text-sm font-medium text-muted-foreground">
                  {t("matching.results.specializedIn")}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {therapist.specializations.slice(0, 5).map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {tSpec(spec)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
          {therapist.shortDescription}
        </p>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <Button asChild>
            <Link href={`/therapists/${therapist.id}`}>
              {t("therapists.viewProfile")}
            </Link>
          </Button>
          <Button variant="outline">
            {t("therapists.contact")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
