"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import type { TherapistProfileData } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileNavigationProps {
  profile: TherapistProfileData;
  activeSection: string;
  onSectionChange: (section: string) => void;
  locale: string;
}

export function ProfileNavigation({ profile, locale }: ProfileNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = {
    de: {
      about: "Über mich",
      specializations: "Schwerpunkte",
      gallery: "Galerie",
      contact: "Kontakt",
    },
    en: {
      about: "About",
      specializations: "Specializations",
      gallery: "Gallery",
      contact: "Contact",
    },
  }[locale] || {
    de: {
      about: "Über mich",
      specializations: "Schwerpunkte",
      gallery: "Galerie",
      contact: "Kontakt",
    },
  };

  // Check if gallery should be shown
  const hasGallery = (profile.galleryImages?.length || 0) > 0 || (profile.officeImages?.length || 0) > 0;

  const navItems = [
    { id: "about", label: t.about },
    { id: "specializations", label: t.specializations },
    ...(hasGallery ? [{ id: "gallery", label: t.gallery }] : []),
    { id: "contact", label: t.contact },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "py-2 backdrop-blur-xl shadow-lg border-b"
          : "py-4 bg-transparent"
      )}
      style={{
        backgroundColor: isScrolled ? "rgba(255,255,255,0.85)" : "transparent",
        borderColor: isScrolled ? "rgba(255,255,255,0.3)" : "transparent",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Name */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={cn(
              "font-bold text-lg truncate max-w-[200px] sm:max-w-none transition-colors duration-300",
              isScrolled ? "" : "text-white drop-shadow-md"
            )}
            style={{
              color: isScrolled ? "var(--profile-primary)" : undefined,
            }}
          >
            {profile.name}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-all duration-300",
                  "after:absolute after:bottom-0 after:left-1/2 after:h-0.5",
                  "after:w-0 after:transition-all after:duration-300 after:-translate-x-1/2",
                  "hover:after:w-full",
                  isScrolled
                    ? "text-gray-600 hover:text-gray-900"
                    : "text-white/90 hover:text-white drop-shadow-md"
                )}
                style={{
                  ["--tw-after-bg" as string]: `linear-gradient(90deg, var(--profile-primary), var(--profile-accent))`,
                }}
              >
                {item.label}
                {/* Animated underline */}
                <span
                  className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 transition-all duration-300 group-hover:w-full"
                  style={{
                    background: `linear-gradient(90deg, var(--profile-primary), var(--profile-accent))`,
                  }}
                />
              </button>
            ))}
            <Button
              size="sm"
              className={cn(
                "ml-3 font-semibold text-white",
                "hover:scale-105 transition-all duration-300",
                "shadow-lg hover:shadow-xl"
              )}
              style={{
                background: `linear-gradient(135deg, var(--profile-primary), var(--profile-accent))`,
              }}
              onClick={() => scrollToSection("contact")}
            >
              {t.contact}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "md:hidden",
              isScrolled ? "" : "text-white"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          className="md:hidden backdrop-blur-xl border-t shadow-lg mt-2"
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            borderColor: "rgba(255,255,255,0.3)",
          }}
        >
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-4 py-3 rounded-xl text-gray-600 hover:text-gray-900 transition-colors"
                style={{
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--profile-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {item.label}
              </button>
            ))}
            <Button
              className="w-full mt-2 font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, var(--profile-primary), var(--profile-accent))`,
              }}
              onClick={() => scrollToSection("contact")}
            >
              {t.contact}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
