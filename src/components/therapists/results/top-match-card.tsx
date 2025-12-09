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
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

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
  const breakdown = therapist.scoreBreakdown;
  const categories = breakdown
    ? Object.entries(breakdown.categories).filter(
        ([, category]) => category.maxScore > 0
      )
    : [];
  const reasons =
    breakdown?.matchReasons.slice(0, 3) ??
    therapist.specializations.slice(0, 3);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/10/50 shadow-lg backdrop-blur-xl transition-all",
        "hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/15",
        rank === 1 && "border-primary/40 shadow-primary/10",
        config.borderClass
      )}
    >
      <CardContent className="p-0">
        <div className="relative h-40 w-full overflow-hidden rounded-b-none rounded-t-2xl bg-muted/30">
          <Image
            src={therapist.imageUrl}
            alt={therapist.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 300px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/65" />

          <div className="absolute left-2 top-2 flex flex-wrap items-center gap-2">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur",
                config.bgClass
              )}
            >
              <RankIcon className={cn("h-4 w-4", config.iconClass)} />
              <span>#{rank}</span>
            </div>
            <MatchScoreBadge score={therapist.matchScore} size="sm" />
          </div>
          <div className="absolute inset-x-0 bottom-2 px-3 text-white drop-shadow">
            <h3 className="text-lg font-semibold leading-tight">{therapist.name}</h3>
            <p className="text-xs text-white/85">{therapist.title}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-b-2xl bg-white/5 p-3 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {therapist.location.city}
            </span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span className="flex items-center gap-1">
              <Euro className="h-3.5 w-3.5" />
              {therapist.pricePerSession}€
            </span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span className="flex items-center gap-1">
              {therapist.sessionType === "online" && <Video className="h-3.5 w-3.5" />}
              {therapist.sessionType === "in_person" && <Building2 className="h-3.5 w-3.5" />}
              {therapist.sessionType === "both" && (
                <span className="flex items-center gap-1">
                  <Video className="h-3.5 w-3.5" />
                  <Building2 className="h-3.5 w-3.5" />
                </span>
              )}
              {tFilters(`sessionType.${therapist.sessionType}`)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {therapist.specializations.slice(0, 2).map((spec) => (
                <Badge key={spec} variant="secondary" className="text-[11px]">
                  {tSpec(spec)}
                </Badge>
              ))}
            </div>
            <StarRating rating={therapist.rating} size="sm" />
          </div>

          {categories.length > 0 && (
            <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-2">
              {categories.slice(0, 3).map(([key, category]) => {
                const percentage = Math.round((category.score / category.maxScore) * 100);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{t(`matching.scoreBreakdown.${key}`)}</span>
                      <span className="font-semibold text-foreground">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">
              {t("matching.results.matchBecause", { name: therapist.name })}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((reason, i) => (
                <Badge key={i} variant="outline" className="text-[11px]">
                  {typeof reason === "string" ? reason : tSpec(reason)}
                </Badge>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {therapist.shortDescription}
          </p>

          <div className="flex gap-2">
            <Button asChild size="sm" className="flex-1">
              <Link href={`/therapists/${therapist.id}`}>
                {t("therapists.viewProfile")}
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              {t("therapists.contact")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
