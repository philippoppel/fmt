"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { FileText, Clock, CalendarClock, Tags } from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/dashboard/admin/blogs",
    label: "Alle Artikel",
    icon: FileText,
    exact: true,
  },
  {
    href: "/dashboard/admin/blogs/review",
    label: "Zur Prüfung",
    icon: Clock,
    exact: false,
  },
  {
    href: "/dashboard/admin/blogs/scheduled",
    label: "Geplant",
    icon: CalendarClock,
    exact: false,
  },
  {
    href: "/dashboard/admin/blogs/categories",
    label: "Kategorien",
    icon: Tags,
    exact: false,
  },
];

export function AdminBlogNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname.endsWith(href) || pathname.endsWith(`${href}/`);
    }
    return pathname.includes(href);
  };

  return (
    <nav className="flex flex-wrap gap-2 border-b pb-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
