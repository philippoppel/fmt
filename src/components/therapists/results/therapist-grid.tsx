"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CompactTherapistCard } from "./compact-therapist-card";
import { TherapistDetailModal } from "./therapist-detail-modal";
import { SectionHeader } from "./section-header";
import type { Therapist } from "@/types/therapist";

interface TherapistResult {
  therapist: Therapist;
  matchScore?: number;
}

interface TherapistGridProps {
  therapists: TherapistResult[];
}

export function TherapistGrid({ therapists }: TherapistGridProps) {
  const t = useTranslations("therapists.results");
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = (result: TherapistResult) => {
    setSelectedTherapist(result);
    setModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setSelectedTherapist(null);
    }
  };

  if (therapists.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="therapists-heading">
      <SectionHeader
        title={t("sectionTherapists")}
        count={therapists.length}
        variant="primary"
      />

      <div
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
        role="list"
        aria-label={t("sectionTherapists")}
      >
        {therapists.map((result) => (
          <div key={result.therapist.id} role="listitem">
            <CompactTherapistCard
              therapist={result.therapist}
              matchScore={result.matchScore}
              onClick={() => handleCardClick(result)}
            />
          </div>
        ))}
      </div>

      <TherapistDetailModal
        therapist={selectedTherapist?.therapist ?? null}
        matchScore={selectedTherapist?.matchScore}
        open={modalOpen}
        onOpenChange={handleModalClose}
      />
    </section>
  );
}
