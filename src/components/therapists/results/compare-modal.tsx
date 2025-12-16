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
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Euro,
  Video,
  Building2,
  Clock,
  Calendar,
  BadgeCheck,
  X,
  Target,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Globe,
  Shield,
  Sparkles,
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

function getFitLevel(score: number): { key: string; color: string; bgColor: string } {
  if (score >= 85) return { key: "excellent", color: "text-success-foreground", bgColor: "bg-success" };
  if (score >= 70) return { key: "high", color: "text-accent-emerald-foreground", bgColor: "bg-accent-emerald" };
  if (score >= 50) return { key: "good", color: "text-info-foreground", bgColor: "bg-info" };
  return { key: "moderate", color: "text-muted-foreground", bgColor: "bg-muted-foreground" };
}

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "bg-green-500";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-orange-500";
}

export function CompareModal({ open, onOpenChange, therapists, onRemove }: CompareModalProps) {
  const t = useTranslations();
  const tSpec = useTranslations("therapists.specialties");
  const tSub = useTranslations("matching.subtopics");
  const tLang = useTranslations("therapists.languages");
  const tIns = useTranslations("therapists.filters.insurance");

  if (therapists.length === 0) return null;

  // Find the best values for highlighting
  const bestScore = Math.max(...therapists.map(th => th.matchScore));
  const lowestPrice = Math.min(...therapists.map(th => th.pricePerSession));
  const mostExperience = Math.max(...therapists.map(th => th.experienceYears || 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base sm:text-lg">{t("matching.compare.title")}</DialogTitle>
        </DialogHeader>

        {/* Mobile: Cards view, Desktop: Table view */}
        <div className="space-y-4">
          {/* Therapist Headers */}
          <div className={cn(
            "grid gap-3",
            therapists.length === 2 && "grid-cols-2",
            therapists.length === 3 && "grid-cols-3"
          )}>
            {therapists.map((th) => {
              const fitLevel = getFitLevel(th.matchScore);
              const isBestMatch = th.matchScore === bestScore;

              return (
                <div
                  key={th.id}
                  className={cn(
                    "relative rounded-xl border p-3 sm:p-4",
                    isBestMatch && "border-primary/50 bg-primary/5"
                  )}
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemove(th.id)}
                    className="absolute -right-1.5 -top-1.5 sm:-right-2 sm:-top-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 z-10"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>

                  {/* Best Match Badge */}
                  {isBestMatch && (
                    <div className="absolute left-2 top-2">
                      <Badge className="gap-1 bg-primary text-primary-foreground text-[9px] sm:text-[10px]">
                        <Sparkles className="h-2.5 w-2.5" />
                        Top
                      </Badge>
                    </div>
                  )}

                  {/* Profile */}
                  <div className="flex flex-col items-center gap-2 pt-4">
                    <div className="relative h-12 w-12 sm:h-16 sm:w-16 overflow-hidden rounded-full bg-muted">
                      <Image
                        src={th.imageUrl}
                        alt={th.name}
                        fill
                        className="object-cover"
                      />
                      {th.isVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-background shadow">
                          <BadgeCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-xs sm:text-sm line-clamp-1">{th.name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{th.title}</p>
                    </div>

                    {/* Match Score */}
                    <div className="w-full mt-2">
                      <div className="h-2.5 sm:h-3 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full transition-all", fitLevel.bgColor)}
                          style={{ width: `${th.matchScore}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-1.5">
                        <span className={cn("text-base sm:text-lg font-bold", fitLevel.color)}>{th.matchScore}%</span>
                      </div>
                      <p className={cn("text-xs sm:text-sm font-medium text-center", fitLevel.color)}>
                        {t(`matching.fitLevel.${fitLevel.key}`)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison Sections */}
          <div className="space-y-3">
            {/* Score Breakdown */}
            <div className="rounded-lg border p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-primary" />
                {t("matching.compare.title")}
              </h4>
              <div className="space-y-3">
                {/* Specialization */}
                <CompareRow
                  label={t("matching.compare.specialization")}
                  icon={<Target className="h-3 w-3 text-blue-500" />}
                >
                  {therapists.map((th) => {
                    const cat = th.scoreBreakdown?.categories?.specialization;
                    const pct = cat ? Math.round((cat.score / cat.maxScore) * 100) : 0;
                    return (
                      <div key={th.id} className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full rounded-full", getScoreColor(pct))} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-medium w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </CompareRow>

                {/* Experience */}
                <CompareRow
                  label={t("matching.compare.experience")}
                  icon={<TrendingUp className="h-3 w-3 text-purple-500" />}
                >
                  {therapists.map((th) => {
                    const cat = th.scoreBreakdown?.categories?.intensityExperience;
                    const pct = cat ? Math.round((cat.score / cat.maxScore) * 100) : 0;
                    return (
                      <div key={th.id} className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full rounded-full", getScoreColor(pct))} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-medium w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </CompareRow>

                {/* Practical Criteria */}
                <CompareRow
                  label={t("matching.compare.criteria")}
                  icon={<Briefcase className="h-3 w-3 text-green-500" />}
                >
                  {therapists.map((th) => {
                    const cat = th.scoreBreakdown?.categories?.practicalCriteria;
                    const pct = cat ? Math.round((cat.score / cat.maxScore) * 100) : 0;
                    return (
                      <div key={th.id} className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full rounded-full", getScoreColor(pct))} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-medium w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </CompareRow>
              </div>
            </div>

            {/* Practical Info */}
            <div className="rounded-lg border p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                {t("matching.compare.practicalDetails")}
              </h4>
              <div className="space-y-3">
                {/* Price */}
                <CompareRow label={t("matching.compare.pricePerSession")} icon={<Euro className="h-3 w-3 text-amber-500" />}>
                  {therapists.map((th) => (
                    <div key={th.id} className="flex-1 text-center">
                      <span className={cn(
                        "text-xs sm:text-sm font-semibold",
                        th.pricePerSession === lowestPrice && "text-green-600"
                      )}>
                        {th.pricePerSession}€
                      </span>
                      {th.pricePerSession === lowestPrice && (
                        <Badge variant="secondary" className="ml-1 text-[8px] px-1 py-0 bg-success-muted text-success-foreground">
                          {t("matching.compare.cheapest")}
                        </Badge>
                      )}
                    </div>
                  ))}
                </CompareRow>

                {/* Experience Years */}
                <CompareRow label={t("matching.compare.experience")} icon={<TrendingUp className="h-3 w-3 text-purple-500" />}>
                  {therapists.map((th) => (
                    <div key={th.id} className="flex-1 text-center">
                      <span className={cn(
                        "text-xs sm:text-sm",
                        th.experienceYears === mostExperience && th.experienceYears && "font-semibold text-purple-600"
                      )}>
                        {th.experienceYears ? `${th.experienceYears} J.` : "–"}
                      </span>
                    </div>
                  ))}
                </CompareRow>

                {/* Session Type */}
                <CompareRow label={t("matching.compare.format")} icon={<Video className="h-3 w-3 text-blue-500" />}>
                  {therapists.map((th) => (
                    <div key={th.id} className="flex-1 flex justify-center gap-1">
                      {(th.sessionType === "online" || th.sessionType === "both") && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0.5">
                          <Video className="mr-0.5 h-2.5 w-2.5" />
                          {t("therapists.filters.sessionType.online")}
                        </Badge>
                      )}
                      {(th.sessionType === "in_person" || th.sessionType === "both") && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0.5">
                          <Building2 className="mr-0.5 h-2.5 w-2.5" />
                          {t("therapists.filters.sessionType.inPerson")}
                        </Badge>
                      )}
                    </div>
                  ))}
                </CompareRow>

                {/* Availability */}
                <CompareRow label={t("matching.compare.availability")} icon={<Calendar className="h-3 w-3 text-green-500" />}>
                  {therapists.map((th) => (
                    <div key={th.id} className="flex-1 text-center">
                      {th.nextAvailableSlot ? (
                        (() => {
                          const d = new Date(th.nextAvailableSlot);
                          const now = new Date();
                          const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          if (diffDays <= 7) {
                            return (
                              <Badge className="bg-success-muted text-success-foreground text-[9px]">
                                {t("matching.compare.thisWeek")}
                              </Badge>
                            );
                          }
                          return (
                            <span className="text-[10px] text-muted-foreground">
                              {d.toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
                            </span>
                          );
                        })()
                      ) : (
                        <span className="text-[10px] text-muted-foreground">–</span>
                      )}
                    </div>
                  ))}
                </CompareRow>

                {/* Languages */}
                <CompareRow label={t("matching.compare.languages")} icon={<Globe className="h-3 w-3 text-indigo-500" />}>
                  {therapists.map((th) => (
                    <div key={th.id} className="flex-1 flex justify-center flex-wrap gap-0.5">
                      {th.languages.slice(0, 3).map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-[8px] px-1 py-0">
                          {tLang(lang)}
                        </Badge>
                      ))}
                    </div>
                  ))}
                </CompareRow>

                {/* Insurance */}
                <CompareRow label={t("matching.compare.insurance")} icon={<Shield className="h-3 w-3 text-teal-500" />}>
                  {therapists.map((th) => (
                    <div key={th.id} className="flex-1 flex justify-center flex-wrap gap-0.5">
                      {th.insurance.map((ins) => (
                        <Badge key={ins} variant="outline" className="text-[8px] px-1 py-0">
                          {tIns(ins)}
                        </Badge>
                      ))}
                    </div>
                  ))}
                </CompareRow>
              </div>
            </div>

            {/* Specializations */}
            <div className="rounded-lg border p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-primary" />
                {t("matching.compare.specialization")}
              </h4>
              <div className={cn(
                "grid gap-2",
                therapists.length === 2 && "grid-cols-2",
                therapists.length === 3 && "grid-cols-3"
              )}>
                {therapists.map((th) => (
                  <div key={th.id} className="flex flex-wrap gap-1 justify-center">
                    {th.specializations.slice(0, 4).map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-[9px]">
                        {tSpec(spec)}
                      </Badge>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Match Reasons */}
            <div className="rounded-lg border border-success-border bg-success-muted p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2 text-success-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("matching.compare.whyMatch")}
              </h4>
              <div className={cn(
                "grid gap-3",
                therapists.length === 2 && "grid-cols-2",
                therapists.length === 3 && "grid-cols-3"
              )}>
                {therapists.map((th) => (
                  <div key={th.id} className="space-y-1">
                    {th.scoreBreakdown?.matchReasons?.slice(0, 3).map((reason, i) => {
                      let displayReason = reason;
                      if (reason.startsWith("expertIn:")) {
                        const specs = reason.replace("expertIn:", "").split(", ");
                        displayReason = t("matching.results.reasons.expertIn", {
                          specialties: specs.map(s => tSpec(s.trim())).join(", ")
                        });
                      } else if (reason.startsWith("preciseMatch:")) {
                        const subTopics = reason.replace("preciseMatch:", "").split(", ");
                        const translated = subTopics.map(st => {
                          const key = st.trim().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
                          return tSub(key);
                        }).join(", ");
                        displayReason = t("matching.results.reasons.preciseMatch", { topics: translated });
                      } else if (t.has(`matching.results.reasons.${reason}`)) {
                        displayReason = t(`matching.results.reasons.${reason}`);
                      }
                      return (
                        <div key={i} className="flex items-start gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                          <span>{displayReason}</span>
                        </div>
                      );
                    })}
                    {(!th.scoreBreakdown?.matchReasons || th.scoreBreakdown.matchReasons.length === 0) && (
                      <span className="text-[10px] text-muted-foreground">–</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={cn(
            "grid gap-2 pt-2",
            therapists.length === 2 && "grid-cols-2",
            therapists.length === 3 && "grid-cols-3"
          )}>
            {therapists.map((th) => (
              <div key={th.id} className="flex flex-col gap-1.5">
                <Button asChild size="sm" className="w-full text-xs">
                  <Link href={`/therapists/${th.id}`}>
                    {t("therapists.viewProfile")}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  {t("therapists.contact")}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for comparison rows
function CompareRow({
  label,
  icon,
  children
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 w-20 sm:w-24 shrink-0">
        {icon}
        <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{label}</span>
      </div>
      <div className="flex-1 flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}
