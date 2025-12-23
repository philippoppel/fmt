import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  // Get user's profile for tier information
  const profile = await db.therapistProfile.findUnique({
    where: { userId: session.user.id },
    select: { accountType: true },
  });

  const accountType = profile?.accountType || "gratis";
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      <DashboardSidebar
        accountType={accountType}
        userName={session.user.name}
        isAdmin={isAdmin}
      />
      <main className="flex-1 min-w-0 px-4 py-6 lg:px-8 lg:py-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
