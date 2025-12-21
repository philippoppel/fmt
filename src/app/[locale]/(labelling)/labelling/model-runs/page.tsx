import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getModelRuns } from "@/lib/actions/labelling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModelRunPanel } from "@/components/labelling/model-run-panel";

export default async function ModelRunsPage() {
  const session = await auth();

  // Admin only
  if (session?.user?.role !== "ADMIN") {
    redirect("/de/labelling");
  }

  const result = await getModelRuns();
  const runs = result.success ? result.data || [] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Modell-Läufe</h1>
        <p className="text-muted-foreground">
          Trainiere und evaluiere Klassifikationsmodelle
        </p>
      </div>

      <ModelRunPanel runs={runs} />

      {/* Run History */}
      <Card>
        <CardHeader>
          <CardTitle>Verlauf ({runs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              Noch keine Modell-Läufe gestartet
            </p>
          ) : (
            <div className="space-y-4">
              {runs.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium uppercase">{run.method}</span>
                      <Badge
                        variant={
                          run.status === "completed"
                            ? "default"
                            : run.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {run.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Gestartet: {new Date(run.startedAt).toLocaleString("de-DE")}
                      {run.completedAt && (
                        <> | Abgeschlossen: {new Date(run.completedAt).toLocaleString("de-DE")}</>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Von: {run.triggeredBy.name || run.triggeredBy.email}
                    </p>
                  </div>

                  <div className="text-right">
                    {run.status === "completed" && run.metrics && (
                      <div className="text-sm">
                        <p>
                          Top-3: <strong>{((run.metrics.top3_accuracy as number) * 100).toFixed(1)}%</strong>
                        </p>
                        <p>
                          F1: <strong>{((run.metrics.macro_f1 as number) * 100).toFixed(1)}%</strong>
                        </p>
                      </div>
                    )}
                    {run.status === "failed" && run.error && (
                      <p className="text-sm text-destructive">{run.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
