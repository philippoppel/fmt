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
    bgClass: "bg-gradient-to-r from-yellow-500/80 to-amber-500/80 text-white",
    borderClass: "border-yellow-500/50",
    iconClass: "text-white",
  },
  2: {
    label: "matching.results.veryGoodMatch",
    Icon: Medal,
    bgClass: "bg-gradient-to-r from-slate-500/90 to-slate-600/90 text-white",
    borderClass: "border-slate-400/50",
    iconClass: "text-white",
  },
  3: {
    label: "matching.results.goodMatch",
    Icon: Award,
    bgClass: "bg-gradient-to-r from-amber-600/90 to-orange-600/90 text-white",
    borderClass: "border-amber-600/50",
    iconClass: "text-white",
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
        "overflow-hidden transition-all hover:shadow-2xl",
        rank === 1 && "border-2 shadow-lg shadow-primary/10",
        config.borderClass
      )}
    >
      <CardContent className="p-0">
        <div className="grid gap-0 lg:grid-cols-[1.05fr,1fr]">
          {/* Hero image */}
          <div className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
              <Image
                src={therapist.imageUrl}
                alt={therapist.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority={rank === 1}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/60" />
            </div>

            <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-lg backdrop-blur",
                  config.bgClass
                )}
              >
                <RankIcon className={cn("h-4 w-4", config.iconClass)} />
                <span>
                  #{rank} {t(config.label)}
                </span>
              </div>
              <MatchScoreBadge score={therapist.matchScore} size="lg" />
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-4 text-white">
              <h3 className="text-2xl font-semibold leading-tight">
                {therapist.name}
              </h3>
              <p className="text-sm text-white/80">{therapist.title}</p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/80">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {therapist.location.city}
                </span>
                <span className="flex items-center gap-1">
                  <Euro className="h-4 w-4" />
                  {therapist.pricePerSession}€
                </span>
                <span className="flex items-center gap-1">
                  {therapist.sessionType === "online" && <Video className="h-4 w-4" />}
                  {therapist.sessionType === "in_person" && <Building2 className="h-4 w-4" />}
                  {therapist.sessionType === "both" && (
                    <span className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      <Building2 className="h-4 w-4" />
                    </span>
                  )}
                  {tFilters(`sessionType.${therapist.sessionType}`)}
                </span>
              </div>
            </div>
          </div>

          {/* Details + reasons */}
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {therapist.specializations.slice(0, 3).map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {tSpec(spec)}
                  </Badge>
                ))}
              </div>
              <StarRating rating={therapist.rating} size="md" />
            </div>

            {therapist.scoreBreakdown ? (
              <div className="rounded-xl border bg-muted/40 p-4">
                <ScoreBreakdownCard
                  breakdown={therapist.scoreBreakdown}
                  therapistName={therapist.name}
                  compact
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  {t("matching.results.specializedIn")}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {therapist.specializations.slice(0, 6).map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {tSpec(spec)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground line-clamp-3">
              {therapist.shortDescription}
            </p>

            <div className="mt-auto flex flex-wrap gap-3">
              <Button asChild className="min-w-[160px] flex-1">
                <Link href={`/therapists/${therapist.id}`}>
                  {t("therapists.viewProfile")}
                </Link>
              </Button>
              <Button variant="outline" className="min-w-[140px] flex-1">
                {t("therapists.contact")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
