import { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import { TherapistsLandingContent } from "./landing-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "therapistsLanding" });

  return generateSeoMetadata({
    title: t("meta.title"),
    description: t("meta.description"),
    locale,
    path: "/fuer-therapeuten",
  });
}

export default async function TherapistsLandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TherapistsLandingContent />;
}
