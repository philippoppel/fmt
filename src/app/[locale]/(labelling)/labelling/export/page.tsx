import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExportPanel } from "@/components/labelling/export-panel";

export default async function ExportPage() {
  const session = await auth();

  // Admin only
  if (session?.user?.role !== "ADMIN") {
    redirect("/de/labelling");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Export</h1>
        <p className="text-muted-foreground">
          Exportiere gelabelte Daten für ML-Training
        </p>
      </div>

      <ExportPanel />
    </div>
  );
}
