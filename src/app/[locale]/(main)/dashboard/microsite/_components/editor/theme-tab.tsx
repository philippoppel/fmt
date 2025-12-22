"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Check } from "lucide-react";
import type { MicrositeTheme, MicrositeThemePreset } from "@/types/microsite";
import type { AccountType } from "@/types/therapist";
import { getTierLimits, getAllowedPresets, getAllowedFonts } from "@/lib/microsite/tier-limits";
import { MICROSITE_THEME_PRESETS, createThemeFromPreset, GOOGLE_FONTS } from "@/lib/microsite/theme-presets";
import { validateContrast, getContrastRatio } from "@/lib/microsite/contrast-checker";
import { cn } from "@/lib/utils";

interface ThemeTabProps {
  theme: MicrositeTheme;
  accountType: AccountType;
  onUpdate: (theme: MicrositeTheme) => void;
}

export function ThemeTab({ theme, accountType, onUpdate }: ThemeTabProps) {
  const limits = getTierLimits(accountType);
  const allowedPresets = getAllowedPresets(accountType);
  const allowedFonts = getAllowedFonts(accountType);

  const handlePresetChange = (presetName: MicrositeThemePreset) => {
    const newTheme = createThemeFromPreset(presetName);
    // Keep current layout settings
    onUpdate({
      ...newTheme,
      layout: theme.layout,
    });
  };

  const updateColors = (updates: Partial<MicrositeTheme["colors"]>) => {
    onUpdate({
      ...theme,
      colors: { ...theme.colors, ...updates },
    });
  };

  const updateTypography = (updates: Partial<MicrositeTheme["typography"]>) => {
    onUpdate({
      ...theme,
      typography: { ...theme.typography, ...updates },
    });
  };

  const updateLayout = (updates: Partial<MicrositeTheme["layout"]>) => {
    onUpdate({
      ...theme,
      layout: { ...theme.layout, ...updates },
    });
  };

  // Check contrast for current colors
  const textContrast = getContrastRatio(theme.colors.text, theme.colors.background);
  const hasGoodContrast = textContrast >= 4.5;

  return (
    <div className="space-y-6">
      {/* Theme Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Farbschema</CardTitle>
          <CardDescription>
            Wählen Sie ein vordefiniertes Farbschema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(MICROSITE_THEME_PRESETS).map((preset) => {
              const isAllowed = allowedPresets.includes(preset.name);
              const isActive = theme.preset === preset.name;

              return (
                <button
                  key={preset.name}
                  onClick={() => isAllowed && handlePresetChange(preset.name)}
                  disabled={!isAllowed}
                  className={cn(
                    "relative p-4 rounded-lg border-2 text-left transition-all",
                    isActive
                      ? "border-primary ring-2 ring-primary/20"
                      : isAllowed
                      ? "border-transparent hover:border-muted-foreground/30"
                      : "opacity-50 cursor-not-allowed",
                    "bg-card"
                  )}
                >
                  {/* Color Preview */}
                  <div className="flex gap-1 mb-2">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: preset.colors.secondary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: preset.colors.accent }}
                    />
                  </div>

                  <div className="font-medium text-sm">{preset.labelDe}</div>

                  {!isAllowed && (
                    <Lock className="absolute top-2 right-2 h-4 w-4 text-muted-foreground" />
                  )}

                  {isActive && (
                    <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Colors (if allowed) */}
      {limits.canCustomizeColors && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Individuelle Farben</CardTitle>
            <CardDescription>
              Passen Sie die Farben nach Ihren Wünschen an
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary">Primärfarbe</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.colors.primary}
                    onChange={(e) => updateColors({ primary: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    id="primary"
                    value={theme.colors.primary}
                    onChange={(e) => updateColors({ primary: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent">Akzentfarbe</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.colors.accent}
                    onChange={(e) => updateColors({ accent: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    id="accent"
                    value={theme.colors.accent}
                    onChange={(e) => updateColors({ accent: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background">Hintergrund</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.colors.background}
                    onChange={(e) => updateColors({ background: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    id="background"
                    value={theme.colors.background}
                    onChange={(e) => updateColors({ background: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">Textfarbe</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.colors.text}
                    onChange={(e) => updateColors({ text: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    id="text"
                    value={theme.colors.text}
                    onChange={(e) => updateColors({ text: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Contrast Warning */}
            <div
              className={cn(
                "p-3 rounded-md text-sm",
                hasGoodContrast
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700"
              )}
            >
              Kontrastverhältnis: {textContrast.toFixed(1)}:1
              {hasGoodContrast
                ? " - Gute Lesbarkeit"
                : " - Kontrast zu gering für optimale Lesbarkeit"}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Typografie</CardTitle>
          <CardDescription>
            Wählen Sie die Schriftarten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Überschriften</Label>
            <div className="grid grid-cols-2 gap-2">
              {GOOGLE_FONTS.filter((f) => allowedFonts.includes(f.name)).map((font) => (
                <button
                  key={font.name}
                  onClick={() => updateTypography({ headingFont: font.name })}
                  className={cn(
                    "p-3 rounded-md border text-left transition-all",
                    theme.typography.headingFont === font.name
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted"
                  )}
                >
                  <span
                    className="text-lg font-semibold"
                    style={{ fontFamily: font.name }}
                  >
                    {font.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {font.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fließtext</Label>
            <div className="grid grid-cols-2 gap-2">
              {GOOGLE_FONTS.filter(
                (f) => allowedFonts.includes(f.name) && f.category === "sans-serif"
              ).map((font) => (
                <button
                  key={font.name}
                  onClick={() => updateTypography({ bodyFont: font.name })}
                  className={cn(
                    "p-3 rounded-md border text-left transition-all",
                    theme.typography.bodyFont === font.name
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted"
                  )}
                >
                  <span style={{ fontFamily: font.name }}>{font.name}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Layout</CardTitle>
          <CardDescription>
            Anpassungen am Erscheinungsbild
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Corner Radius */}
          <div className="space-y-2">
            <Label>Eckenradius</Label>
            <div className="flex gap-2">
              {(["sm", "md", "lg", "xl"] as const).map((radius) => (
                <Button
                  key={radius}
                  variant={theme.layout.cornerRadius === radius ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateLayout({ cornerRadius: radius })}
                >
                  {radius.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Card Style */}
          <div className="space-y-2">
            <Label>Kartenstil</Label>
            <div className="flex gap-2">
              {(["glass", "solid", "outline"] as const).map((style) => (
                <Button
                  key={style}
                  variant={theme.layout.cardStyle === style ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateLayout({ cardStyle: style })}
                >
                  {style === "glass" ? "Glas" : style === "solid" ? "Solide" : "Umrandet"}
                </Button>
              ))}
            </div>
          </div>

          {/* Section Spacing */}
          <div className="space-y-2">
            <Label>Abstand</Label>
            <div className="flex gap-2">
              {(["compact", "normal", "spacious"] as const).map((spacing) => (
                <Button
                  key={spacing}
                  variant={theme.layout.sectionSpacing === spacing ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateLayout({ sectionSpacing: spacing })}
                >
                  {spacing === "compact" ? "Kompakt" : spacing === "normal" ? "Normal" : "Großzügig"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
