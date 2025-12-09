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
  CheckCircle2,
} from "lucide-react";
import type { MatchedTherapist } from "@/types/therapist";
import { MatchScoreBadge } from "./match-score-badge";
import { cn } from "@/lib/utils";

interface TopMatchCardProps {
  therapist: MatchedTherapist;
  rank: number;
}

const rankConfig: Record<number, { Icon: typeof Crown; color: string; border: string }> = {
  1: { Icon: Crown, color: "text-yellow-500", border: "border-l-yellow-500" },
  2: { Icon: Medal, color: "text-slate-400", border: "border-l-slate-400" },
  3: { Icon: Award, color: "text-amber-600", border: "border-l-amber-600" },
};

export function TopMatchCard({ therapist, rank }: TopMatchCardProps) {
  const t = useTranslations();
  const tFilters = useTranslations("therapists.filters");
  const tSpec = useTranslations("therapists.specialties");

  const config = rankConfig[rank] ?? { Icon: CheckCircle2, color: "text-primary", border: "border-l-primary/50" };
  const RankIcon = config.Icon;
  const breakdown = therapist.scoreBreakdown;
  const reasons = breakdown?.matchReasons.slice(0, 2) ?? therapist.specializations.slice(0, 2);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-l-4 bg-card/80 backdrop-blur transition-all hover:bg-card hover:shadow-lg",
        config.border,
        rank === 1 && "ring-1 ring-yellow-500/20"
      )}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
            <Image
              src={therapist.imageUrl}
              alt={therapist.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="96px"
            />
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-background shadow-md">
              <RankIcon className={cn("h-4 w-4", config.color)} />
            </div>
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-semibold leading-tight">{therapist.name}</h3>
                <p className="truncate text-xs text-muted-foreground">{therapist.title}</p>
              </div>
              <MatchScoreBadge score={therapist.matchScore} size="sm" />
            </div>

            {/* Meta Row */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {therapist.location.city}
              </span>
              <span className="flex items-center gap-1">
                <Euro className="h-3 w-3" />
                {therapist.pricePerSession}€
              </span>
              <span className="flex items-center gap-1">
                {therapist.sessionType === "online" && <Video className="h-3 w-3" />}
                {therapist.sessionType === "in_person" && <Building2 className="h-3 w-3" />}
                {therapist.sessionType === "both" && (
                  <>
                    <Video className="h-3 w-3" />
                    <Building2 className="h-3 w-3" />
                  </>
                )}
              </span>
              <StarRating rating={therapist.rating} size="sm" />
            </div>

            {/* Specializations */}
            <div className="mt-2 flex flex-wrap gap-1">
              {therapist.specializations.slice(0, 3).map((spec) => (
                <Badge key={spec} variant="secondary" className="text-[10px]">
                  {tSpec(spec)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2">
          <div className="flex flex-wrap gap-1">
            {reasons.map((reason, i) => (
              <span key={i} className="text-[11px] text-muted-foreground">
                {typeof reason === "string" ? reason : tSpec(reason)}
                {i < reasons.length - 1 && " · "}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Link href={`/therapists/${therapist.id}`}>
                {t("therapists.viewProfile")}
              </Link>
            </Button>
            <Button size="sm" className="h-7 px-3 text-xs">
              {t("therapists.contact")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
