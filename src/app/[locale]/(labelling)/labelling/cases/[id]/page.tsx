import { auth } from "@/lib/auth";
import { getCase, getMyLabelForCase, getNextUnlabeledCase } from "@/lib/actions/labelling";
import { CaseEditor } from "@/components/labelling/case-editor";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function CaseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const [caseResult, myLabelResult] = await Promise.all([
    getCase(id),
    getMyLabelForCase(id),
  ]);

  if (!caseResult.success || !caseResult.data) {
    notFound();
  }

  const labelCase = caseResult.data;
  const existingLabel = myLabelResult.success && myLabelResult.data ? myLabelResult.data : null;

  // Get next case for "Save & Next" functionality
  const nextCaseResult = await getNextUnlabeledCase();
  const nextCaseId = nextCaseResult.success && nextCaseResult.data ? nextCaseResult.data.id : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/de/labelling/cases">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Fall labeln</h1>
          <p className="text-sm text-muted-foreground">
            ID: {labelCase.id.slice(0, 8)}... |
            Status: {labelCase.status} |
            {labelCase.labels.length} Label(s)
          </p>
        </div>
      </div>

      <CaseEditor
        labelCase={labelCase}
        existingLabel={existingLabel}
        nextCaseId={nextCaseId}
        userId={session?.user?.id || ""}
      />
    </div>
  );
}
