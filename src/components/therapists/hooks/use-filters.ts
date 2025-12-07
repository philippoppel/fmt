"use client";

import { useState, useCallback, useMemo } from "react";
import {
  defaultFilters,
  type FilterState,
  type ContentType,
  type Specialty,
  type TherapyType,
  type Language,
  type SessionType,
  type Insurance,
  type Availability,
  type Gender,
} from "@/types/therapist";

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.contentType !== "all") count++;
    if (filters.searchQuery) count++;
    if (filters.location) count++;
    if (filters.specialties.length > 0) count++;
    if (filters.therapyTypes.length > 0) count++;
    if (filters.languages.length > 0) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 300) count++;
    if (filters.sessionType !== null) count++;
    if (filters.insurance.length > 0) count++;
    if (filters.availability !== null) count++;
    if (filters.gender !== null) count++;
    if (filters.minRating > 0) count++;
    return count;
  }, [filters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    activeFilterCount,
  };
}
