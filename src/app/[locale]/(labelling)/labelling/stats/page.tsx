import { getLabellingStats, getCategoryCoverage } from "@/lib/actions/labelling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Tag,
  Users,
  AlertCircle,
  BarChart3,
} from "lucide-react";

export default async function StatsPage() {
  const [statsResult, coverageResult] = await Promise.all([
    getLabellingStats(),
    getCategoryCoverage(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const coverage = coverageResult.success ? coverageResult.data : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistik</h1>
        <p className="text-muted-foreground">
          Übersicht über den Labelling-Fortschritt
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Gesamt Fälle
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCases || 0}</div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-blue-600">
                {stats?.casesByStatus?.NEW || 0} neu
              </span>
              <span className="text-green-600">
                {stats?.casesByStatus?.LABELED || 0} gelabelt
              </span>
              <span className="text-yellow-600">
                {stats?.casesByStatus?.REVIEW || 0} review
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Gesamt Labels
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLabels || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.labelsByRater?.length || 0} aktive Labeller
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Kalibrierungs-Pool
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.calibrationPoolSize || 0}
            </div>
            {stats?.averageAgreement !== null && (
              <p className="text-xs text-muted-foreground mt-2">
                ∅ Agreement: {((stats?.averageAgreement || 0) * 100).toFixed(1)}%
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Unterrepräsentiert
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {coverage?.underrepresented?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Kategorien &lt;{coverage?.threshold || 5}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Kategorie-Verteilung
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.labelsByCategory &&
          Object.keys(stats.labelsByCategory).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats.labelsByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => {
                  const totalLabels = stats.totalLabels || 1;
                  const percentage = (count / totalLabels) * 100;
                  const isUnderrepresented = coverage?.underrepresented?.includes(
                    category
                  );

                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          {category}
                          {isUnderrepresented && (
                            <Badge variant="outline" className="text-yellow-600">
                              unterrepräsentiert
                            </Badge>
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress
                        value={percentage}
                        className={isUnderrepresented ? "bg-yellow-100" : ""}
                      />
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">
              Noch keine Labels vorhanden
            </p>
          )}
        </CardContent>
      </Card>

      {/* Category Coverage */}
      {coverage && coverage.coverage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kategorie-Abdeckung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {coverage.coverage.map((item) => (
                <div
                  key={item.category}
                  className={`p-3 rounded-lg border ${
                    item.percentage < coverage.threshold
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-muted"
                  }`}
                >
                  <p className="font-medium text-sm">{item.category}</p>
                  <p className="text-2xl font-bold">{item.count}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.percentage.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Labeller Leaderboard */}
      {stats?.labelsByRater && stats.labelsByRater.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Labeller-Aktivität</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.labelsByRater.map((rater, index) => (
                <div
                  key={rater.raterId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{rater.raterName}</p>
                      {rater.lastLabeledAt && (
                        <p className="text-xs text-muted-foreground">
                          Letztes Label:{" "}
                          {new Date(rater.lastLabeledAt).toLocaleDateString(
                            "de-DE"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{rater.totalLabels}</p>
                    <p className="text-xs text-muted-foreground">
                      {rater.casesLabeled} Fälle
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sources Distribution */}
      {stats?.casesBySource && (
        <Card>
          <CardHeader>
            <CardTitle>Quellen-Verteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">
                  {stats.casesBySource.MANUAL || 0}
                </p>
                <p className="text-sm text-muted-foreground">Manuell</p>
              </div>
              <div className="flex-1 p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">
                  {stats.casesBySource.IMPORT || 0}
                </p>
                <p className="text-sm text-muted-foreground">Import</p>
              </div>
              <div className="flex-1 p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">
                  {stats.casesBySource.AI_SEEDED || 0}
                </p>
                <p className="text-sm text-muted-foreground">AI-Seeded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
