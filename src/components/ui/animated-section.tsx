"use client";

import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import { forwardRef, ElementType, ComponentPropsWithoutRef } from "react";

type AnimationType = "fade-up" | "fade-scale" | "slide-left" | "slide-right";

interface AnimatedSectionProps<T extends ElementType = "div"> {
  as?: T;
  animation?: AnimationType;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

const animationClasses: Record<AnimationType, string> = {
  "fade-up": "animate-fade-in-up",
  "fade-scale": "animate-fade-in-scale",
  "slide-left": "animate-slide-in-left",
  "slide-right": "animate-slide-in-right",
};

export function AnimatedSection<T extends ElementType = "div">({
  as,
  animation = "fade-up",
  delay = 0,
  className,
  children,
  ...props
}: AnimatedSectionProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof AnimatedSectionProps<T>>) {
  const { ref, isVisible } = useScrollAnimation();
  const Component = as || "div";

  return (
    <Component
      ref={ref}
      className={cn(
        "opacity-0",
        isVisible && animationClasses[animation],
        className
      )}
      style={{ animationDelay: `${delay}s`, animationFillMode: "forwards" }}
      {...props}
    >
      {children}
    </Component>
  );
}
