"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tag,
  BarChart3,
  Play,
  Inbox,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/de/labelling", label: "Dashboard", shortLabel: "Home", icon: BarChart3 },
  { href: "/de/labelling/cases/new", label: "Neuer Fall", shortLabel: "Neu", icon: Play },
  { href: "/de/labelling/cases", label: "Inbox", shortLabel: "Inbox", icon: Inbox },
];

interface LabellingSidebarProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export function LabellingSidebar({ user }: LabellingSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/de/labelling") {
      return pathname === href || pathname === "/de/labelling/";
    }
    if (href === "/de/labelling/cases") {
      return pathname.startsWith("/de/labelling/cases") && !pathname.includes("/new");
    }
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Navigation - Horizontal bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-background border-b">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Training</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-muted-foreground hover:text-foreground"
            onClick={() => signOut({ callbackUrl: "/de/auth/login" })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex overflow-x-auto scrollbar-hide px-2 pb-2 gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors min-h-[40px]",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-52 bg-card border-r flex-col h-dvh sticky top-0">
        {/* Header */}
        <div className="flex-shrink-0 border-b px-4 py-3">
          <Link href="/de/labelling" className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Training Portal</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors min-h-[44px]",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="flex-shrink-0 border-t p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium truncate flex-1 min-w-0">
              {user.name || user.email}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-foreground flex-shrink-0"
              onClick={() => signOut({ callbackUrl: "/de/auth/login" })}
              title="Abmelden"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
