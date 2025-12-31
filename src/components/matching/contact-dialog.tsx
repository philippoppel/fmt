"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  MapPin,
  User,
  Video,
  Building2,
  CreditCard,
  Heart,
  Gauge,
  Settings2,
} from "lucide-react";
import { submitContactInquiry } from "@/lib/actions/contact-inquiry";
import { useMatchingCriteria } from "@/hooks/use-matching-criteria";
import {
  getCategoryLabel,
  getSubcategoryLabel,
} from "@/lib/matching/wizard-categories";
import { getLanguageName, getLanguageFlag } from "@/lib/languages";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  therapistId: string;
  therapistName: string;
  matchScore?: number;
}

export function ContactDialog({
  open,
  onOpenChange,
  therapistId,
  therapistName,
  matchScore,
}: ContactDialogProps) {
  const t = useTranslations("matching.contact");
  const tTopics = useTranslations("matching.topics");
  const tSubTopics = useTranslations("matching.subTopics");

  // Get matching data from sessionStorage
  const {
    hasMatchingData,
    hasWizardV2Data,
    selectedTopics,
    selectedSubTopics,
    location,
    gender,
    sessionType,
    insurance,
    // Wizard V2 fields
    wizardCategoryId,
    wizardSubcategoryId,
    wizardSymptomAnswers,
    wizardSeverityScore,
    wizardStyleStructure,
    wizardStyleEngagement,
    wizardRelationshipVsMethod,
    wizardTempo,
    wizardSafetyVsChallenge,
    // Wizard V2 logistics fields
    wizardGenderPreference,
    wizardLocation,
    wizardSearchRadius,
    wizardLanguages,
  } = useMatchingCriteria();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [includeMatchingData, setIncludeMatchingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitContactInquiry({
        therapistId,
        ...formData,
        matchScore,
        // Only include matching data if checkbox is checked
        selectedTopics: includeMatchingData ? selectedTopics : [],
        selectedSubTopics: includeMatchingData ? selectedSubTopics : [],
        location: includeMatchingData ? location : null,
        gender: includeMatchingData ? gender : null,
        sessionType: includeMatchingData ? sessionType : null,
        insurance: includeMatchingData ? insurance : [],
        // Wizard V2 fields
        wizardCategoryId: includeMatchingData ? wizardCategoryId : null,
        wizardSubcategoryId: includeMatchingData ? wizardSubcategoryId : null,
        wizardSymptomAnswers: includeMatchingData ? wizardSymptomAnswers : null,
        wizardSeverityScore: includeMatchingData ? wizardSeverityScore : null,
        wizardStyleStructure: includeMatchingData ? wizardStyleStructure : null,
        wizardStyleEngagement: includeMatchingData ? wizardStyleEngagement : null,
        wizardRelationshipVsMethod: includeMatchingData ? wizardRelationshipVsMethod : null,
        wizardTempo: includeMatchingData ? wizardTempo : null,
        wizardSafetyVsChallenge: includeMatchingData ? wizardSafetyVsChallenge : null,
        // Wizard V2 logistics fields
        wizardGenderPreference: includeMatchingData ? wizardGenderPreference : null,
        wizardLocation: includeMatchingData ? wizardLocation : null,
        wizardSearchRadius: includeMatchingData ? wizardSearchRadius : null,
        wizardLanguages: includeMatchingData ? wizardLanguages : [],
      });

      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || t("errorMessage"));
      }
    } catch {
      setError(t("errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitted) {
      setFormData({ name: "", email: "", phone: "", message: "" });
      setSubmitted(false);
    }
    onOpenChange(false);
  };

  // Helper to get translated topic name (wizard categories)
  const getTopicLabel = (topicId: string): string => {
    // First try wizard categories
    const wizardLabel = getCategoryLabel(topicId);
    if (wizardLabel !== topicId) return wizardLabel;

    // Fallback to translation
    const label = tTopics(topicId);
    if (label === topicId || label.includes(".")) {
      return topicId;
    }
    return label;
  };

  // Helper to get translated subtopic name (wizard subcategories)
  const getSubTopicLabel = (subTopicId: string): string => {
    // First try wizard subcategories
    const wizardLabel = getSubcategoryLabel(subTopicId);
    if (wizardLabel !== subTopicId) return wizardLabel;

    // Fallback to translation
    const label = tSubTopics(subTopicId);
    if (label === subTopicId || label.includes(".")) {
      return subTopicId;
    }
    return label;
  };

  // Helper to get gender label
  const getGenderLabel = (g: string): string => {
    const labels: Record<string, string> = {
      male: "Männlich",
      female: "Weiblich",
      diverse: "Divers",
    };
    return labels[g] || g;
  };

  // Helper to get session type label
  const getSessionTypeLabel = (st: string): string => {
    const labels: Record<string, string> = {
      online: "Online",
      in_person: "Vor Ort",
      both: "Online & Vor Ort",
    };
    return labels[st] || st;
  };

  // Helper to get insurance label
  const getInsuranceLabel = (ins: string): string => {
    const labels: Record<string, string> = {
      public: "Gesetzlich",
      private: "Privat",
      self_pay: "Selbstzahler",
    };
    return labels[ins] || ins;
  };

  // Helper to get style structure label
  const getStyleStructureLabel = (style: string | null): string => {
    if (!style) return "";
    const labels: Record<string, string> = {
      structured: "Strukturiert mit Übungen",
      open: "Freies Erzählen",
      mixed: "Mischung aus beidem",
      unsure: "Noch unsicher",
    };
    return labels[style] || style;
  };

  // Helper to get style engagement label
  const getStyleEngagementLabel = (style: string | null): string => {
    if (!style) return "";
    const labels: Record<string, string> = {
      active: "Aktiv mit Rückmeldung",
      receptive: "Eher zuhörend",
      situational: "Situationsabhängig",
      unsure: "Noch unsicher",
    };
    return labels[style] || style;
  };

  // Helper to get severity level label
  const getSeverityLabel = (score: number | null): string => {
    if (score === null) return "";
    if (score <= 3) return "Leicht";
    if (score <= 6) return "Mittel";
    if (score <= 9) return "Erhöht";
    return "Stark";
  };

  // Helper to get optional preference labels
  const getRelationshipVsMethodLabel = (pref: string | null): string => {
    if (!pref) return "";
    const labels: Record<string, string> = {
      relationship: "Beziehung wichtiger",
      method: "Methode wichtiger",
      both: "Beides gleich wichtig",
    };
    return labels[pref] || pref;
  };

  const getTempoLabel = (tempo: string | null): string => {
    if (!tempo) return "";
    const labels: Record<string, string> = {
      fast: "Schnelle Ergebnisse",
      slow: "Langsam & gründlich",
      flexible: "Flexibel",
    };
    return labels[tempo] || tempo;
  };

  const getSafetyVsChallengeLabel = (pref: string | null): string => {
    if (!pref) return "";
    const labels: Record<string, string> = {
      safety: "Sicherheit",
      challenge: "Herausforderung",
      balanced: "Ausgewogen",
    };
    return labels[pref] || pref;
  };

  // Helper to get gender preference label
  const getGenderPreferenceLabel = (genderPref: string | null): string => {
    if (!genderPref) return "";
    const labels: Record<string, string> = {
      female: "Weibliche Therapeutin",
      male: "Männlicher Therapeut",
      diverse: "Diverse:r Therapeut:in",
    };
    return labels[genderPref] || genderPref;
  };

  // Success State
  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-emerald/10">
              <CheckCircle2 className="h-7 w-7 text-accent-emerald" />
            </div>
            <h3 className="text-lg font-semibold">{t("successTitle")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("successMessage", { name: therapistName })}
            </p>
            <Button onClick={handleClose} className="mt-6">
              {t("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title", { name: therapistName })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Fields */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="contact-name">{t("name")}</Label>
              <Input
                id="contact-name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("namePlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="contact-email">{t("email")}</Label>
              <Input
                id="contact-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder={t("emailPlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="contact-phone">{t("phoneOptional")}</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder={t("phonePlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="contact-message">{t("message")}</Label>
              <Textarea
                id="contact-message"
                required
                rows={4}
                placeholder={t("messagePlaceholder")}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
            </div>
          </div>

          {/* Optional Matching Context */}
          {hasMatchingData && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="include-matching"
                  checked={includeMatchingData}
                  onCheckedChange={(checked) => setIncludeMatchingData(!!checked)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="include-matching"
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                    {t("includeMatchingData")}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("includeMatchingDataHint")}
                  </p>
                </div>
              </div>

              {/* Show matching data preview when checkbox is checked */}
              {includeMatchingData && (
                <div className="pt-3 border-t border-border/50 space-y-2.5">
                  {/* Wizard V2: Category & Subcategory */}
                  {hasWizardV2Data && wizardCategoryId && (
                    <div className="flex items-start gap-2">
                      <Heart className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                      <span className="text-xs text-muted-foreground w-16 shrink-0">Thema:</span>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryLabel(wizardCategoryId)}
                        </Badge>
                        {wizardSubcategoryId && (
                          <Badge variant="outline" className="text-xs">
                            {getSubcategoryLabel(wizardSubcategoryId)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Wizard V2: Severity Score */}
                  {hasWizardV2Data && wizardSeverityScore !== null && wizardSeverityScore > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground w-16 shrink-0">Belastung:</span>
                      <span>{getSeverityLabel(wizardSeverityScore)} ({wizardSeverityScore}/12)</span>
                    </div>
                  )}

                  {/* Wizard V2: Style Preferences */}
                  {hasWizardV2Data && (wizardStyleStructure || wizardStyleEngagement) && (
                    <div className="flex items-start gap-2">
                      <Settings2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                      <span className="text-xs text-muted-foreground w-16 shrink-0">Stil:</span>
                      <div className="flex flex-wrap gap-1">
                        {wizardStyleStructure && wizardStyleStructure !== "unsure" && (
                          <Badge variant="outline" className="text-xs">
                            {getStyleStructureLabel(wizardStyleStructure)}
                          </Badge>
                        )}
                        {wizardStyleEngagement && wizardStyleEngagement !== "unsure" && (
                          <Badge variant="outline" className="text-xs">
                            {getStyleEngagementLabel(wizardStyleEngagement)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Wizard V2: Optional Preferences */}
                  {hasWizardV2Data && (wizardRelationshipVsMethod || wizardTempo || wizardSafetyVsChallenge) && (
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                      <span className="text-xs text-muted-foreground w-16 shrink-0">Extras:</span>
                      <div className="flex flex-wrap gap-1">
                        {wizardRelationshipVsMethod && (
                          <Badge variant="outline" className="text-xs">
                            {getRelationshipVsMethodLabel(wizardRelationshipVsMethod)}
                          </Badge>
                        )}
                        {wizardTempo && (
                          <Badge variant="outline" className="text-xs">
                            {getTempoLabel(wizardTempo)}
                          </Badge>
                        )}
                        {wizardSafetyVsChallenge && (
                          <Badge variant="outline" className="text-xs">
                            {getSafetyVsChallengeLabel(wizardSafetyVsChallenge)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Wizard V2: Gender Preference */}
                  {hasWizardV2Data && wizardGenderPreference && (
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground w-16 shrink-0">Geschlecht:</span>
                      <span>{getGenderPreferenceLabel(wizardGenderPreference)}</span>
                    </div>
                  )}

                  {/* Wizard V2: Location */}
                  {hasWizardV2Data && wizardLocation && (
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground w-16 shrink-0">Standort:</span>
                      <span>
                        {wizardLocation}
                        {wizardSearchRadius && ` (${wizardSearchRadius} km Umkreis)`}
                      </span>
                    </div>
                  )}

                  {/* Wizard V2: Languages */}
                  {hasWizardV2Data && wizardLanguages && wizardLanguages.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground w-16 shrink-0 pt-0.5">Sprachen:</span>
                      <div className="flex flex-wrap gap-1">
                        {wizardLanguages.map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {getLanguageFlag(lang)} {getLanguageName(lang)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Legacy: Topics (only if no wizard V2 data) */}
                  {!hasWizardV2Data && selectedTopics.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">
                        {t("topics")}:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedTopics.map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {getTopicLabel(topic)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Legacy: SubTopics (only if no wizard V2 data) */}
                  {!hasWizardV2Data && selectedSubTopics.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">
                        {t("details")}:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedSubTopics.map((subTopic) => (
                          <Badge key={subTopic} variant="outline" className="text-xs">
                            {getSubTopicLabel(subTopic)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {location && (
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{t("location")}:</span>
                      <span>{location}</span>
                    </div>
                  )}

                  {/* Gender Preference */}
                  {gender && (
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{t("genderPreference")}:</span>
                      <span>{getGenderLabel(gender)}</span>
                    </div>
                  )}

                  {/* Session Type */}
                  {sessionType && (
                    <div className="flex items-center gap-2 text-xs">
                      {sessionType === "online" ? (
                        <Video className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="text-muted-foreground">{t("sessionType")}:</span>
                      <span>{getSessionTypeLabel(sessionType)}</span>
                    </div>
                  )}

                  {/* Insurance */}
                  {insurance.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{t("insurance")}:</span>
                      <span>{insurance.map(getInsuranceLabel).join(", ")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {t("send")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
