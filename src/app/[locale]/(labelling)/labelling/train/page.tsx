import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNextTrainingCase, getTrainingStats } from "@/lib/actions/labelling/training";
import { TrainingInterface } from "@/components/labelling/training-interface";

export default async function TrainingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/de/auth/login");
  }

  // Check role
  if (session.user.role !== "LABELLER" && session.user.role !== "ADMIN") {
    redirect("/de/dashboard");
  }

  const [caseResult, statsResult] = await Promise.all([
    getNextTrainingCase(),
    getTrainingStats(),
  ]);

  const trainingCase = caseResult.success && caseResult.data ? caseResult.data : null;
  const stats = statsResult.success && statsResult.data ? statsResult.data : null;

  return (
    <TrainingInterface
      initialCase={trainingCase}
      stats={stats}
      userId={session.user.id}
      userName={session.user.name || session.user.email || "Therapeut"}
    />
  );
}
