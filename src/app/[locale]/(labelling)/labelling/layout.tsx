import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LabellingSidebar } from "@/components/labelling/labelling-sidebar";

export default async function LabellingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user?.id) {
    redirect("/de/auth/login");
  }

  // Redirect if not a labeller or admin
  if (session.user.role !== "LABELLER" && session.user.role !== "ADMIN") {
    redirect("/de/dashboard");
  }

  return (
    <div className="min-h-dvh bg-background overflow-x-hidden flex flex-col lg:flex-row">
      <LabellingSidebar
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }}
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 pt-[88px] lg:pt-0 w-full">
        {children}
      </main>
    </div>
  );
}
