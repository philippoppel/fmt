"use client";

import { useTranslations, useLocale } from "next-intl";
import { Phone, MessageCircle, Globe, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CrisisResource {
  name: string;
  phone: string;
  description: string;
  available: string;
  type: "phone" | "chat" | "web";
  url?: string;
}

const CRISIS_RESOURCES_DE: CrisisResource[] = [
  {
    name: "Telefonseelsorge",
    phone: "0800 111 0 111",
    description: "Kostenlose, anonyme Beratung rund um die Uhr",
    available: "24/7",
    type: "phone",
  },
  {
    name: "Telefonseelsorge (alternativ)",
    phone: "0800 111 0 222",
    description: "Kostenlose, anonyme Beratung rund um die Uhr",
    available: "24/7",
    type: "phone",
  },
  {
    name: "Kinder- und Jugendtelefon",
    phone: "116 111",
    description: "Beratung speziell für Kinder und Jugendliche",
    available: "Mo-Sa 14-20 Uhr",
    type: "phone",
  },
  {
    name: "Online-Beratung",
    phone: "",
    description: "Schriftliche Beratung per Chat oder E-Mail",
    available: "Rund um die Uhr erreichbar",
    type: "web",
    url: "https://online.telefonseelsorge.de",
  },
];

const CRISIS_RESOURCES_EN: CrisisResource[] = [
  {
    name: "Telefonseelsorge (Germany)",
    phone: "0800 111 0 111",
    description: "Free, anonymous counseling around the clock",
    available: "24/7",
    type: "phone",
  },
  {
    name: "Telefonseelsorge (alternative)",
    phone: "0800 111 0 222",
    description: "Free, anonymous counseling around the clock",
    available: "24/7",
    type: "phone",
  },
  {
    name: "International Crisis Lines",
    phone: "",
    description: "Find crisis support in your country",
    available: "Varies by location",
    type: "web",
    url: "https://findahelpline.com",
  },
];

export function CrisisResources() {
  const t = useTranslations();
  const locale = useLocale();

  const resources = locale === "de" ? CRISIS_RESOURCES_DE : CRISIS_RESOURCES_EN;

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <Heart className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("matching.crisis.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {t("matching.crisis.subtitle")}
        </p>
      </div>

      {/* Immediate help message */}
      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/20">
        <p className="text-lg font-medium text-red-800 dark:text-red-200">
          {t("matching.crisis.immediateHelp")}
        </p>
        <p className="mt-2 text-red-700 dark:text-red-300">
          {t("matching.crisis.notAlone")}
        </p>
      </div>

      {/* Crisis resources */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t("matching.crisis.resourcesTitle")}</h2>
        <div className="grid gap-4">
          {resources.map((resource, index) => (
            <CrisisResourceCard key={index} resource={resource} />
          ))}
        </div>
      </div>

      {/* Additional info */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          {t("matching.crisis.additionalInfo")}
        </p>
      </div>

      {/* Alternative action */}
      <div className="flex flex-col items-center gap-4 border-t pt-6">
        <p className="text-center text-sm text-muted-foreground">
          {t("matching.crisis.alternativeText")}
        </p>
        <Button variant="outline" asChild>
          <Link href="/">
            {t("matching.crisis.backToHome")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function CrisisResourceCard({ resource }: { resource: CrisisResource }) {
  const Icon = resource.type === "phone" ? Phone : resource.type === "chat" ? MessageCircle : Globe;

  return (
    <div className="flex items-start gap-4 rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{resource.name}</h3>
          <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
            {resource.available}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{resource.description}</p>
        {resource.phone && (
          <a
            href={`tel:${resource.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1 text-lg font-bold text-primary hover:underline"
          >
            <Phone className="h-4 w-4" />
            {resource.phone}
          </a>
        )}
        {resource.url && (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <Globe className="h-4 w-4" />
            {resource.url.replace("https://", "")}
          </a>
        )}
      </div>
    </div>
  );
}
