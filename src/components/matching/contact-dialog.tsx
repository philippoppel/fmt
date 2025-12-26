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
import { Send, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { submitContactInquiry } from "@/lib/actions/contact-inquiry";

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
  const tTopics = useTranslations("matching.topics");
  const tSubTopics = useTranslations("matching.subTopics");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
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
    // Try matching.topics first (e.g., "trauma" -> "Trauma & PTBS")
    const label = tTopics(topicId);
    // If translation returns the key itself, it wasn't found
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

  const hasMatchingContext = selectedTopics.length > 0 || selectedSubTopics.length > 0;

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
          {/* Matching Context - Show selected topics from wizard */}
          {hasMatchingContext && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
                <Sparkles className="h-4 w-4" />
                {t("matchingContext")}
              </div>

              {/* Selected Topics */}
              {selectedTopics.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground mb-1.5">{t("selectedTopics")}:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTopics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {getTopicLabel(topic)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected SubTopics */}
              {selectedSubTopics.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">{t("selectedSubTopics")}:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSubTopics.map((subTopic) => (
                      <Badge key={subTopic} variant="outline" className="text-xs">
                        {getSubTopicLabel(subTopic)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-primary/10">
                {t("matchingContextHint")}
              </p>
            </div>
          )}

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
