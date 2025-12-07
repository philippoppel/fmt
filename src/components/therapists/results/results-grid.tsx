"use client";

import { TherapistCard } from "./therapist-card";
import { BlogCard } from "./blog-card";
import { NoResults } from "./no-results";
import type { SearchResult } from "@/types/therapist";

interface ResultsGridProps {
  results: SearchResult[];
  onClearFilters: () => void;
}

export function ResultsGrid({ results, onClearFilters }: ResultsGridProps) {
  if (results.length === 0) {
    return <NoResults onClearFilters={onClearFilters} />;
  }

  return (
    <div className="space-y-4" role="list" aria-label="Search results">
      {results.map((result) => (
        <div key={result.data.id} role="listitem">
          {result.type === "therapist" ? (
            <TherapistCard therapist={result.data} />
          ) : (
            <BlogCard post={result.data} />
          )}
        </div>
      ))}
    </div>
  );
}
