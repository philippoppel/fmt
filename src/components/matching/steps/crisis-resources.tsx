"use client";

import { useTranslations, useLocale } from "next-intl";
import { Phone, MessageCircle, Globe, Heart, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMatching } from "../matching-context";

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
  const { actions } = useMatching();

  const resources = locale === "de" ? CRISIS_RESOURCES_DE : CRISIS_RESOURCES_EN;

  const handleContinueMatching = () => {
    // Reset crisis state and go back to screening
    actions.resetScreening();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Heart className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("matching.crisis.title")}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          {t("matching.crisis.subtitle")}
        </p>
      </div>

      {/* Immediate help message */}
      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 text-center">
        <p className="text-base font-medium">
          {t("matching.crisis.immediateHelp")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("matching.crisis.notAlone")}
        </p>
      </div>

      {/* Crisis resources */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">{t("matching.crisis.resourcesTitle")}</h2>
        <div className="grid gap-3">
          {resources.map((resource, index) => (
            <CrisisResourceCard key={index} resource={resource} />
          ))}
        </div>
      </div>

      {/* Additional info */}
      <div className="rounded-lg border bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">
          {t("matching.crisis.additionalInfo")}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 border-t pt-4">
        <p className="text-center text-sm text-muted-foreground">
          {t("matching.crisis.alternativeText")}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" onClick={handleContinueMatching} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("matching.screening.continueMatching")}
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">
              {t("matching.crisis.backToHome")}
            </Link>
          </Button>
        </div>
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
