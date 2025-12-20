"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Video, Building2, Euro, Shield, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Therapist } from "@/types/therapist";

interface TherapistDetailModalProps {
  therapist: Therapist | null;
  matchScore?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TherapistDetailModal({
  therapist,
  matchScore,
  open,
  onOpenChange,
}: TherapistDetailModalProps) {
  const t = useTranslations("therapists");
  const tSpec = useTranslations("therapists.specialties");
  const tFilters = useTranslations("therapists.filters");

  if (!therapist) return null;

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500 text-white";
    if (score >= 60) return "bg-yellow-500 text-white";
    if (score >= 40) return "bg-orange-500 text-white";
    return "bg-gray-500 text-white";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] p-0 gap-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-5">
            {/* Header with Image and Name */}
            <DialogHeader className="space-y-0">
              <div className="flex gap-4">
                {/* Profile Image */}
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={therapist.imageUrl}
                    alt={therapist.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>

                {/* Name & Title */}
                <div className="flex flex-col justify-center space-y-2">
                  <DialogTitle className="text-xl font-bold leading-tight">
                    {therapist.name}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {therapist.title}
                  </p>

                  {/* Match Score */}
                  {matchScore !== undefined && (
                    <span
                      className={cn(
                        "inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-bold shadow-sm",
                        getMatchScoreColor(matchScore)
                      )}
                    >
                      {matchScore}% Match
                    </span>
                  )}
                </div>
              </div>
            </DialogHeader>

            {/* Specializations */}
            <div className="flex flex-wrap gap-1.5">
              {therapist.specializations.map((spec) => (
                <Badge key={spec} variant="secondary" className="text-xs">
                  {tSpec(spec)}
                </Badge>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={therapist.rating} showValue />
              <span className="text-sm text-muted-foreground">
                ({therapist.reviewCount} {t("reviews")})
              </span>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Details Grid */}
            <div className="grid gap-3 text-sm">
              {/* Location */}
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{therapist.location.city}</span>
              </div>

              {/* Session Type */}
              <div className="flex items-center gap-3">
                {therapist.sessionType === "online" && (
                  <>
                    <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{tFilters("sessionType.online")}</span>
                  </>
                )}
                {therapist.sessionType === "in_person" && (
                  <>
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{tFilters("sessionType.in_person")}</span>
                  </>
                )}
                {therapist.sessionType === "both" && (
                  <>
                    <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>
                      {tFilters("sessionType.online")} & {tFilters("sessionType.in_person")}
                    </span>
                  </>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <Euro className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>
                  {therapist.pricePerSession}€ {t("perSession")}
                </span>
              </div>

              {/* Insurance */}
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>
                  {therapist.insurance
                    .map((ins) => tFilters(`insurance.${ins}`))
                    .join(" & ")}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {therapist.shortDescription}
            </p>

            {/* CTA Button */}
            <Button asChild className="w-full gap-2" size="lg">
              <Link href={`/p/${therapist.slug || therapist.id}`} target="_blank">
                {t("viewProfile")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
