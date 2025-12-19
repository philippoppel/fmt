"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroCtaProps {
  className?: string;
}

export function HeroCta({ className }: HeroCtaProps) {
  const t = useTranslations("home.hero");

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4",
        "opacity-0 animate-hero-text-reveal",
        className
      )}
      style={{ animationDelay: "0.8s" }}
    >
      {/* Primary CTA Button */}
      <Button
        asChild
        size="lg"
        className={cn(
          "rounded-full px-8 py-6 text-lg font-semibold",
          "shadow-lg hover:shadow-xl transition-all duration-300",
          "hover:scale-105 active:scale-100",
          "animate-hero-cta-pulse",
          "group"
        )}
      >
        <Link href="/therapists/matching" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
          {t("cta")}
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </Button>

      {/* CTA Hint text */}
      <p className="text-sm text-muted-foreground/80 text-center max-w-xs">
        {t("ctaHint")}
      </p>

      {/* Secondary action - Explore therapists */}
      <div className="flex items-center gap-4 mt-2">
        <Button
          asChild
          variant="ghost"
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <Link href="/therapists">{t("ctaSecondary")}</Link>
        </Button>
      </div>
    </div>
  );
}
