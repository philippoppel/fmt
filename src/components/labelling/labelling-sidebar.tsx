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

  return (
    <aside className="flex h-screen w-52 flex-col border-r bg-card">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <Link href="/de/labelling" className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Training Portal</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          // Exact match for dashboard and cases/new, prefix match for inbox (but not cases/new)
          const isActive = pathname === item.href ||
            (item.href === "/de/labelling/cases" && pathname.startsWith("/de/labelling/cases") && !pathname.includes("/new"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t p-3">
        <div className="mb-2">
          <p className="text-sm font-medium truncate">
            {user.name || user.email}
          </p>
          <p className="text-xs text-muted-foreground">
            {user.role === "ADMIN" ? "Administrator" : "Therapeut"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 h-8 text-muted-foreground hover:text-foreground"
          onClick={() => signOut({ callbackUrl: "/de/auth/login" })}
        >
          <LogOut className="h-3.5 w-3.5" />
          Abmelden
        </Button>
      </div>
    </aside>
  );
}
