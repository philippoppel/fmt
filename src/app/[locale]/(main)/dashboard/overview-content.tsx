"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TierBadge } from "@/components/dashboard/tier-badge";
import { cn } from "@/lib/utils";
import {
  User,
  Eye,
  MousePointerClick,
  TrendingUp,
  Crown,
  Pencil,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import type { TherapistProfile, ProfileStats, AccountType } from "@prisma/client";

interface ProfileWithStats extends TherapistProfile {
  profileStats: ProfileStats[];
}

interface OverviewContentProps {
  profile: ProfileWithStats | null;
  userName?: string | null;
}

// Calculate profile completion percentage
function calculateProfileCompletion(
  profile: ProfileWithStats | null,
  userName?: string | null
): {
  percentage: number;
  missingFields: string[];
} {
  if (!profile) return { percentage: 0, missingFields: ["profile"] };

  const fields = [
    { key: "name", filled: !!userName },
    { key: "title", filled: !!profile.title },
    { key: "shortDescription", filled: !!profile.shortDescription },
    { key: "imageUrl", filled: !!profile.imageUrl },
    { key: "city", filled: !!profile.city },
    { key: "specializations", filled: profile.specializations.length > 0 },
    { key: "therapyTypes", filled: profile.therapyTypes.length > 0 },
    { key: "languages", filled: profile.languages.length > 0 },
    { key: "pricePerSession", filled: profile.pricePerSession !== null },
  ];

  const filledCount = fields.filter((f) => f.filled).length;
  const percentage = Math.round((filledCount / fields.length) * 100);
  const missingFields = fields.filter((f) => !f.filled).map((f) => f.key);

  return { percentage, missingFields };
}

// Aggregate stats from the last 30 days
function aggregateStats(stats: ProfileStats[]): {
  totalViews: number;
  totalClicks: number;
  trend: number;
} {
  if (!stats || stats.length === 0) {
    return { totalViews: 0, totalClicks: 0, trend: 0 };
  }

  const totalViews = stats.reduce((sum, s) => sum + s.views, 0);
  const totalClicks = stats.reduce((sum, s) => sum + s.contactClicks + s.profileClicks, 0);

  // Calculate trend (compare last 7 days vs previous 7 days)
  const last7 = stats.slice(0, 7);
  const prev7 = stats.slice(7, 14);

  const last7Views = last7.reduce((sum, s) => sum + s.views, 0);
  const prev7Views = prev7.reduce((sum, s) => sum + s.views, 0);

  const trend = prev7Views > 0 ? Math.round(((last7Views - prev7Views) / prev7Views) * 100) : 0;

  return { totalViews, totalClicks, trend };
}

const TIER_ORDER: AccountType[] = ["gratis", "mittel", "premium"];

export function OverviewContent({ profile, userName }: OverviewContentProps) {
  const t = useTranslations("dashboard.overview");
  const tTiers = useTranslations("pricing.tiers");

  const accountType = profile?.accountType || "gratis";
  const isPremium = accountType === "premium";
  const canEdit = accountType !== "gratis";

  const { percentage, missingFields } = calculateProfileCompletion(profile, userName);
  const stats = aggregateStats(profile?.profileStats || []);

  const tierIndex = TIER_ORDER.indexOf(accountType);
  const tierLabel = tTiers(accountType);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("welcome", { name: userName || t("therapist") })}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Stats Grid - Premium only shows real stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Profile Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("profileStatus")}</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {percentage === 100 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <span className="text-2xl font-bold">{percentage}%</span>
            </div>
            <Progress value={percentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {percentage === 100 ? t("profileComplete") : t("profileIncomplete")}
            </p>
          </CardContent>
        </Card>

        {/* Views Card */}
        <Card className={cn(!isPremium && "opacity-60")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("profileViews")}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isPremium ? (
              <>
                <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{t("last30Days")}</p>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">{t("premiumOnly")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clicks Card */}
        <Card className={cn(!isPremium && "opacity-60")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("contactClicks")}</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isPremium ? (
              <>
                <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{t("last30Days")}</p>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">{t("premiumOnly")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trend Card */}
        <Card className={cn(!isPremium && "opacity-60")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("trend")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isPremium ? (
              <>
                <div
                  className={cn(
                    "text-2xl font-bold",
                    stats.trend > 0 && "text-green-600",
                    stats.trend < 0 && "text-red-600"
                  )}
                >
                  {stats.trend > 0 && "+"}
                  {stats.trend}%
                </div>
                <p className="text-xs text-muted-foreground">{t("vsLastWeek")}</p>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">{t("premiumOnly")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t("yourProfile")}
              {profile?.isPublished && (
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  {t("published")}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{t("profilePreviewDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile ? (
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {profile.imageUrl ? (
                    <img
                      src={profile.imageUrl}
                      alt={userName || ""}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{userName || t("noName")}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {profile.title || t("noTitle")}
                  </p>
                  <p className="text-sm text-muted-foreground">{profile.city || t("noLocation")}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">{t("noProfile")}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {canEdit && (
                <Link href="/dashboard/profile">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    {t("editProfile")}
                  </Button>
                </Link>
              )}
              {profile?.slug && (
                <Link href={`/p/${profile.slug}`} target="_blank">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {t("viewMicrosite")}
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Status / Upgrade CTA */}
        <Card
          className={cn(
            accountType === "premium"
              ? "border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50"
              : accountType === "mittel"
              ? "border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"
              : ""
          )}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("accountStatus")}</CardTitle>
              <TierBadge tier={accountType} />
            </div>
            <CardDescription>{t("accountStatusDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Tier Benefits */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("currentBenefits")}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {t("benefit.searchVisible")}
                </li>
                {canEdit && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {t("benefit.editProfile")}
                  </li>
                )}
                {isPremium && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {t("benefit.stats")}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {t("benefit.customization")}
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Upgrade CTA for non-premium */}
            {accountType !== "premium" && (
              <Link href="/dashboard/billing">
                <Button className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  <Crown className="h-4 w-4" />
                  {t("upgradeToPremium")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Manage subscription for paying customers */}
            {accountType !== "gratis" && (
              <Link href="/dashboard/billing">
                <Button variant="outline" className="w-full">
                  {t("manageSubscription")}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("quickActions")}</CardTitle>
          <CardDescription>{t("quickActionsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/profile" className="group">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-md bg-primary/10">
                  <Pencil className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {t("action.editProfile")}
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/billing" className="group">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-md bg-primary/10">
                  <Crown className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {t("action.managePlan")}
                  </p>
                </div>
              </div>
            </Link>

            {isPremium && (
              <Link href="/dashboard/stats" className="group">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-md bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {t("action.viewStats")}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {profile?.slug && (
              <Link href={`/p/${profile.slug}`} target="_blank" className="group">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-md bg-primary/10">
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {t("action.viewMicrosite")}
                    </p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
