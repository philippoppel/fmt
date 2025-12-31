"use client";

import { cn } from "@/lib/utils";
import type { SeverityLevel } from "@/lib/matching/wizard-categories";

interface LikertScaleProps {
  value: SeverityLevel | null;
  onChange: (value: SeverityLevel) => void;
  disabled?: boolean;
}

const LIKERT_OPTIONS: { value: SeverityLevel; label: string }[] = [
  { value: 0, label: "Gar nicht" },
  { value: 1, label: "Etwas" },
  { value: 2, label: "Ziemlich" },
  { value: 3, label: "Sehr stark" },
];

export function LikertScale({ value, onChange, disabled = false }: LikertScaleProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {LIKERT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={cn(
            "px-3 py-3 rounded-lg border text-sm font-medium transition-all",
            "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            value === option.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
          )}
        >
          <span className="block text-lg mb-1">{option.value}</span>
          <span className="block text-xs opacity-80">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
