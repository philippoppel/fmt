"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Pencil,
  CheckCircle2,
  Scale,
  Shield,
  MapPin,
  Monitor,
  User2,
  CreditCard,
  Loader2,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMatching, type WizardStep } from "../matching-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MATCHING_TOPICS, getSubTopicsForTopics } from "@/lib/matching/topics";
import { searchWithMatching } from "@/lib/actions/matching";
import type { MatchedTherapist } from "@/types/therapist";
import Image from "next/image";
import Link from "next/link";

interface SummaryStepProps {
  onNavigateToStep?: (step: WizardStep) => void;
}

export function SummaryStep({ onNavigateToStep }: SummaryStepProps) {
  const t = useTranslations("matching");
  const { state, actions } = useMatching();

  // Top-3 therapist preview
  const [topTherapists, setTopTherapists] = useState<MatchedTherapist[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);

  // Get selected topic and subtopic details
  const selectedTopicDetails = MATCHING_TOPICS.filter((topic) =>
    state.selectedTopics.includes(topic.id)
  );

  const allSubTopics = getSubTopicsForTopics(state.selectedTopics);
  const selectedSubTopicDetails = allSubTopics.filter((st) =>
    state.selectedSubTopics.includes(st.id)
  );

  // Handle navigation to edit step
  const handleEditStep = (step: WizardStep) => {
    if (onNavigateToStep) {
      onNavigateToStep(step);
    } else {
      actions.setStep(step);
    }
  };

  // Fetch top 3 therapists preview
  useEffect(() => {
    const fetchPreview = async () => {
      setIsLoadingPreview(true);
      try {
        const result = await searchWithMatching({
          selectedTopics: state.selectedTopics,
          selectedSubTopics: state.selectedSubTopics,
          location: state.criteria.location || "",
          gender: state.criteria.gender,
          sessionType: state.criteria.sessionType,
          insurance: state.criteria.insurance,
        });
        // Take only top 3 for preview
        setTopTherapists(result.therapists.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch preview:", error);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [
    state.selectedTopics,
    state.selectedSubTopics,
    state.criteria.location,
    state.criteria.gender,
    state.criteria.sessionType,
    state.criteria.insurance,
  ]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{t("summary.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("summary.subtitle")}
          </p>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column: Topics & SubTopics */}
        <div className="space-y-4">
          {/* Topics Card */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{t("summary.yourTopics")}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditStep(1)}
                className="h-7 gap-1 px-2"
              >
                <Pencil className="h-3 w-3" />
                {t("summary.edit")}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTopicDetails.map((topic) => (
                <span
                  key={topic.id}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {t(`topics.${topic.id}`, { fallback: topic.labelKey })}
                </span>
              ))}
              {selectedTopicDetails.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  {t("summary.noTopicsSelected")}
                </span>
              )}
            </div>
          </div>

          {/* SubTopics Card */}
          {selectedSubTopicDetails.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{t("summary.yourDetails")}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditStep(1.25)}
                  className="h-7 gap-1 px-2"
                >
                  <Pencil className="h-3 w-3" />
                  {t("summary.edit")}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSubTopicDetails.map((st) => (
                  <span
                    key={st.id}
                    className="rounded-full bg-accent/50 px-3 py-1 text-xs font-medium"
                  >
                    {t(`subtopics.${st.id}`, { fallback: st.labelKey })}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Criteria */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{t("summary.yourPreferences")}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditStep(2)}
                className="h-7 gap-1 px-2"
              >
                <Pencil className="h-3 w-3" />
                {t("summary.edit")}
              </Button>
            </div>
            <dl className="space-y-2.5 text-sm">
              {state.criteria.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <dt className="text-muted-foreground">{t("summary.location")}:</dt>
                  <dd className="font-medium">{state.criteria.location}</dd>
                </div>
              )}
              {state.criteria.sessionType && (
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <dt className="text-muted-foreground">{t("summary.sessionType")}:</dt>
                  <dd className="font-medium">
                    {t(`counter.sessionTypes.${state.criteria.sessionType}`)}
                  </dd>
                </div>
              )}
              {state.criteria.gender && (
                <div className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-muted-foreground" />
                  <dt className="text-muted-foreground">{t("summary.gender")}:</dt>
                  <dd className="font-medium">
                    {t(`counter.genders.${state.criteria.gender}`)}
                  </dd>
                </div>
              )}
              {state.criteria.insurance.length > 0 && (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <dt className="text-muted-foreground">{t("summary.insurance")}:</dt>
                  <dd className="font-medium">
                    {state.criteria.insurance
                      .map((i) => t(`counter.insuranceTypes.${i}`))
                      .join(", ")}
                  </dd>
                </div>
              )}
              {!state.criteria.location &&
                !state.criteria.sessionType &&
                !state.criteria.gender &&
                state.criteria.insurance.length === 0 && (
                  <p className="text-muted-foreground text-xs">
                    {t("summary.noPreferencesSet")}
                  </p>
                )}
            </dl>
          </div>
        </div>
      </div>

      {/* Top-3 Therapist Preview */}
      <div>
        <h3 className="font-semibold mb-3">{t("summary.previewTitle")}</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {isLoadingPreview ? (
            <>
              <TherapistPreviewSkeleton />
              <TherapistPreviewSkeleton />
              <TherapistPreviewSkeleton />
            </>
          ) : topTherapists.length > 0 ? (
            topTherapists.map((therapist) => (
              <TherapistPreviewCard key={therapist.id} therapist={therapist} />
            ))
          ) : (
            <div className="col-span-3 rounded-lg border bg-muted/50 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t("summary.noPreviewAvailable")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transparency Section */}
      <div className="space-y-3">
        {/* Sorting Explanation */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Scale className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-primary">
                {t("summary.howWeSort")}
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("summary.sortingExplanation")}
              </p>
            </div>
          </div>
        </div>

        {/* Fairness Note */}
        <div className="rounded-lg border border-accent-emerald/30 bg-accent-emerald/5 p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-accent-emerald mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-accent-emerald">
                {t("summary.fairnessTitle")}
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("summary.fairnessNote")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TherapistPreviewCard({ therapist }: { therapist: MatchedTherapist }) {
  return (
    <Link
      href={`/therapists/${therapist.slug || therapist.id}`}
      target="_blank"
      className="group rounded-lg border bg-card p-3 hover:border-primary/50 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
          {therapist.imageUrl ? (
            <Image
              src={therapist.imageUrl}
              alt={therapist.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-medium text-muted-foreground">
              {therapist.name?.charAt(0) || "?"}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate group-hover:text-primary transition-colors">
            {therapist.name}
          </p>
          {therapist.title && (
            <p className="text-xs text-muted-foreground truncate">
              {therapist.title}
            </p>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {therapist.location?.city}
        </span>
        <span className="flex items-center gap-1 font-medium text-primary">
          <Star className="h-3 w-3 fill-primary" />
          {therapist.matchScore}%
        </span>
      </div>
    </Link>
  );
}

function TherapistPreviewSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}
