import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "navigation" });

  const descriptions: Record<string, string> = {
    de: "Erfahren Sie mehr über uns und unsere Mission, barrierefreie Webanwendungen zu entwickeln.",
    en: "Learn more about us and our mission to develop accessible web applications.",
    fr: "En savoir plus sur nous et notre mission de développer des applications web accessibles.",
    es: "Conozca más sobre nosotros y nuestra misión de desarrollar aplicaciones web accesibles.",
    it: "Scopri di più su di noi e la nostra missione di sviluppare applicazioni web accessibili.",
  };

  return generateSeoMetadata({
    title: t("about"),
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

function AboutPageContent() {
  const t = useTranslations("navigation");

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold">{t("about")}</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Diese Seite ist noch in Entwicklung.
      </p>
    </div>
  );
}
