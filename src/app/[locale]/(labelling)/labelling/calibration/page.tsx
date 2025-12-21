import { getCalibrationCases, getCalibrationStats } from "@/lib/actions/labelling";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  Scale,
  Users,
  AlertTriangle,
  CheckCircle,
  Tag,
} from "lucide-react";

export default async function CalibrationPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const [casesResult, statsResult] = await Promise.all([
    getCalibrationCases(),
    getCalibrationStats(),
  ]);

  const cases = casesResult.success ? casesResult.data : [];
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kalibrierung</h1>
        <p className="text-muted-foreground">
          Inter-Rater Agreement für ausgewählte Fälle
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pool-Größe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalCalibrationCases || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Mit mehreren Labels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.casesWithMultipleLabels || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              ∅ Agreement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageAgreement
                ? `${(stats.averageAgreement * 100).toFixed(1)}%`
                : "–"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Konflikte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats?.conflictCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calibration Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Kalibrierungsfälle</CardTitle>
        </CardHeader>
        <CardContent>
          {cases && cases.length > 0 ? (
            <div className="space-y-4">
              {cases.map((c) => (
                <div
                  key={c.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm line-clamp-2">{c.text}</p>
                    </div>
                    <Link href={`/de/labelling/cases/${c.id}`}>
                      <Button size="sm">
                        <Tag className="h-4 w-4 mr-1" />
                        Labeln
                      </Button>
                    </Link>
                  </div>

                  {/* Agreement Metrics */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {c.labels.length} Label(s)
                      </span>
                    </div>

                    {c.agreementMetrics && c.labels.length >= 2 && (
                      <>
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Jaccard:{" "}
                            {(c.agreementMetrics.jaccardSimilarity * 100).toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>

                        {c.agreementMetrics.hasConflict ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Konflikt
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Einigung
                          </Badge>
                        )}
                      </>
                    )}
                  </div>

                  {/* Labels Comparison */}
                  {c.labels.length > 0 && (
                    <div className="bg-muted/50 rounded p-3 space-y-2">
                      {c.labels.map((label) => (
                        <div
                          key={label.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="text-muted-foreground w-24 truncate">
                            {label.rater.name || label.rater.email}:
                          </span>
                          <div className="flex gap-1 flex-wrap">
                            {label.primaryCategories.map((cat) => (
                              <Badge key={cat.key} variant="outline">
                                #{cat.rank} {cat.key}
                              </Badge>
                            ))}
                            {label.uncertain && (
                              <Badge variant="secondary">Unsicher</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Scale className="h-10 w-10 mx-auto mb-4 opacity-50" />
              <p>Keine Kalibrierungsfälle vorhanden</p>
              {isAdmin && (
                <p className="text-sm mt-2">
                  Fügen Sie Fälle aus der Fallübersicht zum Kalibrierungs-Pool
                  hinzu.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
