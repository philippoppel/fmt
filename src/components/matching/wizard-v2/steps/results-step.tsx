"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Star,
  MapPin,
  Video,
  Users,
  CheckCircle2,
  Loader2,
  UserX,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWizardV2, type MatchedTherapistV2, type TherapyGoal, type TimeOrientation } from "../wizard-context";
import Link from "next/link";
import { ContactDialog } from "@/components/matching/contact-dialog";
import { Lightbulb } from "lucide-react";

// Generate first session tips based on user preferences
function generateFirstSessionTips(
  therapyGoal: TherapyGoal,
  timeOrientation: TimeOrientation,
  matchReasons: { type: string; textDE: string }[]
): string[] {
  const tips: string[] = [];

  // Tip based on therapy goal
  if (therapyGoal === "symptom_relief") {
    tips.push("Fragen Sie nach konkreten Übungen für den Alltag");
  } else if (therapyGoal === "deep_understanding") {
    tips.push("Besprechen Sie, wie Kindheitserfahrungen einbezogen werden");
  } else if (therapyGoal === "both") {
    tips.push("Klären Sie die Balance zwischen Symptomarbeit und Ursachenforschung");
  }

  // Tip based on time orientation
  if (timeOrientation === "past") {
    tips.push("Fragen Sie nach dem Umgang mit biografischen Themen");
  } else if (timeOrientation === "present") {
    tips.push("Fragen Sie nach praktischen Tools für aktuelle Herausforderungen");
  }

  // Generic helpful tip
  if (matchReasons.some(r => r.type === "style")) {
    tips.push("Prüfen Sie, ob die Arbeitsweise zu Ihnen passt");
  }

  // Always include this
  if (tips.length < 2) {
    tips.push("Achten Sie auf Ihr Bauchgefühl in der ersten Sitzung");
  }

  return tips.slice(0, 2); // Max 2 tips
}

// Session type icon
function SessionTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "online":
      return <Video className="h-4 w-4" />;
    case "in_person":
      return <MapPin className="h-4 w-4" />;
    case "both":
      return <Users className="h-4 w-4" />;
    default:
      return null;
  }
}

