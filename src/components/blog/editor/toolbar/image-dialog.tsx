"use client";

import { useState } from "react";
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
import { Upload, Link as LinkIcon } from "lucide-react";
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";

interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string, alt?: string) => void;
}

export function ImageDialog({ open, onOpenChange, onSubmit }: ImageDialogProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

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
    setMode("upload");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bild einfügen</DialogTitle>
          <DialogDescription>
            Laden Sie ein Bild hoch oder geben Sie eine URL ein.
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
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

        {mode === "upload" ? (
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
          </div>
        ) : (
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

        {mode === "upload" && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Abbrechen
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
