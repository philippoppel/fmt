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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Info,
  Send,
  Shield,
  Loader2,
  CheckCircle2,
  Mail,
  Tag,
  MessageSquare,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitContactInquiry } from "@/lib/actions/contact-inquiry";
import type { IntensityLevel } from "@/types/therapist";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  therapistId: string;
  therapistName: string;
  matchScore?: number;
  selectedTopics?: string[];
  selectedSubTopics?: string[];
}

export function ContactDialog({
  open,
  onOpenChange,
  therapistId,
  therapistName,
  matchScore,
  selectedTopics = [],
  selectedSubTopics = [],
}: ContactDialogProps) {
  const t = useTranslations("matching.contact");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [intensityData, setIntensityData] = useState({
    enabled: false,
    level: null as IntensityLevel | null,
    description: "",
    consent: false,
  });

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
        selectedTopics,
        selectedSubTopics,
        matchScore,
        intensity:
          intensityData.enabled && intensityData.consent
            ? {
                level: intensityData.level,
                description: intensityData.description || undefined,
              }
            : undefined,
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
    // Reset form when closing
    if (submitted) {
      setFormData({ name: "", email: "", phone: "", message: "" });
      setIntensityData({ enabled: false, level: null, description: "", consent: false });
      setSubmitted(false);
    }
    onOpenChange(false);
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

          {/* Optional Intensity Section */}
          <Collapsible
            open={intensityData.enabled}
            onOpenChange={(open: boolean) =>
              setIntensityData({ ...intensityData, enabled: open })
            }
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between rounded-lg border bg-muted/50 p-4 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {t("intensityOptional")}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    intensityData.enabled && "rotate-180"
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-4 rounded-lg border p-4">
              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {t("intensityDisclaimer")}
                </p>
              </div>

              {/* Intensity Level Selection */}
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setIntensityData({ ...intensityData, level })
                    }
                    className={cn(
                      "rounded-lg border p-3 text-center transition-all",
                      intensityData.level === level
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                        : "hover:bg-muted hover:border-muted-foreground/20"
                    )}
                  >
                    <span className="text-sm font-medium">
                      {t(`levels.${level}`)}
                    </span>
                  </button>
                ))}
              </div>

              {/* Optional Description */}
              <div>
                <Label htmlFor="intensity-desc">
                  {t("intensityDescriptionOptional")}
                </Label>
                <Textarea
                  id="intensity-desc"
                  rows={2}
                  placeholder={t("intensityDescriptionPlaceholder")}
                  value={intensityData.description}
                  onChange={(e) =>
                    setIntensityData({
                      ...intensityData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* GDPR Consent */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="intensity-consent"
                  checked={intensityData.consent}
                  onCheckedChange={(checked) =>
                    setIntensityData({
                      ...intensityData,
                      consent: !!checked,
                    })
                  }
                />
                <Label
                  htmlFor="intensity-consent"
                  className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                >
                  {t("consentText")}
                </Label>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Data Preview */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="text-sm font-medium mb-3">{t("dataPreview")}</h4>
            <dl className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <dt className="text-muted-foreground">{t("previewEmail")}:</dt>
                <dd className="font-medium">{formData.email || "-"}</dd>
              </div>
              {selectedTopics.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  <dt className="text-muted-foreground">{t("previewTopics")}:</dt>
                  <dd className="font-medium">
                    {selectedTopics.length} {t("selected")}
                  </dd>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                <dt className="text-muted-foreground">{t("previewMessage")}:</dt>
                <dd className="font-medium">
                  {formData.message.length > 0 ? t("included") : "-"}
                </dd>
              </div>
              {intensityData.enabled && intensityData.consent && (
                <div className="flex items-center gap-2 text-primary">
                  <Activity className="h-3.5 w-3.5" />
                  <dt>{t("previewIntensity")}:</dt>
                  <dd className="font-medium">
                    {intensityData.level
                      ? t(`levels.${intensityData.level}`)
                      : "-"}
                  </dd>
                </div>
              )}
            </dl>
          </div>

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
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                (intensityData.enabled && !intensityData.consent)
              }
            >
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
