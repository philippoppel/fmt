import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { QuickLabelInterface } from "@/components/labelling/quick-label";

export const metadata = {
  title: "Neuen Fall labeln | Labelling Portal",
  description: "Erstelle Trainingsdaten für den Matching-Classifier",
};

export default async function QuickLabelPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/de/auth/login");
  }

  if (session.user.role !== "LABELLER" && session.user.role !== "ADMIN") {
    redirect("/de/dashboard");
  }

  // Get stats for the current user
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalLabeled, todayLabeled] = await Promise.all([
    db.label.count({
      where: { raterId: session.user.id },
    }),
    db.label.count({
      where: {
        raterId: session.user.id,
        createdAt: { gte: today },
      },
    }),
  ]);

  return (
    <div className="container max-w-4xl py-6">
      <QuickLabelInterface
        userId={session.user.id}
        userName={session.user.name || "Therapeut"}
        stats={{
          todayLabeled,
          totalLabeled,
        }}
      />
    </div>
  );
}
