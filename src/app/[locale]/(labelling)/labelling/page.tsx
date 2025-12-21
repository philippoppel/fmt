import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Play, TrendingUp, Users, Target, Award } from "lucide-react";

// German labels for topics
const TOPIC_LABELS: Record<string, string> = {
  family: "Familie",
  anxiety: "Angst",
  depression: "Depression",
  relationships: "Beziehungen",
  burnout: "Burnout",
  trauma: "Trauma",
  addiction: "Sucht",
  eating_disorders: "Essstörungen",
  adhd: "ADHS",
  self_care: "Selbstfürsorge",
  stress: "Stress",
  sleep: "Schlaf",
};

export default async function LabellingDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/de/auth/login");
  }

  if (session.user.role !== "LABELLER" && session.user.role !== "ADMIN") {
    redirect("/de/dashboard");
  }

  // Get statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalCases,
    labeledCases,
    myLabelsToday,
    myLabelsTotal,
    allLabels,
    labellers,
  ] = await Promise.all([
    db.labellingCase.count(),
    db.labellingCase.count({ where: { status: "LABELED" } }),
    db.label.count({
      where: {
        raterId: session.user.id,
        createdAt: { gte: today },
      },
    }),
    db.label.count({ where: { raterId: session.user.id } }),
    db.label.findMany({
      select: { primaryCategories: true },
    }),
    db.user.findMany({
      where: { role: { in: ["LABELLER", "ADMIN"] } },
      select: {
        id: true,
        name: true,
        _count: { select: { ratedLabels: true } },
      },
      orderBy: { ratedLabels: { _count: "desc" } },
      take: 5,
    }),
  ]);

  // Count categories across all labels
  const categoryCounts: Record<string, number> = {};
  for (const label of allLabels) {
    const categories = label.primaryCategories as Array<{ key: string }>;
    if (Array.isArray(categories)) {
      for (const cat of categories) {
        categoryCounts[cat.key] = (categoryCounts[cat.key] || 0) + 1;
      }
    }
  }

  const sortedCategories = Object.entries(categoryCounts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);

  const maxCategoryCount = sortedCategories[0]?.count || 1;
  const progress = totalCases > 0 ? Math.round((labeledCases / totalCases) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Training Dashboard</h1>
          <p className="text-muted-foreground">
            Trainingsdaten für das Matching-Modell
          </p>
        </div>
        <Link href="/de/labelling/train">
          <Button size="lg" className="gap-2">
            <Play className="h-5 w-5" />
            Training starten
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{labeledCases}</p>
                <p className="text-sm text-muted-foreground">Gelabelte Fälle</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myLabelsToday}</p>
                <p className="text-sm text-muted-foreground">Heute von dir</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/10 p-3">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myLabelsTotal}</p>
                <p className="text-sm text-muted-foreground">Dein Beitrag</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-500/10 p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{labellers.length}</p>
                <p className="text-sm text-muted-foreground">Therapeuten</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fortschritt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>{labeledCases} von {totalCases} Fällen gelabelt</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {totalCases - labeledCases} Fälle noch offen · Neue Fälle werden automatisch generiert
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kategorie-Verteilung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Noch keine Labels vorhanden
              </p>
            ) : (
              sortedCategories.slice(0, 8).map(({ key, count }) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{TOPIC_LABELS[key] || key}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                  <Progress
                    value={(count / maxCategoryCount) * 100}
                    className="h-2"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Beitragende</CardTitle>
          </CardHeader>
          <CardContent>
            {labellers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Noch keine Therapeuten aktiv
              </p>
            ) : (
              <div className="space-y-3">
                {labellers.map((labeller, index) => (
                  <div
                    key={labeller.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        index === 0 ? "bg-yellow-100 text-yellow-700" :
                        index === 1 ? "bg-gray-100 text-gray-700" :
                        index === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">
                        {labeller.name || "Anonym"}
                        {labeller.id === session.user.id && (
                          <span className="ml-1 text-muted-foreground">(du)</span>
                        )}
                      </span>
                    </div>
                    <Badge variant="outline">{labeller._count.ratedLabels} Labels</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Start Training CTA */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="flex items-center justify-between py-6">
          <div>
            <h3 className="font-semibold">Bereit für mehr?</h3>
            <p className="text-sm text-muted-foreground">
              Jedes Label verbessert die Empfehlungsqualität für Hilfesuchende
            </p>
          </div>
          <Link href="/de/labelling/train">
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Weiter trainieren
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
