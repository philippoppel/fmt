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

type Props = {
  searchParams: Promise<{ topic?: string }>;
};

export default async function MatchingPage({ searchParams }: Props) {
  const { topic } = await searchParams;
  return <MatchingWizard initialTopic={topic} />;
}
