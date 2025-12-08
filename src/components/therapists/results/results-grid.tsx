"use client";

import { TherapistCard } from "./therapist-card";
import { BlogCard } from "./blog-card";
import { NoResults } from "./no-results";
import { Loader2 } from "lucide-react";
import type { SearchResult } from "@/types/therapist";

interface ResultsGridProps {
  results: SearchResult[];
  onClearFilters: () => void;
  isLoading?: boolean;
}

export function ResultsGrid({ results, onClearFilters, isLoading }: ResultsGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (results.length === 0) {
    return <NoResults onClearFilters={onClearFilters} />;
  }

  return (
    <div className="space-y-4" role="list" aria-label="Search results">
      {results.map((result) => (
        <div key={result.data.id} role="listitem">
          {result.type === "therapist" ? (
            <TherapistCard
              therapist={result.data}
              matchScore={result.matchScore}
            />
          ) : (
            <BlogCard post={result.data} />
          )}
        </div>
      ))}
    </div>
  );
}
