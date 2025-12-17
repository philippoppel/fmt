import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import { SearchPage } from "@/components/therapists/search-page";
import { Loader2 } from "lucide-react";

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

function SearchPageFallback() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

export default async function TherapistsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPage />
    </Suspense>
  );
}
