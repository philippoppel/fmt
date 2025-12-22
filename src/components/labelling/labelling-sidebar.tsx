"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tag,
  BarChart3,
  Play,
  Inbox,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/de/labelling", label: "Dashboard", icon: BarChart3 },
  { href: "/de/labelling/cases/new", label: "Neuer Fall", icon: Play },
  { href: "/de/labelling/cases", label: "Inbox", icon: Inbox },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex-shrink-0 border-b px-4 py-3">
        <Link href="/de/labelling" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <Tag className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Training Portal</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href === "/de/labelling/cases" && pathname.startsWith("/de/labelling/cases") && !pathname.includes("/new"));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors min-h-[44px]",
                isActive
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

      {/* User Info & Logout - Fixed at bottom */}
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
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 z-50 lg:hidden p-2.5 rounded-lg bg-background border shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
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
          "fixed inset-y-0 left-0 z-40 w-56 bg-card border-r flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:w-52",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
