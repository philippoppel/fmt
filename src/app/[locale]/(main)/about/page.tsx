import { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import { AboutPageContent } from "@/components/about/about-page-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "navigation" });

  const descriptions: Record<string, string> = {
    de: "Wir helfen dir, die richtige Therapie zu finden. Gegründet von zwei Psychotherapeutinnen mit einer Vision: Psychische Gesundheit für alle zugänglich machen.",
    en: "We help you find the right therapy. Founded by two psychotherapists with a vision: Making mental health accessible for everyone.",
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

  return <AboutPageContent />;
}
