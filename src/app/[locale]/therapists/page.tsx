import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import { SearchPage } from "@/components/therapists/search-page";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "therapists.meta" });

  return generateSeoMetadata({
    title: t("title"),
    description: t("description"),
    locale,
    path: "/therapists",
    keywords: [
      "Therapeuten",
      "Psychotherapie",
      "Therapie finden",
      "Mental Health",
      "Psychologe",
      "Therapist",
    ],
  });
}

export default async function TherapistsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SearchPage />;
}
