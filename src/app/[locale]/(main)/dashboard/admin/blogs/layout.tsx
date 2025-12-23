import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AdminBlogNav } from "@/components/blog/admin/admin-blog-nav";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminBlogsLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  // Must be authenticated
  if (!session?.user?.id) {
    redirect(`/${locale}/auth/login`);
  }

  // Must be ADMIN role
  if (session.user.role !== "ADMIN") {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Blog-Verwaltung</h1>
        <p className="text-muted-foreground">
          Verwalten Sie alle Blog-Artikel, prüfen Sie eingereichte Beiträge und planen Sie Veröffentlichungen.
        </p>
      </div>

      <AdminBlogNav />

      <div>{children}</div>
    </div>
  );
}
