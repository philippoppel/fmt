"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Camera, Building } from "lucide-react";
import type { TherapistProfileData } from "@/types/profile";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProfileGalleryProps {
  profile: TherapistProfileData;
  locale: string;
}

export function ProfileGallery({ profile, locale }: ProfileGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"personal" | "office">("personal");

  const t = {
    de: {
      gallery: "Bildergalerie",
      personalPhotos: "Persönliche Fotos",
      practicePhotos: "Praxis & Räumlichkeiten",
      noImages: "Keine Bilder verfügbar",
    },
    en: {
      gallery: "Photo Gallery",
      personalPhotos: "Personal Photos",
      practicePhotos: "Practice & Rooms",
      noImages: "No images available",
    },
  }[locale] || {
    de: {
      gallery: "Bildergalerie",
      personalPhotos: "Persönliche Fotos",
      practicePhotos: "Praxis & Räumlichkeiten",
      noImages: "Keine Bilder verfügbar",
    },
  };

  const personalImages = profile.galleryImages || [];
  const officeImages = profile.officeImages || [];

  const currentImages = activeTab === "personal" ? personalImages : officeImages;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  // Don't render if no images
  if (personalImages.length === 0 && officeImages.length === 0) {
    return null;
  }

  return (
    <div className="py-16 sm:py-24" style={{ backgroundColor: "var(--profile-bg)" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          className="text-2xl sm:text-3xl font-bold mb-8 text-center"
          style={{ color: "var(--profile-text)" }}
        >
          {t.gallery}
        </h2>

        {/* Tab Buttons */}
        {personalImages.length > 0 && officeImages.length > 0 && (
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant={activeTab === "personal" ? "default" : "outline"}
              onClick={() => setActiveTab("personal")}
              className="gap-2"
              style={
                activeTab === "personal"
                  ? { backgroundColor: "var(--profile-primary)" }
                  : { borderColor: "var(--profile-primary)", color: "var(--profile-primary)" }
              }
            >
              <Camera className="h-4 w-4" />
              {t.personalPhotos}
            </Button>
            <Button
              variant={activeTab === "office" ? "default" : "outline"}
              onClick={() => setActiveTab("office")}
              className="gap-2"
              style={
                activeTab === "office"
                  ? { backgroundColor: "var(--profile-primary)" }
                  : { borderColor: "var(--profile-primary)", color: "var(--profile-primary)" }
              }
            >
              <Building className="h-4 w-4" />
              {t.practicePhotos}
            </Button>
          </div>
        )}

        {/* Gallery Grid */}
        {currentImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentImages.map((image, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-shadow"
              >
                <Image
                  src={image}
                  alt={`${profile.name} - Foto ${index + 1}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">{t.noImages}</p>
        )}

        {/* Lightbox */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-5xl bg-black/95 border-none p-0">
            <div className="relative w-full h-[80vh]">
              {currentImages[currentIndex] && (
                <Image
                  src={currentImages[currentIndex]}
                  alt={`${profile.name} - Foto ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                />
              )}

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={() => setLightboxOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Navigation Buttons */}
              {currentImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 rounded-full px-4 py-2">
                {currentIndex + 1} / {currentImages.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
