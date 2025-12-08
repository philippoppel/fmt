"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { demoBlogPosts } from "@/lib/data/demo-data";
import { searchTherapistsAction } from "@/lib/actions/search";
import { searchWithMatching } from "@/lib/actions/matching";
import type {
  FilterState,
  Therapist,
  MatchingCriteria,
  MatchedTherapist,
  BlogPost,
} from "@/types/therapist";

interface TherapistResult {
  therapist: Therapist;
  matchScore?: number;
}

interface SearchResultsSeparated {
  therapists: TherapistResult[];
  articles: BlogPost[];
  isLoading: boolean;
}

export function useSearchResults(
  filters: FilterState,
  matchingCriteria?: MatchingCriteria | null
): SearchResultsSeparated {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [matchedTherapists, setMatchedTherapists] = useState<MatchedTherapist[]>([]);
  const [matchedBlogs, setMatchedBlogs] = useState<BlogPost[]>([]);
  const [isPending, startTransition] = useTransition();

  // Fetch with matching if criteria provided
  useEffect(() => {
    if (matchingCriteria && matchingCriteria.selectedTopics.length > 0) {
      startTransition(async () => {
        const { therapists: matched, blogs } = await searchWithMatching(matchingCriteria);
        setMatchedTherapists(matched);
        setMatchedBlogs(blogs);
        setTherapists([]);
      });
      return;
    }

    // Clear matching results when not in matching mode
    setMatchedTherapists([]);
    setMatchedBlogs([]);

    if (filters.contentType === "blogs") {
      setTherapists([]);
      return;
    }

    startTransition(async () => {
      const data = await searchTherapistsAction(filters);
      setTherapists(data);
    });
  }, [
    matchingCriteria,
    filters.contentType,
    filters.searchQuery,
    filters.location,
    JSON.stringify(filters.specialties),
    JSON.stringify(filters.therapyTypes),
    JSON.stringify(filters.languages),
    filters.priceRange.min,
    filters.priceRange.max,
    filters.sessionType,
    JSON.stringify(filters.insurance),
    filters.availability,
    filters.gender,
    filters.minRating,
  ]);

  // Build separated results
  const separatedResults = useMemo(() => {
    // If in matching mode, use matched results
    if (matchedTherapists.length > 0 || matchedBlogs.length > 0) {
      const therapistResults: TherapistResult[] = matchedTherapists.map((t) => ({
        therapist: t,
        matchScore: t.matchScore,
      }));

      return {
        therapists: therapistResults,
        articles: matchedBlogs,
      };
    }

    // Normal mode - therapists
    const therapistResults: TherapistResult[] =
      filters.contentType === "blogs"
        ? []
        : therapists.map((t) => ({ therapist: t }));

    // Normal mode - blogs (demo data for now)
    let articles: BlogPost[] = [];
    if (filters.contentType === "all" || filters.contentType === "blogs") {
      articles = demoBlogPosts.filter((b) => {
        // Text search
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          if (
            !b.title.toLowerCase().includes(query) &&
            !b.excerpt.toLowerCase().includes(query) &&
            !b.author.name.toLowerCase().includes(query)
          ) {
            return false;
          }
        }

        // Specialties filter (matches blog category)
        if (filters.specialties.length > 0) {
          if (!filters.specialties.includes(b.category)) {
            return false;
          }
        }

        return true;
      });
    }

    return {
      therapists: therapistResults,
      articles,
    };
  }, [
    therapists,
    matchedTherapists,
    matchedBlogs,
    filters.contentType,
    filters.searchQuery,
    filters.specialties,
  ]);

  return {
    therapists: separatedResults.therapists,
    articles: separatedResults.articles,
    isLoading: isPending,
  };
}
