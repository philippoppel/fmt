import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { WizardV2 } from "@/components/matching/wizard-v2";

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

export default async function MatchingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <Suspense
        fallback={
          <div className="flex h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <WizardV2 />
      </Suspense>
    </div>
  );
}
