import { auth } from "@/lib/auth";
import { getLabellingStats, getMyLabelStats } from "@/lib/actions/labelling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  Tag,
  Users,
  Scale,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default async function LabellingDashboard() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const [statsResult, myStatsResult] = await Promise.all([
    getLabellingStats(),
    getMyLabelStats(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const myStats = myStatsResult.success ? myStatsResult.data : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Labelling Portal</h1>
        <p className="text-muted-foreground mt-1">
          Willkommen, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/de/labelling/cases">
          <Button>
            <Tag className="mr-2 h-4 w-4" />
            Fälle labeln
          </Button>
        </Link>
        {isAdmin && (
          <Link href="/de/labelling/export">
            <Button variant="outline">
              Export starten
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
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
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">
                {stats?.casesByStatus?.NEW || 0} neu
              </Badge>
              <Badge variant="default">
                {stats?.casesByStatus?.LABELED || 0} gelabelt
              </Badge>
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
            <Scale className="h-4 w-4 text-muted-foreground" />
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
              Meine Labels
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myStats?.totalLabels || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {myStats?.casesLabeled || 0} Fälle gelabelt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      {stats?.labelsByCategory && Object.keys(stats.labelsByCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kategorie-Verteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.labelsByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => (
                  <Badge key={category} variant="outline" className="text-sm">
                    {category}: {count}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Labeller Leaderboard (Admin Only) */}
      {isAdmin && stats?.labelsByRater && stats.labelsByRater.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Labeller Übersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.labelsByRater.slice(0, 10).map((rater, index) => (
                <div
                  key={rater.raterId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <span className="font-medium">{rater.raterName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{rater.totalLabels} Labels</span>
                    <span className="text-muted-foreground">
                      {rater.casesLabeled} Fälle
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {stats?.totalCases === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">Noch keine Fälle vorhanden</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">
              Erstellen Sie einen neuen Fall oder importieren Sie Fälle.
            </p>
            <Link href="/de/labelling/cases">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Fälle erstellen
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
