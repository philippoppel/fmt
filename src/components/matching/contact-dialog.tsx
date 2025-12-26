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
} from "lucide-react";
import { submitContactInquiry } from "@/lib/actions/contact-inquiry";
import { useMatchingCriteria } from "@/hooks/use-matching-criteria";

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
  const tFilters = useTranslations("therapists.filters");

  // Get matching data from sessionStorage
  const {
    hasMatchingData,
    selectedTopics,
    selectedSubTopics,
    location,
    gender,
    sessionType,
    insurance,
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

  // Helper to get translated topic name
  const getTopicLabel = (topicId: string): string => {
    const label = tTopics(topicId);
    if (label === topicId || label.includes(".")) {
      return topicId;
    }
    return label;
  };

  // Helper to get translated subtopic name
  const getSubTopicLabel = (subTopicId: string): string => {
    const label = tSubTopics(subTopicId);
    if (label === subTopicId || label.includes(".")) {
      return subTopicId;
    }
    return label;
  };

  // Helper to get gender label
  const getGenderLabel = (g: string): string => {
    const labels: Record<string, string> = {
      male: tFilters("male"),
      female: tFilters("female"),
      diverse: tFilters("diverse"),
    };
    return labels[g] || g;
  };

  // Helper to get session type label
  const getSessionTypeLabel = (st: string): string => {
    const labels: Record<string, string> = {
      online: tFilters("online"),
      in_person: tFilters("inPerson"),
      both: tFilters("both"),
    };
    return labels[st] || st;
  };

  // Helper to get insurance label
  const getInsuranceLabel = (ins: string): string => {
    const labels: Record<string, string> = {
      public: tFilters("publicInsurance"),
      private: tFilters("privateInsurance"),
      self_pay: tFilters("selfPay"),
    };
    return labels[ins] || ins;
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
                  {/* Topics */}
                  {selectedTopics.length > 0 && (
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

                  {/* SubTopics */}
                  {selectedSubTopics.length > 0 && (
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
