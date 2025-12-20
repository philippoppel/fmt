import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BillingContent } from "./billing-content";

export async function generateMetadata() {
  const t = await getTranslations("dashboard.billing");
  return {
    title: t("title"),
  };
}

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return <BillingContent />;
}
