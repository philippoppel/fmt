"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tag,
  BarChart3,
  Play,
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
  { href: "/de/labelling/train", label: "Training", icon: Play },
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
    <aside className="flex h-screen w-64 flex-col border-r bg-muted/30">
      {/* Header */}
      <div className="border-b p-4">
        <Link href="/de/labelling" className="flex items-center gap-2">
          <Tag className="h-6 w-6 text-primary" />
          <span className="font-semibold">Training Portal</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/de/labelling" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
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
      <div className="border-t p-4">
        <div className="mb-3 space-y-1">
          <p className="text-sm font-medium truncate">
            {user.name || user.email}
          </p>
          <p className="text-xs text-muted-foreground">
            {user.role === "ADMIN" ? "Administrator" : "Therapeut"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => signOut({ callbackUrl: "/de/auth/login" })}
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </Button>
      </div>
    </aside>
  );
}
