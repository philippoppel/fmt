"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface TextInputSectionProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minLength?: number;
}

/**
 * Text input section for case text
 */
export function TextInputSection({
  value,
  onChange,
  disabled = false,
  placeholder = "Beschreibe kurz, wie ein Klient sein Anliegen formulieren würde...",
  minLength = 20,
}: TextInputSectionProps) {
  const charCount = value.length;
  const isValid = charCount >= minLength;

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "min-h-[120px] resize-none text-base leading-relaxed",
          "focus-visible:ring-2 focus-visible:ring-primary"
        )}
        data-testid="case-text-input"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {!isValid && charCount > 0 && (
            <span className="text-amber-600">
              Noch {minLength - charCount} Zeichen...
            </span>
          )}
        </span>
        <span
          className={cn(
            charCount > 0 && !isValid && "text-amber-600",
            isValid && "text-green-600"
          )}
        >
          {charCount} Zeichen
        </span>
      </div>
    </div>
  );
}
