"use client";

import { useTranslations } from "next-intl";
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
import {
  MapPin,
  Euro,
  Video,
  Building2,
  Clock,
  Calendar,
  BadgeCheck,
  X,
} from "lucide-react";
import type { MatchedTherapist } from "@/types/therapist";
import { cn } from "@/lib/utils";

interface CompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  therapists: Array<MatchedTherapist & {
    videoIntroUrl?: string;
    avgResponseTimeHours?: number;
    nextAvailableSlot?: Date | string;
    offersTrialSession?: boolean;
    trialSessionPrice?: number;
    experienceYears?: number;
    therapyMethods?: string[];
  }>;
  onRemove: (id: string) => void;
}

function getFitLevel(score: number): { key: string; color: string } {
  if (score >= 85) return { key: "excellent", color: "text-green-500" };
  if (score >= 70) return { key: "high", color: "text-emerald-500" };
  if (score >= 50) return { key: "good", color: "text-blue-500" };
  return { key: "moderate", color: "text-muted-foreground" };
}

export function CompareModal({ open, onOpenChange, therapists, onRemove }: CompareModalProps) {
  const t = useTranslations();
  const tSpec = useTranslations("therapists.specialties");

  if (therapists.length === 0) return null;

  const compareRows = [
    {
      label: t("matching.compare.specialization"),
      render: (th: typeof therapists[0]) => (
        <div className="flex flex-wrap gap-1">
          {th.specializations.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary" className="text-[10px]">
              {tSpec(spec)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      label: t("matching.compare.experience"),
      render: (th: typeof therapists[0]) => (
        <span>{th.experienceYears ? `${th.experienceYears} Jahre` : "–"}</span>
      ),
    },
    {
      label: t("matching.compare.price"),
      render: (th: typeof therapists[0]) => (
        <span className="font-medium">{th.pricePerSession}€</span>
      ),
    },
    {
      label: t("matching.compare.rating"),
      render: (th: typeof therapists[0]) => (
        <StarRating rating={th.rating} size="sm" />
      ),
    },
    {
      label: t("matching.compare.availability"),
      render: (th: typeof therapists[0]) => {
        if (th.nextAvailableSlot) {
          const d = new Date(th.nextAvailableSlot);
          const now = new Date();
          const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) {
            return (
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-[10px]">
                <Calendar className="mr-1 h-3 w-3" />
                Diese Woche
              </Badge>
            );
          }
          return (
            <span className="text-xs">
              {d.toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
            </span>
          );
        }
        return <span className="text-muted-foreground">–</span>;
      },
    },
    {
      label: t("matching.compare.style"),
      render: (th: typeof therapists[0]) => (
        <div className="flex gap-1">
          {(th.sessionType === "online" || th.sessionType === "both") && (
            <Badge variant="outline" className="text-[10px]">
              <Video className="mr-1 h-3 w-3" />
              Online
            </Badge>
          )}
          {(th.sessionType === "in_person" || th.sessionType === "both") && (
            <Badge variant="outline" className="text-[10px]">
              <Building2 className="mr-1 h-3 w-3" />
              Vor Ort
            </Badge>
          )}
        </div>
      ),
    },
    {
      label: t("matching.compare.methods"),
      render: (th: typeof therapists[0]) => (
        <div className="flex flex-wrap gap-1">
          {th.therapyMethods?.slice(0, 2).map((method) => (
            <Badge key={method} variant="outline" className="text-[10px]">
              {method.toUpperCase()}
            </Badge>
          )) || <span className="text-muted-foreground">–</span>}
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("matching.compare.title")}</DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-32 p-2"></th>
                {therapists.map((th) => (
                  <th key={th.id} className="min-w-[200px] p-2">
                    <div className="relative rounded-lg border bg-card p-3">
                      {/* Remove Button */}
                      <button
                        onClick={() => onRemove(th.id)}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      {/* Profile */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
                          <Image
                            src={th.imageUrl}
                            alt={th.name}
                            fill
                            className="object-cover"
                          />
                          {th.isVerified && (
                            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background shadow">
                              <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-sm">{th.name}</p>
                          <p className="text-xs text-muted-foreground">{th.title}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", getFitLevel(th.matchScore).color)}
                        >
                          {t(`matching.fitLevel.${getFitLevel(th.matchScore).key}`)}
                        </Badge>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {th.location.city}
                        </p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                  <td className="p-3 text-sm font-medium text-muted-foreground">
                    {row.label}
                  </td>
                  {therapists.map((th) => (
                    <td key={th.id} className="p-3 text-sm">
                      {row.render(th)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="p-2"></td>
                {therapists.map((th) => (
                  <td key={th.id} className="p-2">
                    <div className="flex flex-col gap-2">
                      <Button asChild size="sm" className="w-full">
                        <Link href={`/therapists/${th.id}`}>
                          {t("therapists.viewProfile")}
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        {t("therapists.contact")}
                      </Button>
                    </div>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
