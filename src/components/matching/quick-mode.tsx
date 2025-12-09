"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Zap,
  ArrowRight,
  Video,
  Building2,
  MapPin,
  Clock,
  Calendar,
  Sparkles,
} from "lucide-react";
import { MATCHING_TOPICS } from "@/lib/matching/topics";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;
type Urgency = "urgent" | "soon" | "flexible";
type SessionPref = "online" | "in_person" | "both";

interface QuickModeProps {
  onSwitchToFull: () => void;
}

export function QuickMode({ onSwitchToFull }: QuickModeProps) {
  const t = useTranslations();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<Urgency | null>(null);
  const [sessionPref, setSessionPref] = useState<SessionPref | null>(null);

  const handleComplete = () => {
    if (!selectedTopic) return;

    // Build matching criteria
    const matchingData = {
      selectedTopics: [selectedTopic],
      selectedSubTopics: [],
      intensityLevel: urgency === "urgent" ? "high" : urgency === "soon" ? "medium" : "low",
      location: "",
      gender: null,
      sessionType: sessionPref,
      insurance: [],
    };

    sessionStorage.setItem("matchingCriteria", JSON.stringify(matchingData));

    const params = new URLSearchParams();
    params.set("matching", "true");
    if (sessionPref && sessionPref !== "both") {
      params.set("sessionType", sessionPref);
    }

    router.push(`/therapists?${params.toString()}`);
  };

  const topTopics = MATCHING_TOPICS.slice(0, 6);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <Badge className="mb-3 gap-1 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
          <Zap className="h-3 w-3" />
          {t("matching.quickMode.badge")}
        </Badge>
        <h2 className="text-xl font-bold sm:text-2xl">
          {t("matching.quickMode.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("matching.quickMode.subtitle")}
        </p>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-2 w-12 rounded-full transition-colors",
              s <= step ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step 1: Topic Selection */}
      {step === 1 && (
        <Card className="p-6">
          <h3 className="mb-4 text-center font-medium">
            {t("matching.quickMode.q1")}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {topTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedTopic(topic.id);
                  setStep(2);
                }}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:border-primary hover:bg-primary/5",
                  selectedTopic === topic.id && "border-primary bg-primary/10"
                )}
              >
                <span className="text-2xl">
                  {topic.id === "depression" && "😔"}
                  {topic.id === "anxiety" && "😰"}
                  {topic.id === "family" && "👨‍👩‍👧"}
                  {topic.id === "relationships" && "💔"}
                  {topic.id === "burnout" && "🔥"}
                  {topic.id === "trauma" && "💔"}
                </span>
                <span className="text-sm font-medium">
                  {t(`matching.topics.${topic.id}`)}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Step 2: Urgency */}
      {step === 2 && (
        <Card className="p-6">
          <h3 className="mb-4 text-center font-medium">
            {t("matching.quickMode.q2")}
          </h3>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setUrgency("urgent");
                setStep(3);
              }}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-primary",
                urgency === "urgent" && "border-primary bg-primary/10"
              )}
            >
              <Clock className="h-5 w-5 text-red-500" />
              <span className="font-medium">{t("matching.quickMode.q2Urgent")}</span>
            </button>
            <button
              onClick={() => {
                setUrgency("soon");
                setStep(3);
              }}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-primary",
                urgency === "soon" && "border-primary bg-primary/10"
              )}
            >
              <Calendar className="h-5 w-5 text-amber-500" />
              <span className="font-medium">{t("matching.quickMode.q2Soon")}</span>
            </button>
            <button
              onClick={() => {
                setUrgency("flexible");
                setStep(3);
              }}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-primary",
                urgency === "flexible" && "border-primary bg-primary/10"
              )}
            >
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="font-medium">{t("matching.quickMode.q2Flexible")}</span>
            </button>
          </div>
          <Button variant="ghost" className="mt-4 w-full" onClick={() => setStep(1)}>
            {t("matching.wizard.back")}
          </Button>
        </Card>
      )}

      {/* Step 3: Session Type */}
      {step === 3 && (
        <Card className="p-6">
          <h3 className="mb-4 text-center font-medium">
            {t("matching.quickMode.q3")}
          </h3>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setSessionPref("online")}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-primary",
                sessionPref === "online" && "border-primary bg-primary/10"
              )}
            >
              <Video className="h-5 w-5 text-blue-500" />
              <span className="font-medium">{t("matching.quickMode.q3Online")}</span>
            </button>
            <button
              onClick={() => setSessionPref("in_person")}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-primary",
                sessionPref === "in_person" && "border-primary bg-primary/10"
              )}
            >
              <Building2 className="h-5 w-5 text-green-500" />
              <span className="font-medium">{t("matching.quickMode.q3InPerson")}</span>
            </button>
            <button
              onClick={() => setSessionPref("both")}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-primary",
                sessionPref === "both" && "border-primary bg-primary/10"
              )}
            >
              <MapPin className="h-5 w-5 text-purple-500" />
              <span className="font-medium">{t("matching.quickMode.q3Both")}</span>
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              onClick={handleComplete}
              disabled={!sessionPref}
              className="w-full gap-2"
            >
              {t("matching.quickMode.showResults")}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={() => setStep(2)}>
              {t("matching.wizard.back")}
            </Button>
          </div>
        </Card>
      )}

      {/* Switch to Full Mode */}
      <div className="text-center">
        <Button variant="link" onClick={onSwitchToFull} className="text-muted-foreground">
          {t("matching.quickMode.switchToFull")}
        </Button>
      </div>
    </div>
  );
}
