"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TierBadge } from "@/components/dashboard/tier-badge";
import { cn } from "@/lib/utils";
import {
  Crown,
  ExternalLink,
  Palette,
  Check,
  Loader2,
  Lock,
  Eye,
  Save,
  FileText,
  Target,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { THEME_PRESETS, type ThemeName } from "@/types/profile";
import type { TherapistProfileData } from "@/types/profile";
import type { AccountType } from "@/types/therapist";
import { SPECIALTIES } from "@/types/therapist";
import type { MicrositeConfig, Competency, MicrositeThemePreset } from "@/types/microsite";
import { DEFAULT_MICROSITE_CONFIG } from "@/types/microsite";
import { MICROSITE_THEME_PRESETS } from "@/lib/microsite/theme-presets";
import { getTierLimits, getAllowedPresets } from "@/lib/microsite/tier-limits";
import { CURATED_ICONS, ICON_CATEGORIES, searchIcons } from "@/lib/microsite/curated-icons";
import { saveMicrositeDraft, publishMicrosite, updateMicrositeProfileFields } from "@/lib/actions/microsite";
import { ProfilePage } from "@/components/profile/profile-page";
import { MicrositeHeroPicker } from "@/components/dashboard/customize/microsite-hero-picker";
import { SpecialtyIconPicker, DEFAULT_SPECIALTY_ICONS, type IconName } from "@/components/dashboard/profile/specialty-icon-picker";

interface CustomizeContentProps {
  hasAccess: boolean;
  accountType: AccountType;
  profile: TherapistProfileData;
  micrositeConfig: MicrositeConfig | null;
  slug?: string | null;
}

export function CustomizeContent({
  hasAccess,
  accountType,
  profile,
  micrositeConfig,
  slug,
}: CustomizeContentProps) {
  const t = useTranslations("dashboard.customize");
  const limits = getTierLimits(accountType);
  const allowedPresets = getAllowedPresets(accountType);

  // Initialize config
  const [config, setConfig] = useState<MicrositeConfig>(() => {
    if (micrositeConfig) return micrositeConfig;
    return {
      ...DEFAULT_MICROSITE_CONFIG,
      hero: {
        ...DEFAULT_MICROSITE_CONFIG.hero,
        brandText: profile.name,
        tagline: profile.headline || "",
      },
    };
  });

  const [activeTab, setActiveTab] = useState("content");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Profile-level fields (stored on TherapistProfile, not in micrositeDraft)
  const [heroCoverImageUrl, setHeroCoverImageUrl] = useState(profile.heroCoverImageUrl || "");
  const [specializationIcons, setSpecializationIcons] = useState<Record<string, string>>(
    profile.specializationIcons || {}
  );
  const [isProfileFieldsDirty, setIsProfileFieldsDirty] = useState(false);

  // Update config helper
  const updateConfig = useCallback((updates: Partial<MicrositeConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
    setSaveMessage(null);
  }, []);

  // Auto-save for mittel+ tiers
  useEffect(() => {
    if (!isDirty || !limits.hasAutoSave) return;

    const timeout = setTimeout(async () => {
      await handleSave();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [config, isDirty, limits.hasAutoSave]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Save microsite draft config
      const result = await saveMicrositeDraft(config);

      // Save profile-level fields if they changed
      if (isProfileFieldsDirty) {
        const profileResult = await updateMicrositeProfileFields({
          heroCoverImageUrl,
          specializationIcons,
        });
        if (!profileResult.success) {
          setSaveMessage({ type: "error", text: profileResult.error || "Fehler beim Speichern" });
          return;
        }
        setIsProfileFieldsDirty(false);
      }

      if (result.success) {
        setIsDirty(false);
        setSaveMessage({ type: "success", text: "Gespeichert!" });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: "error", text: result.error || "Fehler beim Speichern" });
      }
    } catch {
      setSaveMessage({ type: "error", text: "Fehler beim Speichern" });
    } finally {
      setIsSaving(false);
    }
  };

  // Update hero image
  const handleHeroImageChange = useCallback((url: string) => {
    setHeroCoverImageUrl(url);
    setIsProfileFieldsDirty(true);
    setIsDirty(true);
    setSaveMessage(null);
  }, []);

  // Update specialty icon
  const handleIconChange = useCallback((specialty: string, iconName: IconName) => {
    setSpecializationIcons(prev => {
      const newIcons = { ...prev };
      // Only store if different from default
      if (DEFAULT_SPECIALTY_ICONS[specialty] === iconName) {
        delete newIcons[specialty];
      } else {
        newIcons[specialty] = iconName;
      }
      return newIcons;
    });
    setIsProfileFieldsDirty(true);
    setIsDirty(true);
    setSaveMessage(null);
  }, []);

  // Get icon for a specialty
  const getIconForSpecialty = useCallback((specialty: string): IconName => {
    return (specializationIcons[specialty] as IconName) || DEFAULT_SPECIALTY_ICONS[specialty] || "Brain";
  }, [specializationIcons]);

  const handlePublish = async () => {
    if (isPublishing) return;
    if (isDirty) await handleSave();

    setIsPublishing(true);
    try {
      const result = await publishMicrosite();
      if (result.success) {
        setSaveMessage({ type: "success", text: "Veröffentlicht!" });
      } else {
        setSaveMessage({ type: "error", text: result.error || "Fehler" });
      }
    } catch {
      setSaveMessage({ type: "error", text: "Fehler beim Veröffentlichen" });
    } finally {
      setIsPublishing(false);
    }
  };

  // Show upgrade prompt for users without access
  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <TierBadge tier={accountType} />
          </div>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4 py-8">
              <div className="p-4 rounded-full bg-amber-100">
                <Lock className="h-8 w-8 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t("locked.title")}</h3>
                <p className="text-muted-foreground max-w-md">
                  {t("locked.description")}
                </p>
              </div>
              <Link href="/dashboard/billing">
                <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  <Crown className="h-4 w-4" />
                  {t("locked.upgrade")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t("title")}</h1>
              <TierBadge tier={accountType} />
            </div>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preview Button - Opens Sheet on Mobile */}
          <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                Vorschau
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] p-0">
              <SheetHeader className="px-4 py-3 border-b">
                <SheetTitle>Vorschau deiner Microsite</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto h-[calc(85vh-60px)]">
                <ProfilePage
                  profile={profile}
                  locale="de"
                  micrositeConfig={config}
                  isPreviewMode={true}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* External Link */}
          {slug && (
            <Button variant="outline" size="sm" asChild className="gap-2">
              <a href={`/p/${slug}`} target="_blank" rel="noopener">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Live ansehen</span>
              </a>
            </Button>
          )}

          {/* Save Button (for gratis tier) */}
          {!limits.hasAutoSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Speichern
            </Button>
          )}

          {/* Publish Button */}
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={isPublishing}
            className="gap-2"
          >
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Veröffentlichen
          </Button>

          {/* Status Indicator */}
          {saveMessage && (
            <span className={cn(
              "text-sm",
              saveMessage.type === "success" ? "text-green-600" : "text-destructive"
            )}>
              {saveMessage.text}
            </span>
          )}
          {isDirty && !saveMessage && limits.hasAutoSave && (
            <span className="text-sm text-muted-foreground">Ungespeichert...</span>
          )}
        </div>
      </div>

      {/* Main Content - Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="content" className="gap-2">
            <FileText className="h-4 w-4" />
            <span>Inhalte</span>
          </TabsTrigger>
          <TabsTrigger value="competencies" className="gap-2">
            <Target className="h-4 w-4" />
            <span>Kompetenzen</span>
          </TabsTrigger>
          <TabsTrigger value="design" className="gap-2">
            <Palette className="h-4 w-4" />
            <span>Design</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Hero-Bereich</CardTitle>
              <CardDescription>Der erste Eindruck deiner Besucher</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brandText">Name / Praxisname</Label>
                <Input
                  id="brandText"
                  value={config.hero.brandText || ""}
                  onChange={(e) => updateConfig({
                    hero: { ...config.hero, brandText: e.target.value }
                  })}
                  placeholder="Dr. Max Mustermann"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline / Slogan</Label>
                <Textarea
                  id="tagline"
                  value={config.hero.tagline || ""}
                  onChange={(e) => updateConfig({
                    hero: { ...config.hero, tagline: e.target.value }
                  })}
                  placeholder="Ihre einfühlsame Begleitung auf dem Weg zu mehr Lebensfreude"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="ctaPrimary">Haupt-Button Text</Label>
                </div>
                <Input
                  id="ctaPrimary"
                  value={config.hero.ctaPrimary?.text || ""}
                  onChange={(e) => updateConfig({
                    hero: {
                      ...config.hero,
                      ctaPrimary: {
                        text: e.target.value,
                        link: config.hero.ctaPrimary?.link || "#contact",
                        style: config.hero.ctaPrimary?.style || "primary"
                      }
                    }
                  })}
                  placeholder="Termin anfragen"
                />
              </div>
            </CardContent>
          </Card>

          {/* Hero Background Image */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Hero-Hintergrundbild</CardTitle>
              <CardDescription>
                Wähle ein Bild aus Unsplash oder lade ein eigenes hoch (empfohlen: 1920x640px)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MicrositeHeroPicker
                value={heroCoverImageUrl}
                onImageChange={handleHeroImageChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competencies Tab */}
        <TabsContent value="competencies" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Kompetenzen</CardTitle>
                  <CardDescription>
                    {config.competencies.length}
                    {limits.maxCompetencies !== Infinity && ` / ${limits.maxCompetencies}`} Einträge
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (limits.maxCompetencies !== Infinity && config.competencies.length >= limits.maxCompetencies) {
                      setSaveMessage({ type: "error", text: `Maximum ${limits.maxCompetencies} Kompetenzen für dein Abo` });
                      return;
                    }
                    const newComp: Competency = {
                      id: `comp_${Date.now()}`,
                      title: "",
                      description: "",
                      icon: "Sparkles",
                      order: config.competencies.length,
                      visible: true,
                    };
                    updateConfig({ competencies: [...config.competencies, newComp] });
                  }}
                  disabled={limits.maxCompetencies !== Infinity && config.competencies.length >= limits.maxCompetencies}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.competencies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Noch keine Kompetenzen. Füge deine Schwerpunkte hinzu.
                </p>
              ) : (
                config.competencies
                  .sort((a, b) => a.order - b.order)
                  .map((comp, index) => (
                    <CompetencyItem
                      key={comp.id}
                      competency={comp}
                      index={index}
                      total={config.competencies.length}
                      onUpdate={(updates) => {
                        updateConfig({
                          competencies: config.competencies.map((c) =>
                            c.id === comp.id ? { ...c, ...updates } : c
                          ),
                        });
                      }}
                      onDelete={() => {
                        updateConfig({
                          competencies: config.competencies
                            .filter((c) => c.id !== comp.id)
                            .map((c, i) => ({ ...c, order: i })),
                        });
                      }}
                      onMove={(direction) => {
                        const newIndex = direction === "up" ? index - 1 : index + 1;
                        const newComps = [...config.competencies];
                        const [removed] = newComps.splice(index, 1);
                        newComps.splice(newIndex, 0, removed);
                        updateConfig({
                          competencies: newComps.map((c, i) => ({ ...c, order: i })),
                        });
                      }}
                    />
                  ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Farbschema</CardTitle>
              <CardDescription>Wähle ein Farbschema für deine Microsite</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(MICROSITE_THEME_PRESETS).map(([key, preset]) => {
                  const isAllowed = allowedPresets.includes(key);
                  const isSelected = config.theme.preset === key;

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        if (!isAllowed) {
                          setSaveMessage({ type: "error", text: "Upgrade für dieses Theme" });
                          return;
                        }
                        updateConfig({
                          theme: {
                            ...config.theme,
                            preset: key as MicrositeThemePreset,
                            colors: { ...preset.colors },
                          },
                        });
                      }}
                      className={cn(
                        "relative p-3 rounded-lg border-2 transition-all text-left",
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-muted hover:border-muted-foreground/30",
                        !isAllowed && "opacity-50"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 p-1 rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      {!isAllowed && (
                        <div className="absolute -top-2 -right-2 p-1 rounded-full bg-amber-100">
                          <Crown className="h-3 w-3 text-amber-600" />
                        </div>
                      )}
                      <div
                        className="w-full h-10 rounded-md mb-2"
                        style={{
                          background: `linear-gradient(135deg, ${preset.colors.primary} 0%, ${preset.colors.accent} 100%)`,
                        }}
                      />
                      <p className="text-xs font-medium truncate">{preset.labelDe}</p>
                    </button>
                  );
                })}
              </div>

              {/* Custom Color (Premium) */}
              {limits.canCustomizeColors && (
                <div className="mt-6 pt-4 border-t space-y-3">
                  <div className="flex items-center gap-2">
                    <Label>Eigene Primärfarbe</Label>
                    <TierBadge tier="premium" size="sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.theme.colors.primary}
                      onChange={(e) => updateConfig({
                        theme: {
                          ...config.theme,
                          colors: { ...config.theme.colors, primary: e.target.value },
                        },
                      })}
                      className="h-10 w-14 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={config.theme.colors.primary}
                      onChange={(e) => updateConfig({
                        theme: {
                          ...config.theme,
                          colors: { ...config.theme.colors, primary: e.target.value },
                        },
                      })}
                      className="max-w-32 font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specialty Icons */}
          {profile.specializations && profile.specializations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Schwerpunkt-Icons</CardTitle>
                <CardDescription>
                  Passe die Icons für deine Fachgebiete an (werden auf deiner Microsite angezeigt)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.specializations.map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30"
                    >
                      <SpecialtyIconPicker
                        specialty={specialty}
                        selectedIcon={getIconForSpecialty(specialty)}
                        onIconChange={(icon) => handleIconChange(specialty, icon)}
                      />
                      <span className="text-sm font-medium">
                        {t(`specializations.${specialty}`, { defaultValue: specialty })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Competency Item Component
interface CompetencyItemProps {
  competency: Competency;
  index: number;
  total: number;
  onUpdate: (updates: Partial<Competency>) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
}

function CompetencyItem({ competency, index, total, onUpdate, onDelete, onMove }: CompetencyItemProps) {
  const [isExpanded, setIsExpanded] = useState(!competency.title);
  const [iconSearch, setIconSearch] = useState("");

  const IconComponent = competency.icon
    ? (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[competency.icon]
    : Sparkles;

  const filteredIcons = iconSearch ? searchIcons(iconSearch) : CURATED_ICONS.slice(0, 24);

  if (!isExpanded) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onMove("up")}
            disabled={index === 0}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onMove("down")}
            disabled={index === total - 1}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          {IconComponent && <IconComponent className="h-5 w-5 text-primary" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{competency.title || "Neue Kompetenz"}</p>
          {competency.description && (
            <p className="text-sm text-muted-foreground truncate">{competency.description}</p>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(true)}>
          Bearbeiten
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
      <div className="space-y-2">
        <Label>Titel</Label>
        <Input
          value={competency.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="z.B. Depression & Burnout"
        />
      </div>

      <div className="space-y-2">
        <Label>Beschreibung (optional)</Label>
        <Textarea
          value={competency.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Kurze Beschreibung..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <Input
          value={iconSearch}
          onChange={(e) => setIconSearch(e.target.value)}
          placeholder="Icon suchen..."
          className="mb-2"
        />
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
          {filteredIcons.map((iconDef) => {
            const IconComp = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconDef.name];
            if (!IconComp) return null;
            return (
              <button
                key={iconDef.name}
                onClick={() => onUpdate({ icon: iconDef.name })}
                className={cn(
                  "w-9 h-9 rounded-md flex items-center justify-center transition-colors",
                  competency.icon === iconDef.name
                    ? "bg-primary text-white"
                    : "hover:bg-muted"
                )}
              >
                <IconComp className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={() => setIsExpanded(false)}>
          Fertig
        </Button>
      </div>
    </div>
  );
}
