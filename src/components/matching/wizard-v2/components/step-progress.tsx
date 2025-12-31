"use client";

import { cn } from "@/lib/utils";
import { useWizardV2 } from "../wizard-context";

export function StepProgress() {
  const { computed } = useWizardV2();

  return (
    <div className="w-full space-y-2">
      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${computed.progress}%` }}
        />
      </div>

      {/* Step label */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">
          {computed.stepLabel}
        </span>
        <span className="text-gray-500">
          {computed.progress}%
        </span>
      </div>
    </div>
  );
}
