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

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar
        accountType={accountType}
        userName={session.user.name}
      />
      <main className="flex-1 p-6 lg:p-8 lg:ml-0">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
