import { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import { MissionPageContent } from "@/components/mission/mission-page-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "navigation" });

  const descriptions: Record<string, string> = {
    de: "Die richtige Therapie fühlt sich an wie eine gute Empfehlung. Wir helfen dir, genau diese zu finden – digital, transparent und in deinem Tempo.",
    en: "The right therapy feels like a trusted recommendation. We help you find exactly that – digital, transparent, and at your own pace.",
  };

  return generateSeoMetadata({
    title: `${t("mission")} – FindMyTherapy`,
    description: descriptions[locale] || descriptions.de,
    locale,
    path: "/about",
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <MissionPageContent />
    </Suspense>
  );
}
