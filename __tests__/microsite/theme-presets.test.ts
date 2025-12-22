import { describe, it, expect } from "vitest";
import {
  MICROSITE_THEME_PRESETS,
  getThemePreset,
  getAllThemePresets,
  createThemeFromPreset,
  mergeThemeColors,
  generateThemeCssVars,
  THEME_CSS_VARS,
  GOOGLE_FONTS,
} from "@/lib/microsite/theme-presets";
import { validateThemeContrast } from "@/lib/microsite/contrast-checker";
import type { MicrositeThemePreset, ThemeColors } from "@/types/microsite";

describe("Theme Presets", () => {
  describe("MICROSITE_THEME_PRESETS", () => {
    const presetNames: MicrositeThemePreset[] = [
      "calm",
      "clinical",
      "warm",
      "modern",
      "minimal",
    ];

    it("should have all 5 presets defined", () => {
      expect(Object.keys(MICROSITE_THEME_PRESETS)).toHaveLength(5);
      presetNames.forEach((name) => {
        expect(MICROSITE_THEME_PRESETS[name]).toBeDefined();
      });
    });

    it("should have valid colors for each preset", () => {
      presetNames.forEach((name) => {
        const preset = MICROSITE_THEME_PRESETS[name];
        expect(preset.colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(preset.colors.secondary).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(preset.colors.background).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(preset.colors.surface).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(preset.colors.text).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(preset.colors.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it("should have German labels", () => {
      presetNames.forEach((name) => {
        const preset = MICROSITE_THEME_PRESETS[name];
        expect(preset.labelDe).toBeDefined();
        expect(preset.labelDe.length).toBeGreaterThan(0);
      });
    });

    it("should have valid typography settings", () => {
      presetNames.forEach((name) => {
        const preset = MICROSITE_THEME_PRESETS[name];
        expect(preset.typography.headingFont).toBeDefined();
        expect(preset.typography.bodyFont).toBeDefined();
        expect(preset.typography.scale).toBe("md");
      });
    });

    it("should have valid effect settings", () => {
      presetNames.forEach((name) => {
        const preset = MICROSITE_THEME_PRESETS[name];
        expect(["gradient", "blur", "none"]).toContain(preset.effects.heroOverlay);
        expect(typeof preset.effects.textGlow).toBe("boolean");
      });
    });

    it("should have WCAG AA compliant color contrast", () => {
      presetNames.forEach((name) => {
        const preset = MICROSITE_THEME_PRESETS[name];
        const validation = validateThemeContrast(preset.colors);

        // Text on background must pass
        expect(validation.textOnBackground.isValid).toBe(true);
        // Text on surface must pass
        expect(validation.textOnSurface.isValid).toBe(true);
      });
    });
  });

  describe("getThemePreset", () => {
    it("should return correct preset by name", () => {
      const warm = getThemePreset("warm");
      expect(warm.name).toBe("warm");
      expect(warm.colors.primary).toBe("#8B7355");
    });

    it("should return different presets for different names", () => {
      const calm = getThemePreset("calm");
      const modern = getThemePreset("modern");
      expect(calm.colors.primary).not.toBe(modern.colors.primary);
    });
  });

  describe("getAllThemePresets", () => {
    it("should return array of all presets", () => {
      const presets = getAllThemePresets();
      expect(Array.isArray(presets)).toBe(true);
      expect(presets).toHaveLength(5);
    });

    it("should include all preset names", () => {
      const presets = getAllThemePresets();
      const names = presets.map((p) => p.name);
      expect(names).toContain("calm");
      expect(names).toContain("clinical");
      expect(names).toContain("warm");
      expect(names).toContain("modern");
      expect(names).toContain("minimal");
    });
  });

  describe("createThemeFromPreset", () => {
    it("should create full theme object from preset", () => {
      const theme = createThemeFromPreset("warm");

      expect(theme.preset).toBe("warm");
      expect(theme.colors).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.layout).toBeDefined();
      expect(theme.effects).toBeDefined();
    });

    it("should include default layout settings", () => {
      const theme = createThemeFromPreset("modern");

      expect(theme.layout.cornerRadius).toBe("lg");
      expect(theme.layout.cardStyle).toBe("glass");
      expect(theme.layout.sectionSpacing).toBe("normal");
    });

    it("should include effects from preset", () => {
      const theme = createThemeFromPreset("modern");
      expect(theme.effects.heroOverlay).toBe("blur");

      const warmTheme = createThemeFromPreset("warm");
      expect(warmTheme.effects.heroOverlay).toBe("gradient");
    });

    it("should create independent copies", () => {
      const theme1 = createThemeFromPreset("warm");
      const theme2 = createThemeFromPreset("warm");

      theme1.colors.primary = "#000000";
      expect(theme2.colors.primary).toBe("#8B7355");
    });
  });

  describe("mergeThemeColors", () => {
    it("should merge custom colors with preset", () => {
      const merged = mergeThemeColors("warm", {
        primary: "#FF0000",
      });

      expect(merged.primary).toBe("#FF0000");
      expect(merged.secondary).toBe("#F5F0EB"); // From warm preset
    });

    it("should override multiple colors", () => {
      const merged = mergeThemeColors("calm", {
        primary: "#111111",
        accent: "#222222",
      });

      expect(merged.primary).toBe("#111111");
      expect(merged.accent).toBe("#222222");
      expect(merged.background).toBe("#FAFCFD"); // From calm preset
    });

    it("should return all color properties", () => {
      const merged = mergeThemeColors("minimal", {});

      expect(merged.primary).toBeDefined();
      expect(merged.secondary).toBeDefined();
      expect(merged.background).toBeDefined();
      expect(merged.surface).toBeDefined();
      expect(merged.text).toBeDefined();
      expect(merged.accent).toBeDefined();
    });
  });

  describe("generateThemeCssVars", () => {
    it("should generate CSS variables from theme", () => {
      const theme = createThemeFromPreset("warm");
      const cssVars = generateThemeCssVars(theme);

      expect(cssVars["--ms-primary"]).toBe(theme.colors.primary);
      expect(cssVars["--ms-secondary"]).toBe(theme.colors.secondary);
      expect(cssVars["--ms-background"]).toBe(theme.colors.background);
      expect(cssVars["--ms-surface"]).toBe(theme.colors.surface);
      expect(cssVars["--ms-text"]).toBe(theme.colors.text);
      expect(cssVars["--ms-accent"]).toBe(theme.colors.accent);
    });

    it("should include typography CSS vars", () => {
      const theme = createThemeFromPreset("warm");
      const cssVars = generateThemeCssVars(theme);

      expect(cssVars["--ms-font-heading"]).toBe("Playfair Display");
      expect(cssVars["--ms-font-body"]).toBe("Lato");
    });

    it("should include layout CSS vars", () => {
      const theme = createThemeFromPreset("modern");
      const cssVars = generateThemeCssVars(theme);

      expect(cssVars["--ms-radius"]).toBeDefined();
      expect(cssVars["--ms-spacing"]).toBeDefined();
    });

    it("should map corner radius correctly", () => {
      const theme = createThemeFromPreset("warm");
      theme.layout.cornerRadius = "sm";
      const cssVars = generateThemeCssVars(theme);
      expect(cssVars["--ms-radius"]).toBe("0.375rem");

      theme.layout.cornerRadius = "xl";
      const cssVars2 = generateThemeCssVars(theme);
      expect(cssVars2["--ms-radius"]).toBe("1rem");
    });

    it("should map spacing correctly", () => {
      const theme = createThemeFromPreset("warm");

      theme.layout.sectionSpacing = "compact";
      expect(generateThemeCssVars(theme)["--ms-spacing"]).toBe("3rem");

      theme.layout.sectionSpacing = "spacious";
      expect(generateThemeCssVars(theme)["--ms-spacing"]).toBe("7rem");
    });
  });

  describe("THEME_CSS_VARS constant", () => {
    it("should have all color variable mappings", () => {
      expect(THEME_CSS_VARS.primary).toBe("--ms-primary");
      expect(THEME_CSS_VARS.secondary).toBe("--ms-secondary");
      expect(THEME_CSS_VARS.background).toBe("--ms-background");
      expect(THEME_CSS_VARS.surface).toBe("--ms-surface");
      expect(THEME_CSS_VARS.text).toBe("--ms-text");
      expect(THEME_CSS_VARS.accent).toBe("--ms-accent");
    });
  });

  describe("GOOGLE_FONTS constant", () => {
    it("should have 12 fonts defined", () => {
      expect(GOOGLE_FONTS).toHaveLength(12);
    });

    it("should have valid font objects", () => {
      GOOGLE_FONTS.forEach((font) => {
        expect(font.name).toBeDefined();
        expect(font.category).toMatch(/^(sans-serif|serif)$/);
        expect(Array.isArray(font.weight)).toBe(true);
        expect(font.weight.length).toBeGreaterThan(0);
      });
    });

    it("should include common fonts", () => {
      const fontNames = GOOGLE_FONTS.map((f) => f.name);
      expect(fontNames).toContain("Inter");
      expect(fontNames).toContain("Open Sans");
      expect(fontNames).toContain("Playfair Display");
    });

    it("should have both sans-serif and serif fonts", () => {
      const categories = GOOGLE_FONTS.map((f) => f.category);
      expect(categories).toContain("sans-serif");
      expect(categories).toContain("serif");
    });
  });

  describe("Preset Color Consistency", () => {
    it("warm preset should have warm colors", () => {
      const warm = MICROSITE_THEME_PRESETS.warm;
      // Primary should be brownish
      expect(warm.colors.primary).toBe("#8B7355");
      // Accent should be gold
      expect(warm.colors.accent).toBe("#D4A574");
    });

    it("clinical preset should have neutral colors", () => {
      const clinical = MICROSITE_THEME_PRESETS.clinical;
      // Primary should be gray
      expect(clinical.colors.primary).toBe("#4A5568");
    });

    it("modern preset should have blue accent", () => {
      const modern = MICROSITE_THEME_PRESETS.modern;
      expect(modern.colors.primary).toBe("#2563EB");
      expect(modern.colors.accent).toBe("#3B82F6");
    });

    it("minimal preset should have minimal color variation", () => {
      const minimal = MICROSITE_THEME_PRESETS.minimal;
      expect(minimal.colors.primary).toBe("#18181B");
      expect(minimal.colors.accent).toBe("#71717A");
    });
  });
});
