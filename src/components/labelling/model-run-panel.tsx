"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Play, Brain, Zap } from "lucide-react";
import { triggerModelRun } from "@/lib/actions/labelling";

interface ModelRun {
  id: string;
  method: string;
  parameters: Record<string, unknown> | null;
  metrics: Record<string, unknown> | null;
  status: string;
  error: string | null;
  startedAt: Date;
  completedAt: Date | null;
  triggeredBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ModelRunPanelProps {
  runs: ModelRun[];
}

export function ModelRunPanel({ runs }: ModelRunPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [method, setMethod] = useState<"knn" | "logreg">("knn");
  const [k, setK] = useState(5);
  const [threshold, setThreshold] = useState(0.5);
  const [testSplit, setTestSplit] = useState(0.2);

  const handleTrigger = () => {
    setError(null);
    startTransition(async () => {
      const result = await triggerModelRun({
        method,
        parameters: {
          k,
          threshold,
          testSplit,
          randomSeed: 42,
        },
      });

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || "Fehler beim Starten");
      }
    });
  };

  // Check if there's a pending run
  const hasPendingRun = runs.some(
    (run) => run.status === "pending" || run.status === "running"
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Trigger Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Neuer Modell-Lauf</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Method Selection */}
          <div className="space-y-2">
            <Label>Methode</Label>
            <div className="flex gap-4">
              <div
                className={`flex-1 p-4 rounded-lg border cursor-pointer transition-colors ${
                  method === "knn"
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-muted-foreground/50"
                }`}
                onClick={() => setMethod("knn")}
              >
                <Brain className="h-8 w-8 mb-2" />
                <p className="font-medium">k-NN</p>
                <p className="text-xs text-muted-foreground">
                  Nearest Neighbors Retrieval
                </p>
              </div>
              <div
                className={`flex-1 p-4 rounded-lg border cursor-pointer transition-colors ${
                  method === "logreg"
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-muted-foreground/50"
                }`}
                onClick={() => setMethod("logreg")}
              >
                <Zap className="h-8 w-8 mb-2" />
                <p className="font-medium">LogReg</p>
                <p className="text-xs text-muted-foreground">
                  Logistic Regression OvR
                </p>
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-2 gap-4">
            {method === "knn" && (
              <div className="space-y-2">
                <Label>k (Nachbarn)</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={k}
                  onChange={(e) => setK(parseInt(e.target.value) || 5)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Threshold</Label>
              <Input
                type="number"
                min={0}
                max={1}
                step={0.1}
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value) || 0.5)}
              />
            </div>
            <div className="space-y-2">
              <Label>Test-Split</Label>
              <Select
                value={testSplit.toString()}
                onValueChange={(v) => setTestSplit(parseFloat(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.1">10%</SelectItem>
                  <SelectItem value="0.2">20%</SelectItem>
                  <SelectItem value="0.3">30%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <Button
            className="w-full"
            onClick={handleTrigger}
            disabled={isPending || hasPendingRun}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {hasPendingRun ? "Lauf in Bearbeitung..." : "Training starten"}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <p className="text-xs text-muted-foreground text-center">
            Hinweis: Der Python-Modell-Runner muss manuell gestartet werden.
            Diese Funktion erstellt nur den Datensatz zum Tracken.
          </p>
        </CardContent>
      </Card>

      {/* Latest Results */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte Ergebnisse</CardTitle>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>Noch keine Modell-Läufe.</p>
              <p>Starte einen neuen Lauf, um Metriken zu sehen.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {runs
                .filter((run) => run.status === "completed" && run.metrics)
                .slice(0, 3)
                .map((run) => (
                  <div
                    key={run.id}
                    className="p-4 bg-muted/50 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium uppercase">{run.method}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(run.completedAt!).toLocaleDateString("de-DE")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Top-3 Accuracy:</span>
                        <span className="ml-2 font-medium">
                          {((run.metrics!.top3_accuracy as number) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Macro F1:</span>
                        <span className="ml-2 font-medium">
                          {((run.metrics!.macro_f1 as number) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Train:</span>
                        <span className="ml-2 font-medium">
                          {run.metrics!.train_samples as number}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Test:</span>
                        <span className="ml-2 font-medium">
                          {run.metrics!.test_samples as number}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

              {runs.filter((run) => run.status === "completed").length === 0 && (
                <p className="text-center py-6 text-muted-foreground">
                  Noch keine abgeschlossenen Läufe
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
