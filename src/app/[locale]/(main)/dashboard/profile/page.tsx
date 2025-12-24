import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import { ProfileContent } from "./profile-content";
import type { AccountType } from "@/types/therapist";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.profile" });

  return generateSeoMetadata({
    title: t("title"),
    description: t("subtitle"),
    locale,
    path: "/dashboard/profile",
    noIndex: true,
  });
}

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/login`);
  }

  const profile = await db.therapistProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });

  if (!profile) {
    // Create profile if it doesn't exist (for OAuth users)
    await db.therapistProfile.create({
      data: { userId: session.user.id },
    });
    redirect(`/${locale}/dashboard/profile`);
  }

  return (
    <ProfileContent
      initialData={{
        name: profile.user.name || "",
        title: profile.title || "",
        imageUrl: profile.imageUrl || "",
        shortDescription: profile.shortDescription || "",
        city: profile.city || "",
        postalCode: profile.postalCode || "",
        specializations: profile.specializations,
        specializationRanks: (profile.specializationRanks as Record<string, number>) || {},
        therapyTypes: profile.therapyTypes,
        languages: profile.languages,
        insurance: profile.insurance,
        pricePerSession: profile.pricePerSession || 0,
        sessionType: profile.sessionType,
        availability: profile.availability,
        gender: profile.gender,
      }}
      accountType={(profile.accountType as AccountType) || "gratis"}
      slug={profile.slug}
    />
  );
}
