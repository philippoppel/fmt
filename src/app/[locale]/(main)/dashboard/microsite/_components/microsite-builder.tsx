"use client";

import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Save,
  Upload,
  Palette,
  Layout,
  FileText,
  Target,
  Package,
  Mail,
} from "lucide-react";
import type { TherapistProfileData } from "@/types/profile";
import type { MicrositeConfig, MicrositeStatus } from "@/types/microsite";
import type { AccountType } from "@/types/therapist";
import { DEFAULT_MICROSITE_CONFIG } from "@/types/microsite";
import { ProfilePage } from "@/components/profile/profile-page";
import { saveMicrositeDraft, publishMicrosite } from "@/lib/actions/microsite";
import { ContentTab } from "./editor/content-tab";
import { CompetenciesTab } from "./editor/competencies-tab";
import { ThemeTab } from "./editor/theme-tab";
import { cn } from "@/lib/utils";

interface MicrositeBuilderProps {
  initialData: {
    profile: TherapistProfileData;
    microsite: {
      draft: unknown;
      published: unknown;
      status: MicrositeStatus;
      lastSavedAt: Date | null;
      publishedAt: Date | null;
    };
    accountType: AccountType;
  };
}

type ViewportSize = "desktop" | "tablet" | "mobile";

export function MicrositeBuilder({ initialData }: MicrositeBuilderProps) {
  const { profile, microsite, accountType } = initialData;

  // Initialize config from draft or defaults
  const [config, setConfig] = useState<MicrositeConfig>(() => {
    if (microsite.draft) {
      return microsite.draft as MicrositeConfig;
    }
    // Initialize with profile data
    return {
      ...DEFAULT_MICROSITE_CONFIG,
      hero: {
        ...DEFAULT_MICROSITE_CONFIG.hero,
        brandText: profile.name,
        tagline: profile.headline || "",
        coverImageUrl: profile.officeImages[0] || profile.galleryImages[0] || null,
        locationBadges: profile.city ? [profile.city] : [],
      },
    };
  });

  const [activeTab, setActiveTab] = useState("content");
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(microsite.lastSavedAt);
  const [isDirty, setIsDirty] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Mark as dirty when config changes
  const updateConfig = useCallback((updates: Partial<MicrositeConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
    setSaveError(null);
  }, []);

  // Auto-save for mittel and premium tiers
  useEffect(() => {
    if (!isDirty || accountType === "gratis") return;

    const timeout = setTimeout(async () => {
      await handleSave();
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeout);
  }, [config, isDirty, accountType]);

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await saveMicrositeDraft(config);
      if (result.success) {
        setLastSaved(result.data?.savedAt || new Date());
        setIsDirty(false);
      } else {
        setSaveError(result.error || "Fehler beim Speichern");
      }
    } catch {
      setSaveError("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (isPublishing) return;

    // Save first if dirty
    if (isDirty) {
      await handleSave();
    }

    setIsPublishing(true);

    try {
      const result = await publishMicrosite();
      if (result.success) {
        // Could show success toast
      } else {
        setSaveError(result.error || "Fehler beim Veröffentlichen");
      }
    } catch {
      setSaveError("Fehler beim Veröffentlichen");
    } finally {
      setIsPublishing(false);
    }
  };

  // Viewport sizes for preview
  const viewportWidths: Record<ViewportSize, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Microsite Builder</h1>
          {/* Save Status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                Speichern...
              </span>
            ) : isDirty ? (
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 bg-amber-500 rounded-full" />
                Ungespeichert
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                Gespeichert {formatRelativeTime(lastSaved)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewport === "desktop" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewport("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={viewport === "tablet" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewport("tablet")}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={viewport === "mobile" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewport("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview Button */}
          {profile.slug && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/p/${profile.slug}`} target="_blank" rel="noopener">
                <Eye className="h-4 w-4 mr-2" />
                Vorschau
              </a>
            </Button>
          )}

          {/* Save Button (for gratis tier without auto-save) */}
          {accountType === "gratis" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
            >
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          )}

          {/* Publish Button */}
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={isPublishing || (isDirty && isSaving)}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isPublishing ? "Veröffentlichen..." : "Veröffentlichen"}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {saveError && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 text-sm">
          {saveError}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-[480px] border-r bg-muted/30 flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1"
          >
            <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 bg-transparent">
              <TabsTrigger
                value="content"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3"
              >
                <FileText className="h-4 w-4 mr-2" />
                Inhalte
              </TabsTrigger>
              <TabsTrigger
                value="competencies"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3"
              >
                <Target className="h-4 w-4 mr-2" />
                Kompetenzen
              </TabsTrigger>
              <TabsTrigger
                value="offerings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3"
              >
                <Package className="h-4 w-4 mr-2" />
                Angebote
              </TabsTrigger>
              <TabsTrigger
                value="theme"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3"
              >
                <Palette className="h-4 w-4 mr-2" />
                Design
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="content" className="m-0 p-4">
                <ContentTab
                  config={config}
                  profile={profile}
                  accountType={accountType}
                  onUpdate={updateConfig}
                />
              </TabsContent>

              <TabsContent value="competencies" className="m-0 p-4">
                <CompetenciesTab
                  competencies={config.competencies}
                  accountType={accountType}
                  onUpdate={(competencies) => updateConfig({ competencies })}
                />
              </TabsContent>

              <TabsContent value="offerings" className="m-0 p-4">
                <div className="text-sm text-muted-foreground">
                  Angebote-Editor kommt bald...
                </div>
              </TabsContent>

              <TabsContent value="theme" className="m-0 p-4">
                <ThemeTab
                  theme={config.theme}
                  accountType={accountType}
                  onUpdate={(theme) => updateConfig({ theme })}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-muted/50 overflow-hidden flex items-start justify-center p-4">
          <div
            className={cn(
              "bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300",
              "max-h-full overflow-y-auto"
            )}
            style={{
              width: viewportWidths[viewport],
              maxWidth: "100%",
            }}
          >
            <ProfilePage
              profile={profile}
              locale="de"
              micrositeConfig={config}
              isPreviewMode={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  if (hours < 24) return `vor ${hours} Std.`;
  return new Date(date).toLocaleDateString("de-DE");
}
