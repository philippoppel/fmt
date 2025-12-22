"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import type { TherapistProfileData } from "@/types/profile";
import { THEME_PRESETS } from "@/types/profile";
import type { MicrositeConfig, SectionId } from "@/types/microsite";
import { ProfileHero } from "./sections/profile-hero";
import { ProfileAbout } from "./sections/profile-about";
import { ProfileSpecializations } from "./sections/profile-specializations";
import { ProfileGallery } from "./sections/profile-gallery";
import { ProfileContact } from "./sections/profile-contact";
import { ProfileFooter } from "./sections/profile-footer";
import { ProfileNavigation } from "./sections/profile-navigation";
import { ProfileCompetencies } from "./sections/profile-competencies";
import { ProfileOfferings } from "./sections/profile-offerings";
import { ProfileEditButton } from "./edit/profile-edit-button";

interface ProfilePageProps {
  profile: TherapistProfileData;
  locale: string;
  /** Microsite configuration (from draft or published) */
  micrositeConfig?: MicrositeConfig | null;
  /** Preview mode hides edit button and navigation */
  isPreviewMode?: boolean;
}

export function ProfilePage({
  profile,
  locale,
  micrositeConfig,
  isPreviewMode = false,
}: ProfilePageProps) {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState("about");

  // Check if the current user is the owner of this profile
  const isOwner = session?.user?.id === profile.userId;

  // Get theme - prefer microsite config, fallback to profile theme
  const themeStyles = useMemo(() => {
    if (micrositeConfig?.theme) {
      const msTheme = micrositeConfig.theme;
      return {
        "--profile-primary": msTheme.colors.primary,
        "--profile-secondary": msTheme.colors.secondary,
        "--profile-accent": msTheme.colors.accent,
        "--profile-bg": msTheme.colors.background,
        "--profile-text": msTheme.colors.text,
        "--profile-surface": msTheme.colors.surface,
        "--profile-gradient-from": msTheme.colors.primary,
        "--profile-gradient-to": msTheme.colors.accent,
      } as React.CSSProperties;
    }

    // Fallback to old theme system
    const theme = THEME_PRESETS[profile.themeName] || THEME_PRESETS.warm;
    const customTheme = profile.themeColor
      ? { ...theme, primaryColor: profile.themeColor }
      : theme;

    return {
      "--profile-primary": customTheme.primaryColor,
      "--profile-secondary": customTheme.secondaryColor,
      "--profile-accent": customTheme.accentColor,
      "--profile-bg": customTheme.backgroundColor,
      "--profile-text": customTheme.textColor,
      "--profile-gradient-from": customTheme.gradientFrom,
      "--profile-gradient-to": customTheme.gradientTo,
    } as React.CSSProperties;
  }, [micrositeConfig, profile.themeName, profile.themeColor]);

  // Determine visible sections
  const sectionOrder = micrositeConfig?.sectionOrder || [
    "hero",
    "about",
    "competencies",
    "offerings",
    "contact",
    "footer",
  ];
  const hiddenSections = new Set(micrositeConfig?.hiddenSections || []);

  const isSectionVisible = (sectionId: SectionId) =>
    !hiddenSections.has(sectionId);

  // Competencies and offerings from microsite config
  const competencies = micrositeConfig?.competencies || [];
  const offerings = micrositeConfig?.offerings || [];
  const showPricing = micrositeConfig?.offerings ? true : true; // Can be configured

  // Render sections in order
  const renderSection = (sectionId: SectionId) => {
    if (!isSectionVisible(sectionId)) return null;

    switch (sectionId) {
      case "hero":
        return (
          <ProfileHero
            key="hero"
            profile={profile}
            locale={locale}
          />
        );
      case "about":
        return (
          <section key="about" id="about">
            <ProfileAbout profile={profile} locale={locale} />
          </section>
        );
      case "competencies":
        return competencies.length > 0 ? (
          <section key="competencies" id="competencies">
            <ProfileCompetencies competencies={competencies} locale={locale} />
          </section>
        ) : (
          // Fall back to specializations if no competencies defined
          <section key="specializations" id="specializations">
            <ProfileSpecializations profile={profile} locale={locale} />
          </section>
        );
      case "offerings":
        return offerings.length > 0 ? (
          <section key="offerings" id="offerings">
            <ProfileOfferings
              offerings={offerings}
              showPricing={showPricing}
              locale={locale}
            />
          </section>
        ) : null;
      case "contact":
        return (
          <section key="contact" id="contact">
            <ProfileContact profile={profile} locale={locale} />
          </section>
        );
      case "footer":
        return (
          <ProfileFooter key="footer" profile={profile} locale={locale} />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        ...themeStyles,
        backgroundColor: "var(--profile-bg)",
        color: "var(--profile-text)",
      }}
    >
      {/* Floating Edit Button for Owner (hidden in preview mode) */}
      {isOwner && !isPreviewMode && <ProfileEditButton profile={profile} />}

      {/* Navigation (hidden in preview mode) */}
      {!isPreviewMode && (
        <ProfileNavigation
          profile={profile}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          locale={locale}
        />
      )}

      {/* Render sections in configured order */}
      {sectionOrder.map((sectionId) => renderSection(sectionId))}

      {/* Gallery Section - always shown if has images, not in section order */}
      {(profile.galleryImages.length > 0 || profile.officeImages.length > 0) &&
        !hiddenSections.has("gallery" as SectionId) && (
          <section id="gallery">
            <ProfileGallery profile={profile} locale={locale} />
          </section>
        )}
    </div>
  );
}
