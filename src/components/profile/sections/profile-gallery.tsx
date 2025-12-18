"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Camera, Building, ZoomIn } from "lucide-react";
import type { TherapistProfileData } from "@/types/profile";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

interface ProfileGalleryProps {
  profile: TherapistProfileData;
  locale: string;
}

export function ProfileGallery({ profile, locale }: ProfileGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"personal" | "office">("personal");
  const { ref: galleryRef, isVisible: galleryVisible } = useScrollAnimation();

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
    <div className="py-16 sm:py-24 relative overflow-hidden" style={{ backgroundColor: "var(--profile-bg)" }}>
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] rounded-full blur-3xl opacity-5"
          style={{
            background: `radial-gradient(circle, var(--profile-primary) 0%, transparent 70%)`,
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
        <h2
          ref={galleryRef}
          className={cn(
            "text-2xl sm:text-3xl font-bold mb-8 text-center",
            "opacity-0",
            galleryVisible && "animate-fade-in-up"
          )}
          style={{ color: "var(--profile-text)", animationFillMode: "forwards" }}
        >
          {t.gallery}
        </h2>

        {/* Tab Buttons with animation */}
        {personalImages.length > 0 && officeImages.length > 0 && (
          <div
            className={cn(
              "flex justify-center gap-4 mb-8",
              "opacity-0",
              galleryVisible && "animate-fade-in-up stagger-1"
            )}
            style={{ animationFillMode: "forwards" }}
          >
            <Button
              variant={activeTab === "personal" ? "default" : "outline"}
              onClick={() => setActiveTab("personal")}
              className={cn(
                "gap-2 transition-all duration-300",
                "hover:scale-105"
              )}
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
              className={cn(
                "gap-2 transition-all duration-300",
                "hover:scale-105"
              )}
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

        {/* Gallery Grid with staggered animation */}
        {currentImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentImages.map((image, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden group cursor-pointer",
                  "shadow-md hover:shadow-2xl",
                  "transition-all duration-500",
                  "hover:z-10",
                  "opacity-0",
                  galleryVisible && "animate-fade-in-scale"
                )}
                style={{
                  animationDelay: `${0.1 + index * 0.05}s`,
                  animationFillMode: "forwards",
                }}
              >
                <Image
                  src={image}
                  alt={`${profile.name} - Foto ${index + 1}`}
                  fill
                  className={cn(
                    "object-cover",
                    "transition-all duration-500",
                    "group-hover:scale-110 group-hover:brightness-110"
                  )}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {/* Gradient Overlay */}
                <div
                  className={cn(
                    "absolute inset-0",
                    "bg-gradient-to-t from-black/50 via-transparent to-transparent",
                    "opacity-0 group-hover:opacity-100",
                    "transition-opacity duration-300"
                  )}
                />
                {/* Zoom Icon */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center",
                    "opacity-0 group-hover:opacity-100",
                    "transition-all duration-300"
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-full",
                      "bg-white/90 backdrop-blur-sm shadow-lg",
                      "transform scale-75 group-hover:scale-100",
                      "transition-transform duration-300"
                    )}
                  >
                    <ZoomIn className="h-5 w-5 text-gray-800" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">{t.noImages}</p>
        )}

        {/* Lightbox with smooth transitions */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-5xl bg-black/95 border-none p-0">
            <div className="relative w-full h-[80vh]">
              {currentImages[currentIndex] && (
                <Image
                  src={currentImages[currentIndex]}
                  alt={`${profile.name} - Foto ${currentIndex + 1}`}
                  fill
                  className="object-contain animate-fade-in-scale"
                  priority
                />
              )}

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute top-4 right-4 text-white",
                  "hover:bg-white/20 hover:scale-110",
                  "transition-all duration-200"
                )}
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
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 text-white",
                      "hover:bg-white/20 hover:scale-110",
                      "transition-all duration-200"
                    )}
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2 text-white",
                      "hover:bg-white/20 hover:scale-110",
                      "transition-all duration-200"
                    )}
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              {/* Counter with glass effect */}
              <div
                className={cn(
                  "absolute bottom-4 left-1/2 -translate-x-1/2",
                  "text-white bg-black/50 backdrop-blur-sm",
                  "rounded-full px-4 py-2"
                )}
              >
                {currentIndex + 1} / {currentImages.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
