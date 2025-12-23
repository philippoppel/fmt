"use client";

import { useState, useEffect } from "react";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ScheduleDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

// Generate time slots in 15-minute intervals
const TIME_SLOTS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  return {
    value: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
    label: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} Uhr`,
  };
}).filter((slot) => {
  // Only show slots between 6:00 and 22:00
  const hour = parseInt(slot.value.split(":")[0]);
  return hour >= 6 && hour <= 22;
});

export function ScheduleDatePicker({ value, onChange }: ScheduleDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ?? undefined
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    value ? format(value, "HH:mm") : "09:00"
  );

  // Update parent when date or time changes
  useEffect(() => {
    if (selectedDate) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const newDate = setMinutes(setHours(selectedDate, hours), minutes);
      onChange(newDate);
    } else {
      onChange(null);
    }
  }, [selectedDate, selectedTime, onChange]);

  // Quick select buttons
  const quickSelects = [
    { label: "Morgen 9:00", date: setHours(setMinutes(addDays(new Date(), 1), 0), 9) },
    { label: "Morgen 18:00", date: setHours(setMinutes(addDays(new Date(), 1), 0), 18) },
    { label: "In 3 Tagen", date: setHours(setMinutes(addDays(new Date(), 3), 0), 9) },
    { label: "In 1 Woche", date: setHours(setMinutes(addDays(new Date(), 7), 0), 9) },
  ];

  const handleQuickSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(format(date, "HH:mm"));
  };

  return (
    <div className="space-y-4">
      {/* Quick Select */}
      <div className="flex flex-wrap gap-2">
        {quickSelects.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => handleQuickSelect(option.date)}
            className="px-3 py-1.5 text-xs border rounded-full hover:bg-muted transition-colors"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Calendar */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Datum</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={de}
            disabled={(date: Date) => date < new Date()}
            className="rounded-md border"
          />
        </div>

        {/* Time Select */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Uhrzeit</Label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger>
              <SelectValue placeholder="Uhrzeit wählen" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {TIME_SLOTS.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  {slot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedDate && (
            <p className="mt-4 text-sm text-muted-foreground">
              Veröffentlichung am{" "}
              <span className="font-medium text-foreground">
                {format(selectedDate, "EEEE, d. MMMM yyyy", { locale: de })}
              </span>{" "}
              um{" "}
              <span className="font-medium text-foreground">{selectedTime} Uhr</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
