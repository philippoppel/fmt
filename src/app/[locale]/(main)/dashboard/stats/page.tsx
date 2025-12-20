import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import { StatsContent } from "./stats-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.stats" });

  return generateSeoMetadata({
    title: t("title"),
    description: t("subtitle"),
    locale,
    path: "/dashboard/stats",
    noIndex: true,
  });
}

export default async function StatsPage({ params }: Props) {
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
      contactCount: true,
      createdAt: true,
    },
  });

  if (!profile) {
    redirect(`/${locale}/dashboard/profile`);
  }

  // Check if user has access to stats (premium only)
  const hasAccess = profile.accountType === "premium";

  // Get stats for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const stats = hasAccess
    ? await db.profileStats.findMany({
        where: {
          profileId: profile.id,
          date: { gte: thirtyDaysAgo },
        },
        orderBy: { date: "asc" },
      })
    : [];

  return (
    <StatsContent
      hasAccess={hasAccess}
      accountType={profile.accountType}
      stats={stats.map((s) => ({
        date: s.date.toISOString(),
        views: s.views,
        impressions: s.impressions,
        contactClicks: s.contactClicks,
        profileClicks: s.profileClicks,
      }))}
      totalContacts={profile.contactCount}
      memberSince={profile.createdAt.toISOString()}
    />
  );
}
