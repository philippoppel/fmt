"use client";

import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface UserAvatarProps {
  imageUrl?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

const ICON_SIZES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
};

function getInitials(name: string | null | undefined): string {
  if (!name) return "";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  // First and last name initials
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function UserAvatar({ imageUrl, name, size = "md", className }: UserAvatarProps) {
  const initials = getInitials(name);
  const sizeClass = SIZE_CLASSES[size];
  const iconSize = ICON_SIZES[size];

  if (imageUrl) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden flex-shrink-0 bg-muted",
          sizeClass,
          className
        )}
      >
        <img
          src={imageUrl}
          alt={name || "Profilbild"}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (initials) {
    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary font-medium",
          sizeClass,
          className
        )}
      >
        {initials}
      </div>
    );
  }

  // Fallback to icon
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10",
        sizeClass,
        className
      )}
    >
      <User className={cn("text-primary", iconSize)} />
    </div>
  );
}
