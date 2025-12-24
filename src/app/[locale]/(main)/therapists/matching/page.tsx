import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { MatchingWizardWrapper } from "@/components/matching/matching-wizard-wrapper";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("matching.meta");

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
  };
}

type Props = {
  searchParams: Promise<{ topic?: string; resume?: string }>;
};

export default async function MatchingPage({ searchParams }: Props) {
  const { topic } = await searchParams;
  return (
    <Suspense
      fallback={
        <div className="flex h-[100dvh] items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <MatchingWizardWrapper initialTopic={topic} />
    </Suspense>
  );
}
