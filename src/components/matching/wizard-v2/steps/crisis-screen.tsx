"use client";

import { Heart, Phone, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWizardV2 } from "../wizard-context";

interface CrisisHotline {
  country: string;
  name: string;
  number: string;
  description: string;
}

const CRISIS_HOTLINES: CrisisHotline[] = [
  {
    country: "Österreich",
    name: "Telefonseelsorge",
    number: "142",
    description: "Kostenlos, 24/7, anonym",
  },
  {
    country: "Österreich",
    name: "Psychiatrische Soforthilfe",
    number: "01 31330",
    description: "Kostenlos, 24/7",
  },
  {
    country: "Österreich",
    name: "Rettung / Notarzt",
    number: "144",
    description: "Bei akuter Gefahr",
  },
  {
    country: "Österreich",
    name: "Euro-Notruf",
    number: "112",
    description: "Allgemeiner Notruf",
  },
];

function HotlineCard({ hotline }: { hotline: CrisisHotline }) {
  return (
    <div className="rounded-xl border-2 border-rose-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{hotline.name}</p>
          <p className="text-sm text-gray-600">
            {hotline.description}
          </p>
        </div>
        <a
          href={`tel:${hotline.number.replace(/\s/g, "")}`}
          className="flex items-center gap-2 px-5 py-3 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors shrink-0 text-lg"
        >
          <Phone className="h-5 w-5" />
          {hotline.number}
        </a>
      </div>
    </div>
  );
}

export function CrisisScreen() {
  const { actions } = useWizardV2();

  const handleContinueAnyway = () => {
    actions.acknowledgeCrisis();
  };

  const handleRestart = () => {
    actions.reset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Heart className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Du bist nicht allein
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Wenn du dich in einer akuten Krise befindest, wende dich bitte sofort
          an eine der folgenden Stellen. Sie sind rund um die Uhr für dich da.
        </p>
      </div>

      {/* Hotlines */}
      <div className="space-y-3">
        {CRISIS_HOTLINES.map((hotline, index) => (
          <HotlineCard key={index} hotline={hotline} />
        ))}
      </div>

      {/* Important note */}
      <div className="rounded-lg border border-gray-300 bg-gray-100 p-4">
        <p className="text-sm text-gray-700">
          <strong className="text-gray-900">Wichtig:</strong> Diese App ist kein Ersatz für
          professionelle Krisenintervention. Bei unmittelbarer Gefahr ruf
          bitte den Notruf 144 oder 112 an.
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4">
        <Button
          variant="outline"
          onClick={handleContinueAnyway}
          className="w-full"
        >
          Trotzdem professionelle Hilfe finden
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="ghost" onClick={handleRestart} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Neu starten
        </Button>
      </div>
    </div>
  );
}
