"use client";

import { useState } from "react";
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
  Clock,
  Calendar,
  Play,
  BadgeCheck,
  GitCompare,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import type { MatchedTherapist } from "@/types/therapist";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScoreBreakdownModal } from "./score-breakdown-modal";

interface TopMatchCardProps {
  therapist: MatchedTherapist & {
    videoIntroUrl?: string;
    avgResponseTimeHours?: number;
    nextAvailableSlot?: Date | string;
    offersTrialSession?: boolean;
    trialSessionPrice?: number;
    experienceYears?: number;
    bookingRate?: number;
  };
  rank: number;
  onCompareToggle?: (id: string) => void;
  isComparing?: boolean;
}

const rankConfig: Record<number, { Icon: typeof Crown; color: string; border: string; bg: string }> = {
  1: { Icon: Crown, color: "text-yellow-500", border: "border-l-yellow-500", bg: "bg-yellow-500/10" },
  2: { Icon: Medal, color: "text-slate-400", border: "border-l-slate-400", bg: "bg-slate-400/10" },
  3: { Icon: Award, color: "text-amber-600", border: "border-l-amber-600", bg: "bg-amber-600/10" },
};

function getFitLevel(score: number): { key: string; color: string } {
  if (score >= 85) return { key: "excellent", color: "text-green-500 bg-green-500/10" };
  if (score >= 70) return { key: "high", color: "text-emerald-500 bg-emerald-500/10" };
  if (score >= 50) return { key: "good", color: "text-blue-500 bg-blue-500/10" };
  return { key: "moderate", color: "text-muted-foreground bg-muted" };
}

function formatNextSlot(date: Date | string | undefined, t: ReturnType<typeof useTranslations>): string | null {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return t("matching.therapistCard.availableNow");
  if (diffDays <= 7) return t("matching.therapistCard.availableNow");

  return t("matching.therapistCard.nextSlot", {
    date: d.toLocaleDateString("de-DE", { day: "numeric", month: "short" }),
  });
}

