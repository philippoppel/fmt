import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import { CustomizeContent } from "./customize-content";
import type { ThemeName } from "@/types/profile";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.customize" });

  return generateSeoMetadata({
    title: t("title"),
    description: t("subtitle"),
    locale,
    path: "/dashboard/customize",
    noIndex: true,
  });
}

export default async function CustomizePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/login`);
  }

  const profile = await db.therapistProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      accountType: true,
      themeName: true,
      themeColor: true,
      slug: true,
      galleryImages: true,
      headline: true,
      specializationRanks: true,
    },
  });

  if (!profile) {
    redirect(`/${locale}/dashboard/profile`);
  }

  // Check if user has access to customization (mittel or premium)
  const hasAccess = profile.accountType === "mittel" || profile.accountType === "premium";

  return (
    <CustomizeContent
      hasAccess={hasAccess}
      accountType={profile.accountType}
      initialData={{
        themeName: (profile.themeName as ThemeName) || "warm",
        themeColor: profile.themeColor || "#F97316",
        headline: profile.headline || "",
        galleryImages: profile.galleryImages || [],
        specializationRanks: (profile.specializationRanks as Record<string, number>) || {},
      }}
      slug={profile.slug}
    />
  );
}
