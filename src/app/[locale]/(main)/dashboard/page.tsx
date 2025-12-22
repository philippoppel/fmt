import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OverviewContent } from "./overview-content";

export async function generateMetadata() {
  const t = await getTranslations("dashboard.overview");
  return {
    title: t("title"),
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const profile = await db.therapistProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      profileStats: {
        orderBy: { date: "desc" },
        take: 30,
      },
    },
  });

  const isLabeller = session.user.role === "LABELLER" || session.user.role === "ADMIN";

  return (
    <OverviewContent
      profile={profile}
      userName={session.user.name}
      isLabeller={isLabeller}
    />
  );
}
