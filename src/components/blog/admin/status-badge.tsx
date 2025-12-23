"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PostStatus = "draft" | "review" | "scheduled" | "published" | "archived";

const STATUS_CONFIG: Record<
  PostStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Entwurf",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  },
  review: {
    label: "Zur Prüfung",
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  },
  scheduled: {
    label: "Geplant",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  published: {
    label: "Veröffentlicht",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  archived: {
    label: "Archiviert",
    className: "bg-gray-100 text-gray-500 hover:bg-gray-100",
  },
};

interface StatusBadgeProps {
  status: PostStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <Badge
      variant="secondary"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
