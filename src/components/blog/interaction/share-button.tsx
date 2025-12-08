"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Share2, Link as LinkIcon, Twitter, Linkedin, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  url: string;
  className?: string;
}

export function ShareButton({ title, url, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${url}`
    : url;

  const shareLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
    },
    {
      name: "E-Mail",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(fullUrl)}`,
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Use native share API if available
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: fullUrl,
        });
        return;
      } catch {
        // User cancelled or error, fall through to popover
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className={cn("gap-2", className)}
        >
          <Share2 className="h-4 w-4" />
          Teilen
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="start">
        <div className="space-y-2">
          <p className="text-sm font-medium">Artikel teilen</p>

          {/* Copy Link */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <LinkIcon className="h-4 w-4" />
            )}
            {copied ? "Kopiert!" : "Link kopieren"}
          </Button>

          {/* Social Links */}
          {shareLinks.map((link) => (
            <Button
              key={link.name}
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              asChild
            >
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </a>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
