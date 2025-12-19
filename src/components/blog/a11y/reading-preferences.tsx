"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Volume2,
  Play,
  Pause,
  Minus,
  Plus,
  Type,
  Settings,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

// ============================================================================
// Font Size Constants
// ============================================================================

const FONT_SIZES = [
  { value: 100, label: "100%" },
  { value: 112, label: "112%" },
  { value: 125, label: "125%" },
  { value: 150, label: "150%" },
];

const FONT_SIZE_CLASSES = ["text-base", "text-lg", "text-xl", "text-2xl"];
const STORAGE_KEY = "blog-font-size";

// ============================================================================
// Main Component
// ============================================================================

interface ReadingPreferencesProps {
  text: string;
  className?: string;
}

export function ReadingPreferences({ text, className }: ReadingPreferencesProps) {
  const t = useTranslations("blog.a11y");
  const locale = useLocale();

  // Font size state
  const [sizeIndex, setSizeIndex] = useState(0);

  // TTS state
  const [ttsSupported, setTtsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ============================================================================
  // Font Size Logic
  // ============================================================================

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const index = parseInt(saved, 10);
      if (index >= 0 && index < FONT_SIZES.length) {
        setSizeIndex(index);
      }
    }
  }, []);

  useEffect(() => {
    const article = document.querySelector("article");
    if (article) {
      FONT_SIZE_CLASSES.forEach((cls) => article.classList.remove(cls));
      article.classList.add(FONT_SIZE_CLASSES[sizeIndex]);
    }
    localStorage.setItem(STORAGE_KEY, sizeIndex.toString());
  }, [sizeIndex]);

  const decreaseFont = () => setSizeIndex((prev) => Math.max(0, prev - 1));
  const increaseFont = () => setSizeIndex((prev) => Math.min(FONT_SIZES.length - 1, prev + 1));

  // ============================================================================
  // TTS Logic
  // ============================================================================

  useEffect(() => {
    setTtsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    if (!ttsSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const langCode = locale === "de" ? "de" : "en";
      const filteredVoices = availableVoices.filter((voice) =>
        voice.lang.startsWith(langCode)
      );
      setVoices(filteredVoices.length > 0 ? filteredVoices : availableVoices);

      if (!selectedVoice && filteredVoices.length > 0) {
        const preferredVoice = filteredVoices.find((v) => v.localService) || filteredVoices[0];
        setSelectedVoice(preferredVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [ttsSupported, locale, selectedVoice]);

  useEffect(() => {
    return () => {
      if (ttsSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [ttsSupported]);

  const toggleTTS = useCallback(() => {
    if (!ttsSupported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale === "de" ? "de-DE" : "en-US";
      utterance.rate = rate;
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  }, [ttsSupported, isPlaying, text, locale, rate, selectedVoice]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className={cn(
        "rounded-xl border bg-card/50 p-4",
        className
      )}
      role="region"
      aria-label={t("textToSpeech.play")}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">
          Leseoptionen
        </span>

        {/* TTS Settings Popover */}
        {ttsSupported && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                aria-label="Spracheinstellungen"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">
                    Geschwindigkeit: {rate.toFixed(1)}x
                  </Label>
                  <Slider
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[rate]}
                    onValueChange={([value]) => setRate(value)}
                  />
                </div>
                {voices.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs">Stimme</Label>
                    <select
                      value={selectedVoice?.name || ""}
                      onChange={(e) => {
                        const voice = voices.find((v) => v.name === e.target.value);
                        setSelectedVoice(voice || null);
                      }}
                      className="w-full h-8 px-2 rounded-md border bg-background text-xs"
                    >
                      {voices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-3">
        {/* Text-to-Speech */}
        {ttsSupported && (
          <Button
            variant={isPlaying ? "default" : "outline"}
            size="sm"
            onClick={toggleTTS}
            className={cn(
              "gap-2 flex-1",
              isPlaying && "bg-trust text-white hover:bg-trust/90"
            )}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Vorlesen</span>
              </>
            )}
          </Button>
        )}

        {/* Divider */}
        <div className="w-px h-8 bg-border" aria-hidden="true" />

        {/* Font Size Controls */}
        <div className="flex items-center gap-1">
          <Type className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Button
            variant="ghost"
            size="icon"
            onClick={decreaseFont}
            disabled={sizeIndex === 0}
            className="h-8 w-8"
            aria-label="Schrift verkleinern"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[36px] text-center tabular-nums">
            {FONT_SIZES[sizeIndex].label}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={increaseFont}
            disabled={sizeIndex === FONT_SIZES.length - 1}
            className="h-8 w-8"
            aria-label="Schrift vergrößern"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Compact Version (for mobile)
// ============================================================================

export function ReadingPreferencesCompact({ text, className }: ReadingPreferencesProps) {
  return <ReadingPreferences text={text} className={className} />;
}
