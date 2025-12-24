"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Link as LinkIcon,
  ImageIcon,
  Search,
  Loader2,
  X,
} from "lucide-react";

// Check if Cloudinary is configured
const cloudinaryConfigured = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// Dynamic import for Cloudinary widget to avoid errors when not configured
const CldUploadWidget = cloudinaryConfigured
  ? dynamic(() => import("next-cloudinary").then((mod) => mod.CldUploadWidget), { ssr: false })
  : null;

interface UnsplashPhoto {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  photographerUsername: string;
}

interface MicrositeHeroPickerProps {
  value: string;
  onImageChange: (url: string) => void;
  disabled?: boolean;
}

export function MicrositeHeroPicker({
  value,
  onImageChange,
  disabled = false,
}: MicrositeHeroPickerProps) {
  const [mode, setMode] = useState<"unsplash" | "upload" | "url">("unsplash");
  const [urlInput, setUrlInput] = useState(value);

  // Unsplash state
  const [searchQuery, setSearchQuery] = useState("");
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [unsplashError, setUnsplashError] = useState<string | null>(null);

  // Auto-search with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setUnsplashError(null);
      try {
        const response = await fetch(
          `/api/unsplash/search?query=${encodeURIComponent(searchQuery)}&per_page=12`
        );
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 500 && data.error === "Unsplash API not configured") {
            setUnsplashError("Unsplash ist nicht konfiguriert. Nutze den Upload oder eine URL.");
          } else {
            setUnsplashError("Fehler bei der Suche. Bitte versuche es erneut.");
          }
          return;
        }
        if (data.photos) {
          setPhotos(data.photos);
        }
      } catch (error) {
        console.error("Unsplash search error:", error);
        setUnsplashError("Verbindungsfehler. Bitte versuche es erneut.");
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchUnsplash = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setUnsplashError(null);
    try {
      const response = await fetch(
        `/api/unsplash/search?query=${encodeURIComponent(searchQuery)}&per_page=12`
      );
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 500 && data.error === "Unsplash API not configured") {
          setUnsplashError("Unsplash ist nicht konfiguriert. Nutze den Upload oder eine URL.");
        } else {
          setUnsplashError("Fehler bei der Suche. Bitte versuche es erneut.");
        }
        return;
      }
      if (data.photos) {
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error("Unsplash search error:", error);
      setUnsplashError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleUnsplashSelect = (photo: UnsplashPhoto) => {
    onImageChange(photo.url);
    setPhotos([]);
    setSearchQuery("");
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageChange(urlInput.trim());
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUploadSuccess = (result: any) => {
    if (result.info && typeof result.info === "object" && "secure_url" in result.info) {
      onImageChange(result.info.secure_url as string);
    }
  };

  const handleRemoveImage = () => {
    onImageChange("");
    setUrlInput("");
  };

  // If image is already set, show preview with remove option
  if (value) {
    return (
      <div className="space-y-3">
        <div className="relative group w-full aspect-[3/1] rounded-lg overflow-hidden border">
          <img
            src={value}
            alt="Hero-Bild"
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4 mr-1" />
                Entfernen
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="w-full aspect-[3/1] rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
        <ImageIcon className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Empty state */}
      <div className="w-full aspect-[3/1] rounded-lg bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
        <div className="text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <span className="text-sm text-muted-foreground">Hero-Hintergrundbild wählen</span>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unsplash" className="text-xs gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" />
            Unsplash
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs gap-1.5" disabled={!cloudinaryConfigured}>
            <Upload className="h-3.5 w-3.5" />
            Hochladen
          </TabsTrigger>
          <TabsTrigger value="url" className="text-xs gap-1.5">
            <LinkIcon className="h-3.5 w-3.5" />
            URL
          </TabsTrigger>
        </TabsList>

        {/* Unsplash Tab */}
        <TabsContent value="unsplash" className="space-y-3 mt-3">
          <div className="flex gap-2">
            <Input
              placeholder="Bilder suchen... (z.B. Natur, Berge, Meer)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchUnsplash()}
            />
            <Button
              type="button"
              onClick={searchUnsplash}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => handleUnsplashSelect(photo)}
                  className="relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                >
                  <img
                    src={photo.thumbUrl}
                    alt={photo.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {unsplashError && (
            <div className="text-center py-6 px-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">{unsplashError}</p>
            </div>
          )}

          {!isSearching && !unsplashError && photos.length === 0 && !searchQuery && (
            <p className="text-center text-sm text-muted-foreground py-6">
              Suchen Sie nach kostenlosen Bildern auf Unsplash
            </p>
          )}

          {!isSearching && !unsplashError && photos.length === 0 && searchQuery && (
            <p className="text-center text-sm text-muted-foreground py-6">
              Keine Bilder gefunden. Versuchen Sie einen anderen Suchbegriff.
            </p>
          )}
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-3 mt-3">
          {cloudinaryConfigured && CldUploadWidget ? (
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "blog_images"}
              options={{
                maxFiles: 1,
                resourceType: "image",
                folder: "profiles/hero",
                clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                maxFileSize: 10000000,
                cropping: true,
                croppingAspectRatio: 3,
                croppingShowDimensions: true,
                showSkipCropButton: false,
              }}
              onSuccess={handleUploadSuccess}
            >
              {({ open: openWidget }: { open: () => void }) => (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openWidget()}
                  className="w-full h-24 border-dashed"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Klicken zum Hochladen
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Max. 10MB
                    </span>
                  </div>
                </Button>
              )}
            </CldUploadWidget>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-6">
              Cloudinary ist nicht konfiguriert. Nutze Unsplash oder eine URL.
            </p>
          )}
        </TabsContent>

        {/* URL Tab */}
        <TabsContent value="url" className="space-y-3 mt-3">
          <div className="space-y-2">
            <Label htmlFor="heroImageUrl">Bild-URL</Label>
            <Input
              id="heroImageUrl"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="text-sm"
            />
          </div>
          <Button
            type="button"
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            size="sm"
            className="w-full"
          >
            Bild verwenden
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
