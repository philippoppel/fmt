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
      setIsScrolled(window.scrollY > 100);
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-md" : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Name */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-semibold text-lg truncate max-w-[200px] sm:max-w-none"
            style={{ color: isScrolled ? "var(--profile-primary)" : "var(--profile-text)" }}
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
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isScrolled
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white/20"
                )}
              >
                {item.label}
              </button>
            ))}
            <Button
              size="sm"
              className="ml-2 text-white"
              style={{ backgroundColor: "var(--profile-primary)" }}
              onClick={() => scrollToSection("contact")}
            >
              {t.contact}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
