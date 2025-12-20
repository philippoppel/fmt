"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TierBadge } from "@/components/dashboard/tier-badge";
import { cn } from "@/lib/utils";
import {
  Crown,
  Lock,
  Eye,
  MousePointerClick,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart3,
} from "lucide-react";
import type { AccountType } from "@/types/therapist";

interface StatData {
  date: string;
  views: number;
  impressions: number;
  contactClicks: number;
  profileClicks: number;
}

interface StatsContentProps {
  hasAccess: boolean;
  accountType: AccountType;
  stats: StatData[];
  totalContacts: number;
  memberSince: string;
}

function calculateTrend(stats: StatData[], key: keyof StatData): number {
  if (stats.length < 14) return 0;

  const last7 = stats.slice(-7);
  const prev7 = stats.slice(-14, -7);

  const last7Sum = last7.reduce((sum, s) => sum + (s[key] as number), 0);
  const prev7Sum = prev7.reduce((sum, s) => sum + (s[key] as number), 0);

  if (prev7Sum === 0) return 0;
  return Math.round(((last7Sum - prev7Sum) / prev7Sum) * 100);
}

function TrendIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="flex items-center text-green-600 text-sm">
        <TrendingUp className="h-4 w-4 mr-1" />
        +{value}%
      </span>
    );
  } else if (value < 0) {
    return (
      <span className="flex items-center text-red-600 text-sm">
        <TrendingDown className="h-4 w-4 mr-1" />
        {value}%
      </span>
    );
  }
  return (
    <span className="flex items-center text-muted-foreground text-sm">
      <Minus className="h-4 w-4 mr-1" />
      0%
    </span>
  );
}

function SimpleChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const normalizedData = data.map((v) => (v / max) * 100);

  return (
    <div className="flex items-end gap-1 h-16 w-full">
      {normalizedData.map((value, i) => (
        <div
          key={i}
          className="flex-1 rounded-t transition-all hover:opacity-80"
          style={{
            height: `${Math.max(value, 4)}%`,
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
}

export function StatsContent({
  hasAccess,
  accountType,
  stats,
  totalContacts,
  memberSince,
}: StatsContentProps) {
  const t = useTranslations("dashboard.stats");

  const aggregated = useMemo(() => {
    const totalViews = stats.reduce((sum, s) => sum + s.views, 0);
    const totalImpressions = stats.reduce((sum, s) => sum + s.impressions, 0);
    const totalContactClicks = stats.reduce((sum, s) => sum + s.contactClicks, 0);
    const totalProfileClicks = stats.reduce((sum, s) => sum + s.profileClicks, 0);

    const viewsTrend = calculateTrend(stats, "views");
    const impressionsTrend = calculateTrend(stats, "impressions");
    const contactClicksTrend = calculateTrend(stats, "contactClicks");

    // Chart data - last 14 days
    const last14Days = stats.slice(-14);
    const viewsChartData = last14Days.map((s) => s.views);
    const impressionsChartData = last14Days.map((s) => s.impressions);
    const clicksChartData = last14Days.map((s) => s.contactClicks + s.profileClicks);

    return {
      totalViews,
      totalImpressions,
      totalContactClicks,
      totalProfileClicks,
      viewsTrend,
      impressionsTrend,
      contactClicksTrend,
      viewsChartData,
      impressionsChartData,
      clicksChartData,
    };
  }, [stats]);

  // Format member since date
  const memberSinceFormatted = new Date(memberSince).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Show upgrade prompt for users without access
  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <TierBadge tier={accountType} />
          </div>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4 py-8">
              <div className="p-4 rounded-full bg-amber-100">
                <Lock className="h-8 w-8 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t("locked.title")}</h3>
                <p className="text-muted-foreground max-w-md">
                  {t("locked.description")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-4 opacity-50">
                <div className="p-4 rounded-lg bg-white/50 border">
                  <Eye className="h-6 w-6 mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold text-muted-foreground">---</p>
                  <p className="text-xs text-muted-foreground">{t("metrics.views")}</p>
                </div>
                <div className="p-4 rounded-lg bg-white/50 border">
                  <MousePointerClick className="h-6 w-6 mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold text-muted-foreground">---</p>
                  <p className="text-xs text-muted-foreground">{t("metrics.clicks")}</p>
                </div>
              </div>
              <Link href="/dashboard/billing">
                <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  <Crown className="h-4 w-4" />
                  {t("locked.upgrade")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <TierBadge tier={accountType} />
        </div>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Profile Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("metrics.views")}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregated.totalViews.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">{t("period.last30Days")}</span>
              <TrendIndicator value={aggregated.viewsTrend} />
            </div>
          </CardContent>
        </Card>

        {/* Search Impressions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("metrics.impressions")}</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregated.totalImpressions.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">{t("period.last30Days")}</span>
              <TrendIndicator value={aggregated.impressionsTrend} />
            </div>
          </CardContent>
        </Card>

        {/* Contact Clicks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("metrics.clicks")}</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregated.totalContactClicks.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">{t("period.last30Days")}</span>
              <TrendIndicator value={aggregated.contactClicksTrend} />
            </div>
          </CardContent>
        </Card>

        {/* Total Contacts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("metrics.totalContacts")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t("period.sinceJoining", { date: memberSinceFormatted })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Views Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("charts.views.title")}
            </CardTitle>
            <CardDescription>{t("charts.views.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {aggregated.viewsChartData.length > 0 ? (
              <SimpleChart data={aggregated.viewsChartData} color="#3b82f6" />
            ) : (
              <div className="flex items-center justify-center h-16 text-muted-foreground text-sm">
                {t("charts.noData")}
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center mt-2">
              {t("charts.last14Days")}
            </p>
          </CardContent>
        </Card>

        {/* Clicks Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("charts.clicks.title")}
            </CardTitle>
            <CardDescription>{t("charts.clicks.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {aggregated.clicksChartData.length > 0 ? (
              <SimpleChart data={aggregated.clicksChartData} color="#22c55e" />
            ) : (
              <div className="flex items-center justify-center h-16 text-muted-foreground text-sm">
                {t("charts.noData")}
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center mt-2">
              {t("charts.last14Days")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Insights */}
      <Card>
        <CardHeader>
          <CardTitle>{t("insights.title")}</CardTitle>
          <CardDescription>{t("insights.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Click-through Rate */}
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-muted-foreground">
                {t("insights.ctr")}
              </p>
              <p className="text-2xl font-bold mt-1">
                {aggregated.totalViews > 0
                  ? ((aggregated.totalContactClicks / aggregated.totalViews) * 100).toFixed(1)
                  : "0.0"}
                %
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t("insights.ctrDesc")}</p>
            </div>

            {/* Search to View Rate */}
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-muted-foreground">
                {t("insights.searchToView")}
              </p>
              <p className="text-2xl font-bold mt-1">
                {aggregated.totalImpressions > 0
                  ? ((aggregated.totalViews / aggregated.totalImpressions) * 100).toFixed(1)
                  : "0.0"}
                %
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t("insights.searchToViewDesc")}</p>
            </div>

            {/* Avg Daily Views */}
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-muted-foreground">
                {t("insights.avgDaily")}
              </p>
              <p className="text-2xl font-bold mt-1">
                {stats.length > 0
                  ? Math.round(aggregated.totalViews / stats.length)
                  : 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t("insights.avgDailyDesc")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
