"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, X, User, Camera, Loader2 } from "lucide-react";

// Check if Cloudinary is configured
const cloudinaryConfigured = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

interface ProfileImagePickerProps {
  value: string;
  onImageChange: (url: string) => void;
  disabled?: boolean;
  translations: {
    imageAlt: string;
    imageAdd: string;
    imageHoverRemove: string;
    imageUpload: string;
    imageUrl: string;
    imageUrlLabel: string;
    imageClickUpload: string;
    imageMaxSize: string;
    imageUse: string;
    imageRecommendation: string;
  };
}

export function ProfileImagePicker({
  value,
  onImageChange,
  disabled = false,
  translations: t,
}: ProfileImagePickerProps) {
  const [mode, setMode] = useState<"upload" | "url">(cloudinaryConfigured ? "upload" : "url");
  const [urlInput, setUrlInput] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onImageChange(data.url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageChange(urlInput.trim());
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
        <div className="relative group w-32 h-32 mx-auto">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
            <img
              src={value}
              alt={t.imageAlt}
              className="w-full h-full object-cover"
            />
          </div>
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {!disabled && (
          <p className="text-xs text-muted-foreground text-center">
            {t.imageHoverRemove}
          </p>
        )}
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="w-32 h-32 mx-auto rounded-full bg-muted flex items-center justify-center border-4 border-dashed border-muted-foreground/20">
        <User className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Empty state with upload prompt */}
      <div className="w-32 h-32 mx-auto rounded-full bg-muted/50 flex items-center justify-center border-4 border-dashed border-muted-foreground/30">
        <div className="text-center">
          <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
          <span className="text-xs text-muted-foreground">{t.imageAdd}</span>
        </div>
      </div>

      {cloudinaryConfigured ? (
        <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="text-xs gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              {t.imageUpload}
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs gap-1.5">
              <LinkIcon className="h-3.5 w-3.5" />
              {t.imageUrl}
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-3 mt-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full h-20 border-dashed"
            >
              <div className="flex flex-col items-center gap-1">
                {isUploading ? (
                  <>
                    <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                    <span className="text-sm text-muted-foreground">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {t.imageClickUpload}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t.imageMaxSize}
                    </span>
                  </>
                )}
              </div>
            </Button>
            {uploadError && (
              <p className="text-sm text-destructive text-center">{uploadError}</p>
            )}
          </TabsContent>

          {/* URL Tab */}
          <TabsContent value="url" className="space-y-3 mt-3">
            <div className="space-y-2">
              <Label htmlFor="profileImageUrl" className="text-xs">{t.imageUrlLabel}</Label>
              <Input
                id="profileImageUrl"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
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
              {t.imageUse}
            </Button>
          </TabsContent>
        </Tabs>
      ) : (
        /* URL-only mode when Cloudinary is not configured */
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="profileImageUrl" className="text-xs">{t.imageUrlLabel}</Label>
            <Input
              id="profileImageUrl"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
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
            {t.imageUse}
          </Button>
        </div>
      )}

      {/* Recommendation hint */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800">
          <strong>💡</strong> {t.imageRecommendation}
        </p>
      </div>
    </div>
  );
}
