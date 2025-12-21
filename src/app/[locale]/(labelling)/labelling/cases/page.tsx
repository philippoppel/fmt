import { auth } from "@/lib/auth";
import { getCases } from "@/lib/actions/labelling";
import { CaseInbox } from "@/components/labelling/case-inbox";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const params = await searchParams;

  // Parse filters from search params
  const status = params.status as string | undefined;
  const source = params.source as string | undefined;
  const search = params.search as string | undefined;
  const calibrationOnly = params.calibration === "true";
  const page = parseInt(params.page as string) || 1;
  const limit = 20;

  const result = await getCases({
    status: status as "NEW" | "LABELED" | "REVIEW" | undefined,
    source: source as "MANUAL" | "IMPORT" | "AI_SEEDED" | undefined,
    search,
    calibrationOnly,
    limit,
    offset: (page - 1) * limit,
  });

  const cases = result.success ? result.data?.cases || [] : [];
  const total = result.success ? result.data?.total || 0 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fälle</h1>
        <p className="text-muted-foreground">
          {total} Fälle gefunden
        </p>
      </div>

      <CaseInbox
        cases={cases}
        total={total}
        page={page}
        limit={limit}
        currentFilters={{
          status,
          source,
          search,
          calibrationOnly,
        }}
        isAdmin={session?.user?.role === "ADMIN"}
      />
    </div>
  );
}