export function TopMatchCard({
  therapist,
  rank,
  onCompareToggle,
  isComparing,
}: TopMatchCardProps) {
  const t = useTranslations();
  const tSpec = useTranslations("therapists.specialties");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const config = rankConfig[rank] ?? { Icon: CheckCircle2, color: "text-primary", border: "border-l-primary/50", bg: "bg-primary/10" };
  const RankIcon = config.Icon;
  const fitLevel = getFitLevel(therapist.matchScore);
  const nextSlotText = formatNextSlot(therapist.nextAvailableSlot, t);

  // Generate personalized reason
  const getPersonalizedReason = () => {
    const reasons: string[] = [];
    const specs = therapist.specializations.slice(0, 2).map(s => tSpec(s)).join(" & ");

    if (specs) {
      reasons.push(t("matching.personalized.expertInTopics", { topics: specs }));
    }
    if (therapist.experienceYears && therapist.experienceYears >= 5) {
      reasons.push(t("matching.personalized.experienceMatch", { years: therapist.experienceYears }));
    }
    if (therapist.sessionType === "online" || therapist.sessionType === "both") {
      reasons.push(t("matching.personalized.onlineMatch"));
    }
    if (therapist.nextAvailableSlot) {
      reasons.push(t("matching.personalized.availabilityMatch"));
    }

    return reasons[0] || specs;
  };

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden border-l-4 bg-card/90 backdrop-blur transition-all hover:bg-card hover:shadow-xl",
          config.border,
          rank === 1 && "ring-1 ring-yellow-500/30",
          isComparing && "ring-2 ring-primary"
        )}
      >
        <CardContent className="p-0">
          {/* Main Content */}
          <div className="flex gap-4 p-4">
            {/* Image with Video Play Button - LARGER */}
            <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-2xl bg-muted shadow-lg">
              <Image
                src={therapist.imageUrl}
                alt={therapist.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="160px"
                priority={rank <= 3}
              />
              {/* Rank Badge */}
              <div className={cn("absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md", config.bg)}>
                <RankIcon className={cn("h-4 w-4", config.color)} />
              </div>
              {/* Video Play Button */}
              {therapist.videoIntroUrl && (
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                    <Play className="h-6 w-6 text-primary" fill="currentColor" />
                  </div>
                </button>
              )}
              {/* Verified Badge */}
              {therapist.isVerified && (
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-background shadow-md">
                  <BadgeCheck className="h-5 w-5 text-blue-500" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold leading-tight">{therapist.name}</h3>
                  <p className="truncate text-sm text-muted-foreground">{therapist.title}</p>
                </div>
                {/* Fit Level Badge - clickable for transparency */}
                <button
                  onClick={() => setShowBreakdown(true)}
                  className="group/badge flex items-center gap-1"
                  title={t("matching.transparency.clickToSee")}
                >
                  <Badge variant="outline" className={cn("shrink-0 text-xs font-medium transition-all group-hover/badge:ring-2 group-hover/badge:ring-primary/50", fitLevel.color)}>
                    {t(`matching.fitLevel.${fitLevel.key}`)}
                  </Badge>
                  <HelpCircle className="h-4 w-4 text-muted-foreground opacity-50 transition-opacity group-hover/badge:opacity-100" />
                </button>
              </div>

              {/* Quick Info Row */}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {therapist.location.city}
                </span>
                <span className="flex items-center gap-1">
                  <Euro className="h-3 w-3" />
                  {therapist.pricePerSession}€
                </span>
                {therapist.experienceYears && (
                  <span className="flex items-center gap-1">
                    {therapist.experienceYears}J Erfahrung
                  </span>
                )}
                <StarRating rating={therapist.rating} size="sm" />
              </div>

              {/* Response Time & Availability Highlights */}
              <div className="mt-2 flex flex-wrap gap-2">
                {therapist.avgResponseTimeHours && therapist.avgResponseTimeHours <= 24 && (
                  <Badge variant="secondary" className="gap-1 text-[10px]">
                    <Clock className="h-3 w-3" />
                    {therapist.avgResponseTimeHours <= 2
                      ? t("matching.therapistCard.responseTimeFast")
                      : t("matching.therapistCard.responseTime", { hours: therapist.avgResponseTimeHours })}
                  </Badge>
                )}
                {nextSlotText && (
                  <Badge variant="secondary" className="gap-1 text-[10px] bg-green-500/10 text-green-600">
                    <Calendar className="h-3 w-3" />
                    {nextSlotText}
                  </Badge>
                )}
                {therapist.offersTrialSession && (
                  <Badge variant="secondary" className="gap-1 text-[10px] bg-blue-500/10 text-blue-600">
                    <Sparkles className="h-3 w-3" />
                    {therapist.trialSessionPrice === 0
                      ? t("matching.therapistCard.trialSessionFree")
                      : t("matching.therapistCard.trialSession", { price: `${therapist.trialSessionPrice}€` })}
                  </Badge>
                )}
              </div>

              {/* Specializations */}
              <div className="mt-2 flex flex-wrap gap-1">
                {therapist.specializations.slice(0, 3).map((spec) => (
                  <Badge key={spec} variant="outline" className="text-[10px]">
                    {tSpec(spec)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Personalized Reason */}
          <div className="border-t bg-gradient-to-r from-primary/5 to-transparent px-4 py-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{getPersonalizedReason()}</span>
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2">
            <div className="flex gap-1">
              {therapist.sessionType === "online" || therapist.sessionType === "both" ? (
                <Video className="h-4 w-4 text-muted-foreground" />
              ) : null}
              {therapist.sessionType === "in_person" || therapist.sessionType === "both" ? (
                <Building2 className="h-4 w-4 text-muted-foreground" />
              ) : null}
              {therapist.bookingRate && therapist.bookingRate > 50 && (
                <span className="ml-2 text-[10px] text-muted-foreground">
                  {t("matching.therapistCard.similarChose", { percent: Math.round(therapist.bookingRate) })}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {onCompareToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-7 w-7 p-0", isComparing && "text-primary")}
                  onClick={() => onCompareToggle(therapist.id)}
                >
                  <GitCompare className="h-4 w-4" />
                </Button>
              )}
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

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("matching.therapistCard.videoIntro")} – {therapist.name}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {therapist.videoIntroUrl && (
              <video
                src={therapist.videoIntroUrl}
                controls
                autoPlay
                className="h-full w-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Score Breakdown Modal */}
      <ScoreBreakdownModal
        open={showBreakdown}
        onOpenChange={setShowBreakdown}
        therapist={therapist}
        rank={rank}
      />
    </>
  );
}
