"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, Volume2, Settings } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TextToSpeechProps {
  text: string;
  className?: string;
}

export function TextToSpeech({ text, className }: TextToSpeechProps) {
  const t = useTranslations("blog.a11y.textToSpeech");
  const locale = useLocale();

  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support
  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  // Load voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const langCode = locale === "de" ? "de" : "en";

      // Filter voices by language
      const filteredVoices = availableVoices.filter((voice) =>
        voice.lang.startsWith(langCode)
      );

      setVoices(filteredVoices.length > 0 ? filteredVoices : availableVoices);

      // Select default voice
      if (!selectedVoice && filteredVoices.length > 0) {
        // Prefer native voices
        const preferredVoice =
          filteredVoices.find((v) => v.localService) || filteredVoices[0];
        setSelectedVoice(preferredVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [isSupported, locale, selectedVoice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const createUtterance = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale === "de" ? "de-DE" : "en-US";
    utterance.rate = rate;
    utterance.pitch = 1;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    return utterance;
  }, [text, locale, rate, selectedVoice]);

  const play = useCallback(() => {
    if (!isSupported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      window.speechSynthesis.cancel();
      const utterance = createUtterance();
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  }, [isSupported, isPaused, createUtterance]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [isSupported]);

  if (!isSupported) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg border bg-card",
        className
      )}
      role="region"
      aria-label={t("play")}
    >
      <Volume2
        className="h-4 w-4 text-muted-foreground shrink-0"
        aria-hidden="true"
      />

      {/* Play/Pause Button */}
      {!isPlaying ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={play}
          aria-label={isPaused ? "Fortsetzen" : t("play")}
          className="h-8"
        >
          <Play className="h-4 w-4 mr-1" aria-hidden="true" />
          {isPaused ? "Fortsetzen" : t("play")}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={pause}
          aria-label={t("pause")}
          className="h-8"
        >
          <Pause className="h-4 w-4 mr-1" aria-hidden="true" />
          {t("pause")}
        </Button>
      )}

      {/* Stop Button */}
      {(isPlaying || isPaused) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={stop}
          aria-label={t("stop")}
          className="h-8 w-8"
        >
          <Square className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}

      {/* Settings */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-auto"
            aria-label="Spracheinstellungen"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tts-rate">
                Geschwindigkeit: {rate.toFixed(1)}x
              </Label>
              <Slider
                id="tts-rate"
                min={0.5}
                max={2}
                step={0.1}
                value={[rate]}
                onValueChange={([value]) => setRate(value)}
              />
            </div>

            {voices.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="tts-voice">Stimme</Label>
                <select
                  id="tts-voice"
                  value={selectedVoice?.name || ""}
                  onChange={(e) => {
                    const voice = voices.find((v) => v.name === e.target.value);
                    setSelectedVoice(voice || null);
                  }}
                  className="w-full h-9 px-3 rounded-md border bg-background text-sm"
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
    </div>
  );
}
