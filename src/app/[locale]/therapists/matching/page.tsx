import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MatchingWizard } from "@/components/matching";

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

export default function MatchingPage() {
  return <MatchingWizard />;
}
