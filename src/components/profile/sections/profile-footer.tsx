"use client";

import { Heart, Shield, ExternalLink } from "lucide-react";
import type { TherapistProfileData } from "@/types/profile";
import Link from "next/link";

interface ProfileFooterProps {
  profile: TherapistProfileData;
  locale: string;
}

export function ProfileFooter({ profile, locale }: ProfileFooterProps) {
  const currentYear = new Date().getFullYear();

  const t = {
    de: {
      allRightsReserved: "Alle Rechte vorbehalten",
      poweredBy: "Präsentiert von",
      platformName: "FindMyTherapy",
      backToSearch: "Zur Therapeutensuche",
      privacyPolicy: "Datenschutz",
      imprint: "Impressum",
      verifiedProfile: "Verifiziertes Profil",
    },
    en: {
      allRightsReserved: "All rights reserved",
      poweredBy: "Powered by",
      platformName: "FindMyTherapy",
      backToSearch: "Back to Search",
      privacyPolicy: "Privacy Policy",
      imprint: "Imprint",
      verifiedProfile: "Verified Profile",
    },
  }[locale] || {
    de: {
      allRightsReserved: "Alle Rechte vorbehalten",
      poweredBy: "Präsentiert von",
      platformName: "FindMyTherapy",
      backToSearch: "Zur Therapeutensuche",
      privacyPolicy: "Datenschutz",
      imprint: "Impressum",
      verifiedProfile: "Verifiziertes Profil",
    },
  };

  return (
    <footer
      className="py-8"
      style={{ backgroundColor: "var(--profile-secondary)" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left - Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600">
              © {currentYear} {profile.name}. {t.allRightsReserved}
            </p>
            {profile.isVerified && (
              <div className="flex items-center gap-1 justify-center md:justify-start mt-1">
                <Shield className="h-4 w-4" style={{ color: "var(--profile-primary)" }} />
                <span className="text-xs text-gray-500">{t.verifiedProfile}</span>
              </div>
            )}
          </div>

          {/* Center - Platform Link */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{t.poweredBy}</span>
            <Link
              href={`/${locale === "de" ? "" : locale + "/"}therapists`}
              className="flex items-center gap-1 font-medium hover:underline"
              style={{ color: "var(--profile-primary)" }}
            >
              <Heart className="h-4 w-4" />
              {t.platformName}
            </Link>
          </div>

          {/* Right - Links */}
          <div className="flex items-center gap-4 text-sm">
            <Link
              href={`/${locale === "de" ? "" : locale + "/"}therapists`}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <ExternalLink className="h-3 w-3" />
              {t.backToSearch}
            </Link>
            <Link
              href={`/${locale === "de" ? "" : locale + "/"}privacy`}
              className="text-gray-500 hover:text-gray-700"
            >
              {t.privacyPolicy}
            </Link>
            <Link
              href={`/${locale === "de" ? "" : locale + "/"}imprint`}
              className="text-gray-500 hover:text-gray-700"
            >
              {t.imprint}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
