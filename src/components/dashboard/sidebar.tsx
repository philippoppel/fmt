"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  CreditCard,
  BarChart3,
  Globe,
  Crown,
  FileText,
  Settings,
} from "lucide-react";
import type { AccountType } from "@prisma/client";
import { UserAvatar } from "./profile/user-avatar";

interface SidebarProps {
  accountType: AccountType;
  userName?: string | null;
  userImageUrl?: string | null;
  isAdmin?: boolean;
  profileCompleteness?: number;
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    labelKey: "overview",
    shortLabel: "Home",
    requiresTier: null,
    adminOnly: false,
  },
  {
    href: "/dashboard/profile",
    icon: User,
    labelKey: "profile",
    shortLabel: "Profil",
    requiresTier: null,
    adminOnly: false,
  },
  {
    href: "/dashboard/customize",
    icon: Globe,
    labelKey: "website",
    shortLabel: "Webseite",
    requiresTier: "mittel" as AccountType,
    adminOnly: false,
  },
  {
    href: "/dashboard/blog",
    icon: FileText,
    labelKey: "blog",
    shortLabel: "Blog",
    requiresTier: null,
    adminOnly: false,
  },
  {
    href: "/dashboard/stats",
    icon: BarChart3,
    labelKey: "stats",
    shortLabel: "Stats",
    requiresTier: "premium" as AccountType,
    adminOnly: false,
  },
  {
    href: "/dashboard/billing",
    icon: CreditCard,
    labelKey: "billing",
    shortLabel: "Abo",
    requiresTier: null,
    adminOnly: false,
  },
  {
    href: "/dashboard/settings",
    icon: Settings,
    labelKey: "settings",
    shortLabel: "Settings",
    requiresTier: null,
    adminOnly: true,
  },
];

const TIER_ORDER: AccountType[] = ["gratis", "mittel", "premium"];

function canAccessTier(userTier: AccountType, requiredTier: AccountType | null): boolean {
  if (!requiredTier) return true;
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(requiredTier);
}

const TIER_BADGES: Record<AccountType, { label: string; className: string }> = {
  gratis: { label: "Gratis", className: "bg-muted text-muted-foreground" },
  mittel: { label: "Basis", className: "bg-blue-100 text-blue-700" },
  premium: { label: "Premium", className: "bg-amber-100 text-amber-700" },
};

export function DashboardSidebar({ accountType, userName, userImageUrl, isAdmin = false, profileCompleteness = 0 }: SidebarProps) {
  const t = useTranslations("dashboard.sidebar");
  const pathname = usePathname();
  const tierBadge = TIER_BADGES[accountType];

  // Determine progress bar color based on completeness
  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-green-500";
    if (percent >= 70) return "bg-blue-500";
    if (percent >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  // Filter nav items based on admin status
  const visibleNavItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname.endsWith("/dashboard") || pathname.endsWith("/dashboard/");
    }
    return pathname.includes(href);
  };

  return (
    <>
      {/* Mobile Navigation - Horizontal scrollable bar */}
      <div className="lg:hidden sticky top-[4rem] z-30 bg-background border-b">
        <div className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const hasAccess = canAccessTier(accountType, item.requiresTier);
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors min-h-[44px]",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  !hasAccess && "opacity-50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.shortLabel}</span>
                {item.requiresTier === "premium" && !hasAccess && (
                  <Crown className="h-3 w-3 text-amber-500 shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-background border-r flex-col sticky top-[4rem] h-[calc(100vh-4rem)]">
        {/* User Info */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <UserAvatar imageUrl={userImageUrl} name={userName} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{userName || t("therapist")}</p>
              <Badge className={cn("text-xs mt-1", tierBadge.className)}>
                {tierBadge.label}
              </Badge>
            </div>
          </div>
          {/* Profile Completeness */}
          {profileCompleteness < 100 && (
            <Link href="/dashboard/profile" className="block mt-3 group">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {t("profileCompleteness")}
                </span>
                <span className={cn(
                  "font-medium",
                  profileCompleteness >= 70 ? "text-blue-600" : "text-amber-600"
                )}>
                  {profileCompleteness}%
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    getProgressColor(profileCompleteness)
                  )}
                  style={{ width: `${profileCompleteness}%` }}
                />
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const hasAccess = canAccessTier(accountType, item.requiresTier);
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  !hasAccess && "opacity-50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{t(item.labelKey)}</span>
                {item.requiresTier === "premium" && !hasAccess && (
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade CTA for non-premium */}
        {accountType !== "premium" && (
          <div className="p-4 border-t">
            <Link href="/dashboard/billing">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300"
              >
                <Crown className="h-4 w-4 text-amber-500" />
                <span className="text-amber-700">{t("upgradeToPremium")}</span>
              </Button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
