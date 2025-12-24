"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, X, ImageIcon } from "lucide-react";

// Check if Cloudinary is configured
const cloudinaryConfigured = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// Dynamic import for Cloudinary widget to avoid errors when not configured
const CldUploadWidget = cloudinaryConfigured
  ? dynamic(() => import("next-cloudinary").then((mod) => mod.CldUploadWidget), { ssr: false })
  : null;

interface HeroImagePickerProps {
  value: string;
  onImageChange: (url: string) => void;
  disabled?: boolean;
  translations: {
    title: string;
    description: string;
    upload: string;
    url: string;
    urlLabel: string;
    clickUpload: string;
    maxSize: string;
    use: string;
    hoverRemove: string;
  };
}

export function HeroImagePicker({
  value,
  onImageChange,
  disabled = false,
  translations: t,
}: HeroImagePickerProps) {
  const [mode, setMode] = useState<"upload" | "url">(cloudinaryConfigured ? "upload" : "url");
  const [urlInput, setUrlInput] = useState(value);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUploadSuccess = (result: any) => {
    if (result.info && typeof result.info === "object" && "secure_url" in result.info) {
      onImageChange(result.info.secure_url as string);
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
        <div className="relative group w-full aspect-[3/1] rounded-lg overflow-hidden border">
          <img
            src={value}
            alt={t.title}
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
                {t.hoverRemove}
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
          <span className="text-sm text-muted-foreground">{t.description}</span>
        </div>
      </div>

      {cloudinaryConfigured ? (
        <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="text-xs gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              {t.upload}
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs gap-1.5">
              <LinkIcon className="h-3.5 w-3.5" />
              {t.url}
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-3 mt-3">
            {CldUploadWidget && (
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
                    className="w-full h-16 border-dashed"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {t.clickUpload}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t.maxSize}
                      </span>
                    </div>
                  </Button>
                )}
              </CldUploadWidget>
            )}
          </TabsContent>

          {/* URL Tab */}
          <TabsContent value="url" className="space-y-3 mt-3">
            <div className="space-y-2">
              <Label htmlFor="heroImageUrl" className="text-xs">{t.urlLabel}</Label>
              <Input
                id="heroImageUrl"
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
              {t.use}
            </Button>
          </TabsContent>
        </Tabs>
      ) : (
        /* URL-only mode when Cloudinary is not configured */
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="heroImageUrl" className="text-xs">{t.urlLabel}</Label>
            <Input
              id="heroImageUrl"
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
            {t.use}
          </Button>
        </div>
      )}
    </div>
  );
}
