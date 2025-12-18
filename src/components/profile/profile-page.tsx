"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { TherapistProfileData } from "@/types/profile";
import { THEME_PRESETS } from "@/types/profile";
import { ProfileHero } from "./sections/profile-hero";
import { ProfileAbout } from "./sections/profile-about";
import { ProfileSpecializations } from "./sections/profile-specializations";
import { ProfileGallery } from "./sections/profile-gallery";
import { ProfileContact } from "./sections/profile-contact";
import { ProfileFooter } from "./sections/profile-footer";
import { ProfileNavigation } from "./sections/profile-navigation";
import { ProfileEditButton } from "./edit/profile-edit-button";

interface ProfilePageProps {
  profile: TherapistProfileData;
  locale: string;
}

export function ProfilePage({ profile, locale }: ProfilePageProps) {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState("about");

  // Check if the current user is the owner of this profile
  const isOwner = session?.user?.id === profile.userId;

  // Get theme colors
  const theme = THEME_PRESETS[profile.themeName] || THEME_PRESETS.warm;
  const customTheme = profile.themeColor ? { ...theme, primaryColor: profile.themeColor } : theme;

  // Generate CSS variables for the theme
  const themeStyles = {
    "--profile-primary": customTheme.primaryColor,
    "--profile-secondary": customTheme.secondaryColor,
    "--profile-accent": customTheme.accentColor,
    "--profile-bg": customTheme.backgroundColor,
    "--profile-text": customTheme.textColor,
    "--profile-gradient-from": customTheme.gradientFrom,
    "--profile-gradient-to": customTheme.gradientTo,
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen"
      style={{
        ...themeStyles,
        backgroundColor: "var(--profile-bg)",
        color: "var(--profile-text)",
      }}
    >
      {/* Floating Edit Button for Owner */}
      {isOwner && <ProfileEditButton profile={profile} />}

      {/* Navigation */}
      <ProfileNavigation
        profile={profile}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        locale={locale}
      />

      {/* Hero Section */}
      <ProfileHero profile={profile} locale={locale} />

      {/* About Section */}
      <section id="about">
        <ProfileAbout profile={profile} locale={locale} />
      </section>

      {/* Specializations Section */}
      <section id="specializations">
        <ProfileSpecializations profile={profile} locale={locale} />
      </section>

      {/* Gallery Section */}
      {(profile.galleryImages.length > 0 || profile.officeImages.length > 0) && (
        <section id="gallery">
          <ProfileGallery profile={profile} locale={locale} />
        </section>
      )}

      {/* Contact Section */}
      <section id="contact">
        <ProfileContact profile={profile} locale={locale} />
      </section>

      {/* Footer */}
      <ProfileFooter profile={profile} locale={locale} />
    </div>
  );
}
