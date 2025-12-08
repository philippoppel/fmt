"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Minus, Plus, RotateCcw, Type } from "lucide-react";
import { cn } from "@/lib/utils";

const FONT_SIZES = [
  { class: "text-base", label: "normal", value: 100 },
  { class: "text-lg", label: "large", value: 112 },
  { class: "text-xl", label: "extraLarge", value: 125 },
  { class: "text-2xl", label: "extraLarge", value: 150 },
];

const DEFAULT_INDEX = 0;
const STORAGE_KEY = "blog-font-size";

interface FontSizeControlProps {
  className?: string;
}

export function FontSizeControl({ className }: FontSizeControlProps) {
  const t = useTranslations("blog.a11y.fontSize");
  const [sizeIndex, setSizeIndex] = useState(DEFAULT_INDEX);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const index = parseInt(saved, 10);
      if (index >= 0 && index < FONT_SIZES.length) {
        setSizeIndex(index);
      }
    }
  }, []);

  // Apply font size to article
  useEffect(() => {
    const article = document.querySelector("article");
    if (article) {
      // Remove all font size classes
      FONT_SIZES.forEach((size) => {
        article.classList.remove(size.class);
      });
      // Add current size class
      article.classList.add(FONT_SIZES[sizeIndex].class);
    }

    // Save preference
    localStorage.setItem(STORAGE_KEY, sizeIndex.toString());
  }, [sizeIndex]);

  const decrease = () => {
    setSizeIndex((prev) => Math.max(0, prev - 1));
  };

  const increase = () => {
    setSizeIndex((prev) => Math.min(FONT_SIZES.length - 1, prev + 1));
  };

  const reset = () => {
    setSizeIndex(DEFAULT_INDEX);
  };

  const currentSize = FONT_SIZES[sizeIndex];

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 rounded-lg border bg-card",
        className
      )}
      role="group"
      aria-label={t("label")}
    >
      <Type className="h-4 w-4 text-muted-foreground mx-2" aria-hidden="true" />

      <Button
        variant="ghost"
        size="icon"
        onClick={decrease}
        disabled={sizeIndex === 0}
        aria-label={t("small")}
        className="h-8 w-8"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </Button>

      <span className="text-xs text-muted-foreground min-w-[40px] text-center">
        {currentSize.value}%
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={increase}
        disabled={sizeIndex === FONT_SIZES.length - 1}
        aria-label={t("large")}
        className="h-8 w-8"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </Button>

      {sizeIndex !== DEFAULT_INDEX && (
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          aria-label={t("normal")}
          className="h-8 w-8"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
