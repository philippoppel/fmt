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
    de: "Kontaktieren Sie uns. Wir freuen uns auf Ihre Nachricht.",
    en: "Contact us. We look forward to hearing from you.",
    fr: "Contactez-nous. Nous sommes impatients de vous entendre.",
    es: "Contáctenos. Esperamos saber de usted.",
    it: "Contattaci. Non vediamo l'ora di sentirti.",
  };

  return generateSeoMetadata({
    title: t("contact"),
    description: descriptions[locale] || descriptions.de,
    locale,
    path: "/contact",
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContactPageContent />;
}

function ContactPageContent() {
  const t = useTranslations("navigation");

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold">{t("contact")}</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Diese Seite ist noch in Entwicklung.
      </p>
    </div>
  );
}
