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
    de: "Datenschutzerklärung und Informationen zum Umgang mit Ihren Daten.",
    en: "Privacy policy and information about how we handle your data.",
  };

  return generateSeoMetadata({
    title: t("links.privacy"),
    description: descriptions[locale] || descriptions.de,
    locale,
    path: "/privacy",
  });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PrivacyPageContent />;
}

function PrivacyPageContent() {
  const t = useTranslations("footer");

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold">{t("links.privacy")}</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Diese Seite ist noch in Entwicklung.
      </p>
    </div>
  );
}
