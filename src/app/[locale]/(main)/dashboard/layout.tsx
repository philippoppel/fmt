import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Calculate profile completeness percentage
function calculateProfileCompleteness(profile: {
  imageUrl: string | null;
  title: string | null;
  shortDescription: string | null;
  city: string | null;
  postalCode: string | null;
  specializations: string[];
  therapyTypes: string[];
  languages: string[];
} | null): number {
  if (!profile) return 0;

  const checks = [
    // Required fields (60% weight)
    { filled: !!profile.title?.trim(), weight: 15 },
    { filled: !!profile.city?.trim(), weight: 10 },
    { filled: !!profile.postalCode?.trim(), weight: 10 },
    { filled: profile.specializations.length > 0, weight: 15 },
    { filled: profile.therapyTypes.length > 0, weight: 10 },
    // Recommended fields (40% weight)
    { filled: !!profile.imageUrl, weight: 20 },
    { filled: !!profile.shortDescription?.trim(), weight: 10 },
    { filled: profile.languages.length > 0, weight: 10 },
  ];

  return checks.reduce((sum, check) => sum + (check.filled ? check.weight : 0), 0);
}

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  // Get user's profile for tier information, image, and completeness
  const profile = await db.therapistProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      accountType: true,
      imageUrl: true,
      title: true,
      shortDescription: true,
      city: true,
      postalCode: true,
      specializations: true,
      therapyTypes: true,
      languages: true,
    },
  });

  const accountType = profile?.accountType || "gratis";
  const userImageUrl = profile?.imageUrl || null;
  const isAdmin = session.user.role === "ADMIN";
  const profileCompleteness = calculateProfileCompleteness(profile);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      <DashboardSidebar
        accountType={accountType}
        userName={session.user.name}
        userImageUrl={userImageUrl}
        isAdmin={isAdmin}
        profileCompleteness={profileCompleteness}
      />
      <main className="flex-1 min-w-0 px-4 py-6 lg:px-8 lg:py-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
