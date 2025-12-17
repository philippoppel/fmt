import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer" });

  const descriptions: Record<string, string> = {
    de: "Informationen zur Barrierefreiheit unserer Plattform.",
    en: "Accessibility information for our platform.",
  };

  return generateSeoMetadata({
    title: t("links.accessibility"),
    description: descriptions[locale] || descriptions.de,
    locale,
    path: "/accessibility",
  });
}

export default async function AccessibilityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AccessibilityPageContent />;
}

function AccessibilityPageContent() {
  const t = useTranslations("footer");

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold">{t("links.accessibility")}</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Diese Seite ist noch in Entwicklung.
      </p>
    </div>
  );
}
