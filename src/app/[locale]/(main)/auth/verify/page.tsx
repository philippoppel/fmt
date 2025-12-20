import { getTranslations } from "next-intl/server";
import { VerifyForm } from "./verify-form";

export async function generateMetadata() {
  const t = await getTranslations("auth.verify");
  return {
    title: t("title"),
  };
}

interface VerifyPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { token } = await searchParams;
  return <VerifyForm token={token} />;
}
