import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SimpleLabelling } from "@/components/labelling/simple-labelling";

export const metadata = {
  title: "Labelling | Labelling Portal",
  description: "Erstelle Trainingsdaten für den Matching-Classifier",
};

export default async function SimpleLabelPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/de/auth/login");
  }

  if (session.user.role !== "LABELLER" && session.user.role !== "ADMIN") {
    redirect("/de/dashboard");
  }

  // Get total count for the current user
  const totalLabeled = await db.label.count({
    where: { raterId: session.user.id },
  });

  return <SimpleLabelling initialCount={totalLabeled} />;
}
