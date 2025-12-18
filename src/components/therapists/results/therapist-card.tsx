"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { MapPin, Euro, Video, Building2, UserCircle, ExternalLink } from "lucide-react";
import type { Therapist } from "@/types/therapist";
import { MatchScoreBadge } from "./match-score-badge";

// Generate URL-friendly slug from therapist name (fallback if slug not available)
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9-]/g, "");
}

// Get the profile URL using the slug (or generate from name as fallback)
function getProfileUrl(therapist: Therapist): string {
  const slug = therapist.slug || generateSlug(therapist.name);
  return `/p/${slug}`;
}

interface TherapistCardProps {
  therapist: Therapist;
  matchScore?: number;
}

export function TherapistCard({ therapist, matchScore }: TherapistCardProps) {
  const t = useTranslations("therapists");
  const tFilters = useTranslations("therapists.filters");
  const tSpec = useTranslations("therapists.specialties");

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/10 border-l-4 border-l-primary">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Profile Image */}
          <div className="relative aspect-square w-full sm:h-auto sm:w-40 shrink-0">
            <Image
              src={therapist.imageUrl}
              alt={`${t("profileImageAlt")} ${therapist.name}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 160px"
            />
            <Badge className="absolute left-2 top-2 bg-primary hover:bg-primary/90 gap-1">
              <UserCircle className="h-3 w-3" aria-hidden="true" />
              {t("therapist")}
            </Badge>
            {matchScore !== undefined && (
              <div className="absolute right-2 top-2">
                <MatchScoreBadge score={matchScore} size="md" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col p-4">
            <div className="flex-1 space-y-3">
              {/* Name & Title */}
              <div>
                <h3 className="text-lg font-semibold leading-tight">
                  {therapist.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {therapist.title}
                </p>
              </div>

              {/* Specializations */}
              <div className="flex flex-wrap gap-1.5">
                {therapist.specializations.slice(0, 3).map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {tSpec(spec)}
                  </Badge>
                ))}
                {therapist.specializations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{therapist.specializations.length - 3}
                  </Badge>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {therapist.location.city}
                </span>
                <span className="flex items-center gap-1">
                  <Euro className="h-3.5 w-3.5" aria-hidden="true" />
                  {therapist.pricePerSession}
                  {t("perSession")}
                </span>
                {(therapist.sessionType === "online" ||
                  therapist.sessionType === "both") && (
                  <span className="flex items-center gap-1">
                    <Video className="h-3.5 w-3.5" aria-hidden="true" />
                    {tFilters("online")}
                  </span>
                )}
                {(therapist.sessionType === "in_person" ||
                  therapist.sessionType === "both") && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("inPerson")}
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <StarRating rating={therapist.rating} showValue />
                <span className="text-sm text-muted-foreground">
                  ({therapist.reviewCount} {t("reviews")})
                </span>
              </div>

              {/* Description */}
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {therapist.shortDescription}
              </p>
            </div>

            {/* Action */}
            <div className="mt-4 pt-4 border-t">
              <Button asChild className="w-full sm:w-auto gap-2">
                <a
                  href={getProfileUrl(therapist)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("viewProfile")}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
