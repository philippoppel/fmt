import * as React from "react";
import { cn } from "@/lib/utils";

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
}

export function VisuallyHidden({
  children,
  as: Component = "span",
  className,
}: VisuallyHiddenProps) {
  return (
    <Component className={cn("sr-only", className)}>
      {children}
    </Component>
  );
}
