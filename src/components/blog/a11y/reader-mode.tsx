"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { BookOpen, X, Type, Minus, Plus, Moon, Sun, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================================
// Context
// ============================================================================

interface ReaderModeSettings {
  enabled: boolean;
  fontSize: "normal" | "large" | "x-large";
  lineHeight: "normal" | "relaxed" | "loose";
  fontFamily: "default" | "serif" | "dyslexic";
  theme: "auto" | "light" | "dark" | "sepia";
  width: "normal" | "narrow";
}

interface ReaderModeContextValue {
  settings: ReaderModeSettings;
  toggle: () => void;
  updateSetting: <K extends keyof ReaderModeSettings>(
    key: K,
    value: ReaderModeSettings[K]
  ) => void;
  reset: () => void;
}

const defaultSettings: ReaderModeSettings = {
  enabled: false,
  fontSize: "normal",
  lineHeight: "relaxed",
  fontFamily: "default",
  theme: "auto",
  width: "normal",
};

const ReaderModeContext = createContext<ReaderModeContextValue | null>(null);

export function useReaderMode() {
  const context = useContext(ReaderModeContext);
  if (!context) {
    throw new Error("useReaderMode must be used within a ReaderModeProvider");
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

interface ReaderModeProviderProps {
  children: ReactNode;
}

export function ReaderModeProvider({ children }: ReaderModeProviderProps) {
  const [settings, setSettings] = useState<ReaderModeSettings>(defaultSettings);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("reader-mode-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("reader-mode-settings", JSON.stringify(settings));
  }, [settings]);

  const toggle = useCallback(() => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const updateSetting = useCallback(
    <K extends keyof ReaderModeSettings>(
      key: K,
      value: ReaderModeSettings[K]
    ) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const reset = useCallback(() => {
    setSettings({ ...defaultSettings, enabled: true });
  }, []);

  return (
    <ReaderModeContext.Provider
      value={{ settings, toggle, updateSetting, reset }}
    >
      {children}
    </ReaderModeContext.Provider>
  );
}

// ============================================================================
// Toggle Button
// ============================================================================

interface ReaderModeToggleProps {
  className?: string;
}

export function ReaderModeToggle({ className }: ReaderModeToggleProps) {
  const t = useTranslations("blog.readerMode");
  const { settings, toggle } = useReaderMode();

  return (
    <Button
      variant={settings.enabled ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      className={cn(
        "gap-2 transition-all duration-300",
        settings.enabled && "bg-trust text-white hover:bg-trust/90",
        className
      )}
      aria-pressed={settings.enabled}
      aria-label={settings.enabled ? t("disable") : t("enable")}
    >
      <BookOpen className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{t("label")}</span>
    </Button>
  );
}

// ============================================================================
// Settings Panel (appears when reader mode is active)
// ============================================================================

interface ReaderModeSettingsProps {
  className?: string;
}

export function ReaderModeSettings({ className }: ReaderModeSettingsProps) {
  const t = useTranslations("blog.readerMode");
  const { settings, updateSetting, reset, toggle } = useReaderMode();

  if (!settings.enabled) return null;

  const fontSizes = ["normal", "large", "x-large"] as const;
  const lineHeights = ["normal", "relaxed", "loose"] as const;
  const themes = ["auto", "light", "dark", "sepia"] as const;

  return (
    <div
      className={cn(
        "fixed top-20 right-4 z-50 w-72",
        "rounded-2xl border bg-background/95 backdrop-blur-xl shadow-2xl",
        "animate-in slide-in-from-right-4 fade-in duration-300",
        className
      )}
      role="dialog"
      aria-label={t("settingsTitle")}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-trust" aria-hidden="true" />
          <span className="font-medium text-sm">{t("settingsTitle")}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggle}
          aria-label={t("close")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Settings */}
      <div className="p-4 space-y-5">
        {/* Font Size */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("fontSize")}
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                const idx = fontSizes.indexOf(settings.fontSize);
                if (idx > 0) updateSetting("fontSize", fontSizes[idx - 1]);
              }}
              disabled={settings.fontSize === "normal"}
              aria-label={t("decreaseFont")}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="flex-1 text-center">
              <Type
                className="h-5 w-5 mx-auto text-muted-foreground"
                style={{
                  transform: `scale(${settings.fontSize === "normal" ? 1 : settings.fontSize === "large" ? 1.15 : 1.3})`,
                }}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                const idx = fontSizes.indexOf(settings.fontSize);
                if (idx < fontSizes.length - 1)
                  updateSetting("fontSize", fontSizes[idx + 1]);
              }}
              disabled={settings.fontSize === "x-large"}
              aria-label={t("increaseFont")}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("lineHeight")}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {lineHeights.map((height) => (
              <button
                key={height}
                onClick={() => updateSetting("lineHeight", height)}
                className={cn(
                  "py-1.5 px-2 rounded-lg text-xs transition-all",
                  settings.lineHeight === height
                    ? "bg-trust text-white"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {t(`lineHeight_${height}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("fontFamily")}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => updateSetting("fontFamily", "default")}
              className={cn(
                "py-1.5 px-2 rounded-lg text-xs transition-all font-sans",
                settings.fontFamily === "default"
                  ? "bg-trust text-white"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              Sans
            </button>
            <button
              onClick={() => updateSetting("fontFamily", "serif")}
              className={cn(
                "py-1.5 px-2 rounded-lg text-xs transition-all font-serif",
                settings.fontFamily === "serif"
                  ? "bg-trust text-white"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              Serif
            </button>
            <button
              onClick={() => updateSetting("fontFamily", "dyslexic")}
              className={cn(
                "py-1.5 px-2 rounded-lg text-xs transition-all",
                settings.fontFamily === "dyslexic"
                  ? "bg-trust text-white"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
              title={t("dyslexicHint")}
            >
              {t("dyslexic")}
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("theme")}
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {themes.map((theme) => (
              <button
                key={theme}
                onClick={() => updateSetting("theme", theme)}
                className={cn(
                  "py-2 rounded-lg text-xs transition-all flex items-center justify-center",
                  settings.theme === theme
                    ? "ring-2 ring-trust ring-offset-2"
                    : "",
                  theme === "auto" && "bg-gradient-to-br from-gray-100 to-gray-800",
                  theme === "light" && "bg-white border",
                  theme === "dark" && "bg-gray-900",
                  theme === "sepia" && "bg-amber-50"
                )}
                aria-label={t(`theme_${theme}`)}
              >
                {theme === "auto" && <Sun className="h-3.5 w-3.5 text-gray-500" />}
                {theme === "light" && <Sun className="h-3.5 w-3.5 text-amber-500" />}
                {theme === "dark" && <Moon className="h-3.5 w-3.5 text-white" />}
                {theme === "sepia" && <BookOpen className="h-3.5 w-3.5 text-amber-700" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground"
          onClick={reset}
        >
          {t("reset")}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Content Wrapper (applies reader mode styles)
// ============================================================================

interface ReaderModeContentProps {
  children: ReactNode;
  className?: string;
}

export function ReaderModeContent({ children, className }: ReaderModeContentProps) {
  const { settings } = useReaderMode();

  const readerStyles = settings.enabled
    ? cn(
        // Font size
        settings.fontSize === "large" && "text-lg",
        settings.fontSize === "x-large" && "text-xl",
        // Line height
        settings.lineHeight === "relaxed" && "leading-relaxed",
        settings.lineHeight === "loose" && "leading-loose",
        // Font family
        settings.fontFamily === "serif" && "font-serif",
        settings.fontFamily === "dyslexic" && "font-[OpenDyslexic,sans-serif]",
        // Width
        settings.width === "narrow" && "max-w-2xl",
        // Theme backgrounds (applied via CSS variables in parent)
        "transition-all duration-300"
      )
    : "";

  // Apply theme class to document
  useEffect(() => {
    if (!settings.enabled) {
      document.documentElement.removeAttribute("data-reader-theme");
      return;
    }
    if (settings.theme !== "auto") {
      document.documentElement.setAttribute("data-reader-theme", settings.theme);
    } else {
      document.documentElement.removeAttribute("data-reader-theme");
    }
    return () => {
      document.documentElement.removeAttribute("data-reader-theme");
    };
  }, [settings.enabled, settings.theme]);

  return (
    <div className={cn(readerStyles, className)}>
      {children}
    </div>
  );
}
