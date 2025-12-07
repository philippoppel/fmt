import { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import { RegisterForm } from "./register-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.register" });

  return generateSeoMetadata({
    title: t("title"),
    description: t("description"),
    locale,
    path: "/auth/register",
    noIndex: true,
  });
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RegisterForm />;
}
