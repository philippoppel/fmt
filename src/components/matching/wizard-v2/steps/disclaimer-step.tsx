"use client";

import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useWizardV2 } from "../wizard-context";
import { useState } from "react";

export function DisclaimerStep() {
  const { actions } = useWizardV2();
  const [checked, setChecked] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Bevor wir starten
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Ein paar wichtige Hinweise zu diesem Matching-Tool
        </p>
      </div>

      {/* Info Card */}
      <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <div className="flex gap-4">
          <AlertTriangle className="h-6 w-6 text-gray-600 dark:text-gray-400 shrink-0 mt-0.5" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Wichtiger Hinweis
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>
                  Dieses Tool ersetzt keine professionelle Diagnose. Es hilft
                  dir lediglich, passende Therapeut:innen zu finden.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>
                  Bei akuten Krisen oder Notfällen wende dich bitte direkt an
                  den Notruf (144) oder die Telefonseelsorge (142).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>
                  Deine Angaben werden anonym verarbeitet und nicht
                  gespeichert.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Benefits Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Was dich erwartet
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span>
                  <strong className="text-gray-900">~2 Minuten</strong> – Ein kurzer,
                  geführter Fragebogen
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span>
                  <strong className="text-gray-900">Personalisiert</strong> – Fragen
                  passen sich deinen Antworten an
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span>
                  <strong className="text-gray-900">TOP-3 Empfehlungen</strong> – Mit
                  Erklärungen, warum diese Therapeut:innen passen
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Checkbox Confirmation */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <Checkbox
          id="disclaimer-check"
          checked={checked}
          onCheckedChange={(value) => setChecked(value === true)}
        />
        <Label
          htmlFor="disclaimer-check"
          className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer leading-relaxed"
        >
          Ich verstehe, dass dieses Tool keine Diagnose oder Behandlung ersetzt
          und wende mich bei akuten Krisen an professionelle Hilfe.
        </Label>
      </div>

      {/* Continue Button */}
      <Button
        onClick={actions.acceptDisclaimer}
        disabled={!checked}
        className="w-full"
        size="lg"
      >
        Verstanden, los geht&apos;s
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
