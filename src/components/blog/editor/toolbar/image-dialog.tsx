"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Upload, Link as LinkIcon, ImageIcon, Search, Loader2 } from "lucide-react";
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

interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string, alt?: string, credit?: string) => void;
}

export function ImageDialog({ open, onOpenChange, onSubmit }: ImageDialogProps) {
  const [mode, setMode] = useState<"upload" | "url" | "unsplash">("unsplash");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

  // Unsplash state
  const [searchQuery, setSearchQuery] = useState("");
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<UnsplashPhoto | null>(null);

  const searchUnsplash = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/unsplash/search?query=${encodeURIComponent(searchQuery)}&per_page=12`
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
    setSelectedPhoto(photo);
    setAlt(photo.alt);
  };

  const handleUnsplashSubmit = () => {
    if (selectedPhoto) {
      const credit = `Foto von ${selectedPhoto.photographer} auf Unsplash`;
      onSubmit(selectedPhoto.url, alt.trim() || selectedPhoto.alt, credit);
      resetAndClose();
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim(), alt.trim() || undefined);
      resetAndClose();
    }
  };

  const handleUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info === "object" && "secure_url" in result.info) {
      onSubmit(result.info.secure_url as string, alt.trim() || undefined);
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setUrl("");
    setAlt("");
    setSearchQuery("");
    setPhotos([]);
    setSelectedPhoto(null);
    setMode("unsplash");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={mode === "unsplash" ? "sm:max-w-2xl" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle>Bild einfügen</DialogTitle>
          <DialogDescription>
            Suchen Sie auf Unsplash, laden Sie ein Bild hoch oder geben Sie eine URL ein.
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={mode === "unsplash" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("unsplash")}
            className="flex-1"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Unsplash
          </Button>
          <Button
            type="button"
            variant={mode === "upload" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("upload")}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Hochladen
          </Button>
          <Button
            type="button"
            variant={mode === "url" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("url")}
            className="flex-1"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            URL
          </Button>
        </div>

        {/* Unsplash Mode */}
        {mode === "unsplash" && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Bilder suchen... (z.B. Therapie, Natur, Office)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUnsplash()}
              />
              <Button onClick={searchUnsplash} disabled={isSearching}>
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Photo Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => handleUnsplashSelect(photo)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      selectedPhoto?.id === photo.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <img
                      src={photo.thumbUrl}
                      alt={photo.alt}
                      className="w-full h-full object-cover"
                    />
                    {selectedPhoto?.id === photo.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Search className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Selected Photo Details */}
            {selectedPhoto && (
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <span className="text-muted-foreground">Fotograf:</span>{" "}
                  <a
                    href={`${selectedPhoto.photographerUrl}?utm_source=findmytherapy&utm_medium=referral`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {selectedPhoto.photographer}
                  </a>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="unsplash-alt" className="text-xs">Alt-Text</Label>
                  <Input
                    id="unsplash-alt"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="Beschreibung des Bildes"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isSearching && photos.length === 0 && searchQuery && (
              <p className="text-center text-sm text-muted-foreground py-8">
                Keine Bilder gefunden. Versuchen Sie einen anderen Suchbegriff.
              </p>
            )}

            {!searchQuery && photos.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                Geben Sie einen Suchbegriff ein, um kostenlose Bilder zu finden.
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetAndClose}>
                Abbrechen
              </Button>
              <Button onClick={handleUnsplashSubmit} disabled={!selectedPhoto}>
                Einfügen
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Upload Mode */}
        {mode === "upload" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-alt-upload">Alt-Text (für Barrierefreiheit)</Label>
              <Input
                id="image-alt-upload"
                placeholder="Beschreibung des Bildes"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
              />
            </div>

            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "blog_images"}
              options={{
                maxFiles: 1,
                resourceType: "image",
                folder: "blog",
                clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp", "avif"],
                maxFileSize: 10000000, // 10MB
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetAndClose}>
                Abbrechen
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* URL Mode */}
        {mode === "url" && (
          <form onSubmit={handleUrlSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Bild-URL</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-alt-url">Alt-Text (für Barrierefreiheit)</Label>
                <Input
                  id="image-alt-url"
                  placeholder="Beschreibung des Bildes"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetAndClose}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={!url.trim()}>
                Einfügen
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
