"use client";

import { useState, useCallback } from "react";
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
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";

interface UnsplashPhoto {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  photographerUsername: string;
}

interface FeaturedImagePickerProps {
  value: string;
  alt: string;
  onImageChange: (url: string, alt: string, credit?: string) => void;
}

export function FeaturedImagePicker({
  value,
  alt,
  onImageChange,
}: FeaturedImagePickerProps) {
  const [mode, setMode] = useState<"unsplash" | "upload" | "url">("unsplash");
  const [urlInput, setUrlInput] = useState(value);
  const [altInput, setAltInput] = useState(alt);

  // Unsplash state
  const [searchQuery, setSearchQuery] = useState("");
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchUnsplash = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/unsplash/search?query=${encodeURIComponent(searchQuery)}&per_page=9`
      );
      const data = await response.json();
      if (data.photos) {
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error("Unsplash search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleUnsplashSelect = (photo: UnsplashPhoto) => {
    const credit = `Foto von ${photo.photographer} auf Unsplash`;
    onImageChange(photo.url, photo.alt || altInput, credit);
    setPhotos([]);
    setSearchQuery("");
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageChange(urlInput.trim(), altInput);
    }
  };

  const handleUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info === "object" && "secure_url" in result.info) {
      onImageChange(result.info.secure_url as string, altInput);
    }
  };

  const handleRemoveImage = () => {
    onImageChange("", "");
    setUrlInput("");
    setAltInput("");
  };

  // If image is already set, show preview with remove option
  if (value) {
    return (
      <div className="space-y-3">
        <div className="relative group">
          <img
            src={value}
            alt={alt || "Titelbild"}
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="featuredImageAlt">Alt-Text</Label>
          <Input
            id="featuredImageAlt"
            value={alt}
            onChange={(e) => onImageChange(value, e.target.value)}
            placeholder="Bildbeschreibung für Barrierefreiheit"
          />
        </div>
      </div>
    );
  }

  return (
    <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="unsplash" className="text-xs gap-1.5">
          <ImageIcon className="h-3.5 w-3.5" />
          Unsplash
        </TabsTrigger>
        <TabsTrigger value="upload" className="text-xs gap-1.5">
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
            placeholder="Bilder suchen... (z.B. Therapie, Natur)"
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
          <div className="grid grid-cols-3 gap-2">
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

        {!isSearching && photos.length === 0 && !searchQuery && (
          <p className="text-center text-sm text-muted-foreground py-6">
            Suchen Sie nach kostenlosen Bildern auf Unsplash
          </p>
        )}

        {!isSearching && photos.length === 0 && searchQuery && (
          <p className="text-center text-sm text-muted-foreground py-6">
            Keine Bilder gefunden. Versuchen Sie einen anderen Suchbegriff.
          </p>
        )}
      </TabsContent>

      {/* Upload Tab */}
      <TabsContent value="upload" className="space-y-3 mt-3">
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "blog_images"}
          options={{
            maxFiles: 1,
            resourceType: "image",
            folder: "blog/featured",
            clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp", "avif"],
            maxFileSize: 10000000,
          }}
          onSuccess={handleUploadSuccess}
        >
          {({ open: openWidget }) => (
            <Button
              type="button"
              variant="outline"
              onClick={() => openWidget()}
              className="w-full h-32 border-dashed"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Klicken zum Hochladen
                </span>
              </div>
            </Button>
          )}
        </CldUploadWidget>
      </TabsContent>

      {/* URL Tab */}
      <TabsContent value="url" className="space-y-3 mt-3">
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Bild-URL</Label>
          <Input
            id="imageUrl"
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageAlt">Alt-Text</Label>
          <Input
            id="imageAlt"
            value={altInput}
            onChange={(e) => setAltInput(e.target.value)}
            placeholder="Bildbeschreibung"
          />
        </div>
        <Button
          type="button"
          onClick={handleUrlSubmit}
          disabled={!urlInput.trim()}
          className="w-full"
        >
          Bild verwenden
        </Button>
      </TabsContent>
    </Tabs>
  );
}
