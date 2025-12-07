"use client";

import { useTranslations } from "next-intl";

export function SkipLinks() {
  const t = useTranslations("navigation");

  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute left-4 top-4 z-[100] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {t("skipToContent")}
      </a>
      <a
        href="#main-navigation"
        className="absolute left-4 top-16 z-[100] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {t("skipToNavigation")}
      </a>
    </div>
  );
}
