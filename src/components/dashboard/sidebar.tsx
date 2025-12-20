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
  Settings,
  BarChart3,
  Palette,
  Crown,
  Menu,
  X,
} from "lucide-react";
import type { AccountType } from "@prisma/client";
import { useState } from "react";

interface SidebarProps {
  accountType: AccountType;
  userName?: string | null;
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    labelKey: "overview",
    requiresTier: null,
  },
  {
    href: "/dashboard/profile",
    icon: User,
    labelKey: "profile",
    requiresTier: null,
  },
  {
    href: "/dashboard/customize",
    icon: Palette,
    labelKey: "customize",
    requiresTier: "mittel" as AccountType,
  },
  {
    href: "/dashboard/stats",
    icon: BarChart3,
    labelKey: "stats",
    requiresTier: "premium" as AccountType,
  },
  {
    href: "/dashboard/billing",
    icon: CreditCard,
    labelKey: "billing",
    requiresTier: null,
  },
  {
    href: "/dashboard/settings",
    icon: Settings,
    labelKey: "settings",
    requiresTier: null,
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

export function DashboardSidebar({ accountType, userName }: SidebarProps) {
  const t = useTranslations("dashboard.sidebar");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const tierBadge = TIER_BADGES[accountType];

  const isActive = (href: string) => {
    // Handle exact match for /dashboard
    if (href === "/dashboard") {
      return pathname.endsWith("/dashboard") || pathname.endsWith("/dashboard/");
    }
    return pathname.includes(href);
  };

  const sidebarContent = (
    <>
      {/* User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{userName || t("therapist")}</p>
            <Badge className={cn("text-xs mt-1", tierBadge.className)}>
              {tierBadge.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const hasAccess = canAccessTier(accountType, item.requiresTier);
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
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
              onClick={() => setMobileOpen(false)}
            >
              <Crown className="h-4 w-4 text-amber-500" />
              <span className="text-amber-700">{t("upgradeToPremium")}</span>
            </Button>
          </Link>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-20 left-4 z-40 lg:hidden p-2 rounded-lg bg-background border shadow-sm"
        aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ top: "4rem" }} // Account for header height
      >
        {sidebarContent}
      </aside>
    </>
  );
}
