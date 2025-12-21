import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserManagement } from "@/components/labelling/user-management";

export default async function AdminUsersPage() {
  const session = await auth();

  // Admin only
  if (session?.user?.role !== "ADMIN") {
    redirect("/de/labelling");
  }

  // Get all labellers and admins
  const users = await db.user.findMany({
    where: {
      role: { in: ["LABELLER", "ADMIN"] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          ratedLabels: true,
          createdCases: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Benutzerverwaltung</h1>
        <p className="text-muted-foreground">
          Verwalte Labeller und Admin-Konten
        </p>
      </div>

      <UserManagement users={users} currentUserId={session.user.id} />
    </div>
  );
}
