"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Sparkles,
  GitCompare,
  User,
  MessageCircle,
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

const rankConfig: Record<number, { Icon: typeof Crown; color: string; bg: string; ring: string }> = {
  1: { Icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/20", ring: "ring-yellow-500/30" },
  2: { Icon: Medal, color: "text-slate-400", bg: "bg-slate-400/20", ring: "ring-slate-400/30" },
  3: { Icon: Award, color: "text-amber-600", bg: "bg-amber-600/20", ring: "ring-amber-600/30" },
};

function getFitLevel(score: number): { key: string; color: string; bgColor: string } {
  if (score >= 85) return { key: "excellent", color: "text-success-foreground", bgColor: "bg-success-muted" };
  if (score >= 70) return { key: "high", color: "text-accent-emerald-foreground", bgColor: "bg-accent-emerald-muted" };
  if (score >= 50) return { key: "good", color: "text-info-foreground", bgColor: "bg-info-muted" };
  return { key: "moderate", color: "text-muted-foreground", bgColor: "bg-muted" };
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
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const config = rankConfig[rank] ?? { Icon: CheckCircle2, color: "text-primary", bg: "bg-primary/20", ring: "ring-primary/30" };
  const RankIcon = config.Icon;
  const fitLevel = getFitLevel(therapist.matchScore);
  const nextSlotText = formatNextSlot(therapist.nextAvailableSlot, t);

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden bg-card transition-all hover:shadow-xl",
          rank === 1 && "ring-2",
          rank === 1 && config.ring,
          isComparing && "ring-2 ring-primary"
        )}
      >
        <CardContent className="p-0">
          {/* Large Photo Section - Top */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
            <Image
              src={therapist.imageUrl}
              alt={therapist.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={rank <= 3}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Rank Badge - Top Left */}
            <div className={cn(
              "absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-lg backdrop-blur-sm",
              config.bg
            )}>
              <RankIcon className={cn("h-5 w-5", config.color)} />
            </div>

            {/* Video Play Button */}
            {therapist.videoIntroUrl && (
              <button
                onClick={() => setShowVideoModal(true)}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-110"
              >
                <Play className="h-5 w-5 text-primary" fill="currentColor" />
              </button>
            )}

            {/* Verified Badge - Bottom Right of Image */}
            {therapist.isVerified && (
              <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg">
                <BadgeCheck className="h-5 w-5 text-blue-500" />
              </div>
            )}

            {/* Name & Title Overlay - Bottom of Image */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-bold text-white drop-shadow-md">{therapist.name}</h3>
              <p className="text-sm text-white/90 drop-shadow-md">{therapist.title}</p>
            </div>
          </div>

          {/* Content Section - Fixed height structure */}
          <div className="flex min-h-[180px] flex-col p-4">
            {/* Fit Level Badge - Prominent */}
            <div className="flex items-center justify-between">
              <Badge
                className={cn(
                  "px-3 py-1.5 text-sm font-semibold",
                  fitLevel.bgColor,
                  fitLevel.color
                )}
              >
                {t(`matching.fitLevel.${fitLevel.key}`)}
              </Badge>
              <div className="flex items-center gap-1 text-muted-foreground">
                {therapist.sessionType === "online" || therapist.sessionType === "both" ? (
                  <Video className="h-4 w-4" />
                ) : null}
                {therapist.sessionType === "in_person" || therapist.sessionType === "both" ? (
                  <Building2 className="h-4 w-4" />
                ) : null}
              </div>
            </div>

            {/* Quick Info Row */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {therapist.location.city}
              </span>
              <span className="flex items-center gap-1">
                <Euro className="h-3.5 w-3.5" />
                {therapist.pricePerSession}€
              </span>
              {therapist.experienceYears && (
                <span>{t("matching.therapistCard.yearsExperience", { years: therapist.experienceYears })}</span>
              )}
            </div>

            {/* Availability Highlights - Fixed height area */}
            <div className="mt-3 flex min-h-[28px] flex-wrap gap-1.5">
              {therapist.avgResponseTimeHours && therapist.avgResponseTimeHours <= 24 && (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Clock className="h-3 w-3" />
                  {therapist.avgResponseTimeHours <= 2
                    ? t("matching.therapistCard.responseTimeFast")
                    : t("matching.therapistCard.responseTime", { hours: therapist.avgResponseTimeHours })}
                </Badge>
              )}
              {nextSlotText && (
                <Badge variant="secondary" className="gap-1 text-[10px] bg-success-muted text-success-foreground">
                  <Calendar className="h-3 w-3" />
                  {nextSlotText}
                </Badge>
              )}
              {therapist.offersTrialSession && (
                <Badge variant="secondary" className="gap-1 text-[10px] bg-info-muted text-info-foreground">
                  <Sparkles className="h-3 w-3" />
                  {therapist.trialSessionPrice === 0
                    ? t("matching.therapistCard.trialSessionFree")
                    : t("matching.therapistCard.trialSession", { price: `${therapist.trialSessionPrice}€` })}
                </Badge>
              )}
            </div>

            {/* Score with Details Button - Push to bottom */}
            <button
              onClick={() => setShowBreakdown(true)}
              className="mt-auto flex w-full items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 transition-all hover:border-primary/40 hover:bg-primary/10"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{therapist.matchScore}%</span>
                <span className="text-xs text-muted-foreground">{t("matching.results.matchScore")}</span>
              </div>
              <div className="flex items-center gap-1 text-primary/70 hover:text-primary">
                <HelpCircle className="h-5 w-5" />
              </div>
            </button>
          </div>

          {/* Footer Actions - Clean icon buttons with labels */}
          <div className="grid grid-cols-3 border-t">
            {onCompareToggle && (
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] transition-colors hover:bg-muted/50",
                  isComparing ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}
                onClick={() => onCompareToggle(therapist.id)}
              >
                <GitCompare className="h-4 w-4" />
                <span>{isComparing ? t("matching.compare.added") : t("matching.compare.addShort")}</span>
              </button>
            )}
            <Link
              href={`/p/${therapist.slug || therapist.id}`}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <User className="h-4 w-4" />
              <span>{t("therapists.viewProfile")}</span>
            </Link>
            <button
              className="flex flex-col items-center justify-center gap-0.5 rounded-br-lg bg-primary/10 py-2.5 text-[10px] text-primary transition-colors hover:bg-primary/20"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{t("therapists.contact")}</span>
            </button>
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
