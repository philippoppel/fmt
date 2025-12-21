"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Loader2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { getExportPreview, exportLabels } from "@/lib/actions/labelling";
import type { ConflictCase, ExportReport } from "@/types/labelling";

export function ExportPanel() {
  const [isPending, startTransition] = useTransition();
  const [format, setFormat] = useState<"jsonl" | "csv">("jsonl");
  const [includeUncertain, setIncludeUncertain] = useState(true);

  const [preview, setPreview] = useState<{
    totalCases: number;
    exportableCases: number;
    conflictCases: number;
    conflicts: ConflictCase[];
  } | null>(null);

  const [exportResult, setExportResult] = useState<{
    url: string;
    report: ExportReport;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const loadPreview = async () => {
    setError(null);
    startTransition(async () => {
      const result = await getExportPreview({ format, includeUncertain });
      if (result.success && result.data) {
        setPreview(result.data);
      } else {
        setError(result.error || "Fehler beim Laden der Vorschau");
      }
    });
  };

  const handleExport = async () => {
    setError(null);
    setExportResult(null);
    startTransition(async () => {
      const result = await exportLabels({ format, includeUncertain });
      if (result.success && result.data) {
        setExportResult({
          url: result.data.url,
          report: result.data.report,
        });

        // Trigger download
        const link = document.createElement("a");
        link.href = result.data.url;
        link.download = `labelling-export-${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError(result.error || "Fehler beim Exportieren");
      }
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export-Optionen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Format</Label>
            <div className="flex gap-4">
              <div
                className={`flex-1 p-4 rounded-lg border cursor-pointer transition-colors ${
                  format === "jsonl"
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-muted-foreground/50"
                }`}
                onClick={() => setFormat("jsonl")}
              >
                <FileJson className="h-8 w-8 mb-2" />
                <p className="font-medium">JSONL</p>
                <p className="text-xs text-muted-foreground">
                  Für ML-Training optimiert
                </p>
              </div>
              <div
                className={`flex-1 p-4 rounded-lg border cursor-pointer transition-colors ${
                  format === "csv"
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-muted-foreground/50"
                }`}
                onClick={() => setFormat("csv")}
              >
                <FileSpreadsheet className="h-8 w-8 mb-2" />
                <p className="font-medium">CSV</p>
                <p className="text-xs text-muted-foreground">
                  Für Analyse/Review
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="includeUncertain"
                checked={includeUncertain}
                onCheckedChange={(checked) => setIncludeUncertain(!!checked)}
              />
              <Label htmlFor="includeUncertain" className="cursor-pointer">
                Unsichere Labels einschließen
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={loadPreview}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Vorschau laden
            </Button>
            <Button
              onClick={handleExport}
              disabled={isPending || !preview}
              className="flex-1"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exportieren
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview / Result */}
      <Card>
        <CardHeader>
          <CardTitle>
            {exportResult ? "Export-Ergebnis" : "Vorschau"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {preview && !exportResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{preview.totalCases}</p>
                  <p className="text-xs text-muted-foreground">Gesamt Fälle</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {preview.exportableCases}
                  </p>
                  <p className="text-xs text-muted-foreground">Exportierbar</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">
                    {preview.conflictCases}
                  </p>
                  <p className="text-xs text-muted-foreground">Konflikte</p>
                </div>
              </div>

              {preview.conflicts.length > 0 && (
                <div className="space-y-2">
                  <Label>Konflikte (werden nicht exportiert):</Label>
                  <div className="max-h-48 overflow-auto space-y-2">
                    {preview.conflicts.map((conflict) => (
                      <div
                        key={conflict.caseId}
                        className="text-sm p-2 bg-destructive/10 rounded flex items-center justify-between"
                      >
                        <span className="text-xs font-mono">
                          {conflict.caseId.slice(0, 8)}...
                        </span>
                        <div className="flex gap-1">
                          {conflict.disagreementCategories.map((cat) => (
                            <Badge key={cat} variant="outline" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {exportResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Export erfolgreich!</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted/50 rounded">
                  <p className="text-xl font-bold">
                    {exportResult.report.exportedCases}
                  </p>
                  <p className="text-xs text-muted-foreground">Exportiert</p>
                </div>
                <div className="p-3 bg-muted/50 rounded">
                  <p className="text-xl font-bold">
                    {exportResult.report.excludedCases}
                  </p>
                  <p className="text-xs text-muted-foreground">Ausgeschlossen</p>
                </div>
              </div>

              {Object.keys(exportResult.report.categoryDistribution).length >
                0 && (
                <div className="space-y-2">
                  <Label>Kategorie-Verteilung im Export:</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(exportResult.report.categoryDistribution)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cat, count]) => (
                        <Badge key={cat} variant="outline">
                          {cat}: {count}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = exportResult.url;
                  link.download = `labelling-export-${new Date().toISOString().split("T")[0]}.${format}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Erneut herunterladen
              </Button>
            </div>
          )}

          {!preview && !exportResult && (
            <div className="text-center py-10 text-muted-foreground">
              <p>Klicke auf &quot;Vorschau laden&quot; um zu sehen,</p>
              <p>wie viele Fälle exportiert werden.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