// Match card component
function MatchCard({
  match,
  rank,
  onContactClick,
  firstSessionTips,
}: {
  match: MatchedTherapistV2;
  rank: number;
  onContactClick: (therapistId: string, therapistName: string, matchScore: number) => void;
  firstSessionTips: string[];
}) {
  const rankColors = {
    1: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    2: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    3: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Header with rank */}
        <div className="flex items-center gap-3 p-4 border-b">
          {/* Rank badge */}
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
              rankColors[rank as keyof typeof rankColors] ?? rankColors[3]
            )}
          >
            #{rank}
          </div>

          {/* Avatar */}
          {match.imageUrl ? (
            <img
              src={match.imageUrl}
              alt={match.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-lg font-medium text-gray-500">
                {match.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Name and location */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {match.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {match.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {match.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <SessionTypeIcon type={match.sessionType} />
                {match.sessionType === "online"
                  ? "Online"
                  : match.sessionType === "in_person"
                    ? "Vor Ort"
                    : "Beides"}
              </span>
            </div>
          </div>

          {/* Match score */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-primary font-semibold">
              <Star className="h-4 w-4 fill-current" />
              {Math.round(match.totalScore)}%
            </div>
            <span className="text-xs text-gray-500">Match</span>
          </div>
        </div>

        {/* Description */}
        {match.shortDescription && (
          <div className="px-4 py-3 border-b">
            <p className="text-sm text-gray-600 line-clamp-2">
              {match.shortDescription}
            </p>
          </div>
        )}

        {/* Match reasons */}
        {match.matchReasons.length > 0 && (
          <div className="px-4 py-3 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Warum diese Person?
            </p>
            <ul className="space-y-1">
              {match.matchReasons.map((reason, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-900"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <span>{reason.textDE}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* First session tips (evidence-based) */}
        {firstSessionTips.length > 0 && (
          <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-100 dark:border-amber-800">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" />
              Tipp fürs Erstgespräch
            </p>
            <ul className="space-y-1">
              {firstSessionTips.map((tip, index) => (
                <li
                  key={index}
                  className="text-xs text-amber-700 dark:text-amber-400"
                >
                  • {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 space-y-2">
          <Button
            className="w-full"
            onClick={() => onContactClick(match.id, match.name, match.totalScore)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Kontakt aufnehmen
          </Button>
          <Link href={match.slug ? `/p/${match.slug}` : `/p/${match.id}`}>
            <Button variant="outline" className="w-full">
              Profil ansehen
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyState() {
  return (
    <Card className="p-8 text-center">
      <UserX className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Keine passenden Therapeut:innen gefunden
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        Versuche, deine Filter anzupassen oder weniger spezifische Kriterien zu
        wählen.
      </p>
    </Card>
  );
}

export function ResultsStep() {
  const { state, actions, computed } = useWizardV2();

  // Contact dialog state
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<{
    id: string;
    name: string;
    matchScore: number;
  } | null>(null);

  const handleContactClick = (therapistId: string, therapistName: string, matchScore: number) => {
    // Store all matching data in sessionStorage for the ContactDialog
    if (typeof window !== "undefined") {
      const matchingData = {
        // Legacy format for backwards compatibility
        selectedTopics: state.selectedCategoryId ? [state.selectedCategoryId] : [],
        selectedSubTopics: state.selectedSubcategoryId ? [state.selectedSubcategoryId] : [],
        location: state.location,
        gender: state.genderPreference,
        sessionType: state.sessionType,
        insurance: state.insurance ? [state.insurance] : [],

        // Wizard V2 specific fields
        wizardCategoryId: state.selectedCategoryId,
        wizardSubcategoryId: state.selectedSubcategoryId,
        wizardSymptomAnswers: state.symptomAnswers,
        wizardSeverityScore: state.severityScore,
        wizardStyleStructure: state.styleStructure,
        wizardStyleEngagement: state.styleEngagement,
        // Evidence-based fields (P2, P3)
        wizardTherapyGoal: state.therapyGoal,
        wizardTimeOrientation: state.timeOrientation,
        // Optional preferences
        wizardRelationshipVsMethod: state.relationshipVsMethod,
        wizardTempo: state.tempo,
        wizardSafetyVsChallenge: state.safetyVsChallenge,

        // Logistics fields
        wizardGenderPreference: state.genderPreference,
        wizardLocation: state.location,
        wizardSearchRadius: state.searchRadius,
        wizardLanguages: state.languages,
      };
      sessionStorage.setItem("matchingCriteria", JSON.stringify(matchingData));
    }
    setSelectedTherapist({ id: therapistId, name: therapistName, matchScore });
    setContactDialogOpen(true);
  };

  // Fetch results when step is loaded
  useEffect(() => {
    async function fetchResults() {
      actions.setLoading(true);

      try {
        // Call the matching API
        const response = await fetch("/api/matching/wizard-v2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: state.selectedCategoryId,
            subcategoryId: state.selectedSubcategoryId,
            severityScore: state.severityScore,
            styleStructure: state.styleStructure,
            styleEngagement: state.styleEngagement,
            // Evidence-based fields (P2, P3)
            therapyGoal: state.therapyGoal,
            timeOrientation: state.timeOrientation,
            // Logistics
            sessionType: state.sessionType,
            insurance: state.insurance,
            // Additional preferences
            genderPreference: state.genderPreference,
            location: state.location,
            searchRadius: state.searchRadius,
            languages: state.languages,
            // Evidence-based: negative experience
            hadNegativeExperience: state.hadNegativeExperience,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch matches");
        }

        const data = await response.json();
        actions.setResults(data.matches ?? []);
      } catch (error) {
        console.error("Error fetching matches:", error);
        actions.setResults([]);
      }
    }

    if (state.currentStep === 6 && state.topMatches.length === 0) {
      fetchResults();
    }
  }, [state.currentStep]);

  const handleRestart = () => {
    actions.reset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          Deine Top-Empfehlungen
        </h2>
        <p className="text-gray-600">
          {state.isLoadingResults
            ? "Wir suchen die passenden Therapeut:innen..."
            : state.topMatches.length > 0
              ? `${state.topMatches.length} Therapeut:innen passen zu deinen Angaben`
              : "Keine Treffer gefunden"}
        </p>
      </div>

      {/* Loading state */}
      {state.isLoadingResults && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600">Einen Moment bitte...</p>
        </div>
      )}

      {/* Results */}
      {!state.isLoadingResults && (
        <>
          {state.topMatches.length > 0 ? (
            <div className="space-y-4">
              {state.topMatches.map((match, index) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  rank={index + 1}
                  onContactClick={handleContactClick}
                  firstSessionTips={generateFirstSessionTips(
                    state.therapyGoal,
                    state.timeOrientation,
                    match.matchReasons
                  )}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </>
      )}

      {/* Summary badges */}
      {!state.isLoadingResults && computed.selectedCategory && (
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="secondary">{computed.selectedCategory.labelDE}</Badge>
          {computed.selectedSubcategory && (
            <Badge variant="outline">
              {computed.selectedSubcategory.labelDE}
            </Badge>
          )}
          {state.sessionType && (
            <Badge variant="outline">
              {state.sessionType === "online"
                ? "Online"
                : state.sessionType === "in_person"
                  ? "Vor Ort"
                  : "Online & Vor Ort"}
            </Badge>
          )}
          {state.insurance && (
            <Badge variant="outline">
              {state.insurance === "public" ? "Gesetzlich" : "Privat"}
            </Badge>
          )}
        </div>
      )}

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
          variant="outline"
          onClick={handleRestart}
          className="flex-1 sm:flex-none sm:ml-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Neu starten
        </Button>
      </div>

      {/* Contact Dialog */}
      {selectedTherapist && (
        <ContactDialog
          open={contactDialogOpen}
          onOpenChange={setContactDialogOpen}
          therapistId={selectedTherapist.id}
          therapistName={selectedTherapist.name}
          matchScore={selectedTherapist.matchScore}
        />
      )}
    </div>
  );
}
