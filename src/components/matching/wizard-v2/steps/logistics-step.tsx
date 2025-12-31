"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Video,
  MapPin,
  Users,
  Shield,
  CreditCard,
  User,
  UserCircle,
  Globe,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useWizardV2, type SearchRadius } from "../wizard-context";
import type { SessionType, Insurance, Gender } from "@/types/therapist";
import { COMMON_LANGUAGES, getLanguageName, getLanguageFlag } from "@/lib/languages";

// Option card with icon
interface OptionCardProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
}

function OptionCard({
  icon,
  label,
  description,
  isSelected,
  onClick,
}: OptionCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected
          ? "ring-2 ring-primary border-primary bg-primary/5"
          : "hover:border-primary/50"
      )}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div
          className={cn(
            "p-2 rounded-lg",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-gray-100 text-gray-500"
          )}
        >
          {icon}
        </div>
        <div>
          <p
            className={cn(
              "font-medium",
              isSelected ? "text-primary" : "text-gray-900"
            )}
          >
            {label}
          </p>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Smaller option button for gender selection
interface SmallOptionProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function SmallOption({ label, isSelected, onClick }: SmallOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
        isSelected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-white text-gray-700 border-gray-200 hover:border-primary/50"
      )}
    >
      {label}
    </button>
  );
}

export function LogisticsStep() {
  const { state, actions } = useWizardV2();
  const [showLanguages, setShowLanguages] = useState(state.languages.length > 0);

  const handleNext = () => {
    actions.goNext();
  };

  // Session type options
  const sessionTypeOptions: {
    value: SessionType;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "online",
      label: "Online",
      description: "Videositzungen von zu Hause",
      icon: <Video className="h-5 w-5" />,
    },
    {
      value: "in_person",
      label: "Vor Ort",
      description: "Persönliche Sitzungen in der Praxis",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      value: "both",
      label: "Beides",
      description: "Flexibel zwischen online und vor Ort",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  // Insurance options
  const insuranceOptions: {
    value: Insurance;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "public",
      label: "Gesetzlich versichert",
      description: "Kassenfinanzierte Therapie",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      value: "private",
      label: "Privat / Selbstzahler",
      description: "Private Krankenversicherung oder Selbstzahlung",
      icon: <CreditCard className="h-5 w-5" />,
    },
  ];

  // Gender options
  const genderOptions: { value: Gender | null; label: string }[] = [
    { value: null, label: "Egal" },
    { value: "female", label: "Weiblich" },
    { value: "male", label: "Männlich" },
    { value: "diverse", label: "Divers" },
  ];

  // Radius options
  const radiusOptions: { value: SearchRadius; label: string }[] = [
    { value: 10, label: "10 km" },
    { value: 25, label: "25 km" },
    { value: 50, label: "50 km" },
    { value: 100, label: "100 km" },
  ];

  // Common languages for quick selection (excluding German which is implicit)
  const quickLanguages = COMMON_LANGUAGES.filter((lang) => lang !== "de").slice(0, 8);

  const showLocationInput = state.sessionType === "in_person" || state.sessionType === "both";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Praktische Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Diese Angaben helfen uns, die besten Therapeut:innen für dich zu finden
        </p>
      </div>

      {/* Session Type */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Wo soll die Therapie stattfinden?</h3>
        <div className="space-y-2">
          {sessionTypeOptions.map((option) => (
            <OptionCard
              key={option.value}
              icon={option.icon}
              label={option.label}
              description={option.description}
              isSelected={state.sessionType === option.value}
              onClick={() => actions.setSessionType(option.value)}
            />
          ))}
        </div>
        {state.sessionType && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => actions.setSessionType(null)}
            className="text-gray-500"
          >
            Auswahl aufheben
          </Button>
        )}
      </div>

      {/* Location - only show if in_person or both selected */}
      {showLocationInput && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Dein Standort
          </h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="PLZ oder Stadt eingeben"
                value={state.location || ""}
                onChange={(e) => actions.setLocation(e.target.value || null)}
                className="w-full"
              />
            </div>
            <Select
              value={state.searchRadius?.toString() || "25"}
              onValueChange={(value) => actions.setSearchRadius(parseInt(value) as SearchRadius)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Umkreis" />
              </SelectTrigger>
              <SelectContent>
                {radiusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value?.toString() || "25"}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-gray-500">
            Wir zeigen dir Therapeut:innen in diesem Umkreis
          </p>
        </div>
      )}

      {/* Gender Preference */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <UserCircle className="h-4 w-4" />
          Geschlecht der Therapeut:in
        </h3>
        <div className="flex flex-wrap gap-2">
          {genderOptions.map((option) => (
            <SmallOption
              key={option.value || "null"}
              label={option.label}
              isSelected={state.genderPreference === option.value}
              onClick={() => actions.setGenderPreference(option.value)}
            />
          ))}
        </div>
      </div>

      {/* Insurance */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Wie bist du versichert?</h3>
        <div className="space-y-2">
          {insuranceOptions.map((option) => (
            <OptionCard
              key={option.value}
              icon={option.icon}
              label={option.label}
              description={option.description}
              isSelected={state.insurance === option.value}
              onClick={() => actions.setInsurance(option.value)}
            />
          ))}
        </div>
        {state.insurance && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => actions.setInsurance(null)}
            className="text-gray-500"
          >
            Auswahl aufheben
          </Button>
        )}
      </div>

      {/* Language - Collapsible Section */}
      <Collapsible open={showLanguages} onOpenChange={setShowLanguages}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <Globe className="h-4 w-4" />
            <span>Andere Sprache als Deutsch benötigt?</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                showLanguages && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          <p className="text-sm text-gray-600">
            Deutsch ist Standard. Wähle zusätzliche Sprachen, wenn du eine andere Sprache bevorzugst.
          </p>

          {/* Selected languages */}
          {state.languages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {state.languages.map((lang) => (
                <Badge
                  key={lang}
                  variant="secondary"
                  className="text-sm flex items-center gap-1"
                >
                  <span>{getLanguageFlag(lang)}</span>
                  <span>{getLanguageName(lang)}</span>
                  <button
                    type="button"
                    onClick={() => actions.removeLanguage(lang)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Quick language selection */}
          <div className="flex flex-wrap gap-2">
            {quickLanguages.map((lang) => {
              const isSelected = state.languages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      actions.removeLanguage(lang);
                    } else {
                      actions.addLanguage(lang);
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-sm transition-all flex items-center gap-1.5",
                    isSelected
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-white border-gray-200 hover:border-primary/50"
                  )}
                >
                  <span>{getLanguageFlag(lang)}</span>
                  <span>{getLanguageName(lang)}</span>
                </button>
              );
            })}
          </div>

          {/* All languages dropdown */}
          <Select
            value=""
            onValueChange={(value) => {
              if (value && !state.languages.includes(value)) {
                actions.addLanguage(value);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Weitere Sprache hinzufügen..." />
            </SelectTrigger>
            <SelectContent>
              {COMMON_LANGUAGES.filter(
                (lang) => lang !== "de" && !state.languages.includes(lang)
              ).map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {getLanguageFlag(lang)} {getLanguageName(lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CollapsibleContent>
      </Collapsible>

      {/* Hint */}
      <p className="text-sm text-gray-500 text-center">
        Alle Angaben sind optional. Je mehr du angibst, desto besser werden die Ergebnisse.
      </p>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={actions.goBack}
          className="flex-1 sm:flex-none"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 sm:flex-none sm:ml-auto"
        >
          Ergebnisse anzeigen
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
