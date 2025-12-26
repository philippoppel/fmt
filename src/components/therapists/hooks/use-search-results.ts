"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { demoBlogPosts } from "@/lib/data/demo-data";
import { searchTherapistsAction } from "@/lib/actions/search";
import { searchWithMatching, type AdditionalFilters } from "@/lib/actions/matching";
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
  scoreBreakdown?: import("@/types/therapist").ScoreBreakdown;
}

interface SearchResultsSeparated {
  therapists: TherapistResult[];
  articles: BlogPost[];
  isLoading: boolean;
  error?: string;
  alternativeTherapists?: Therapist[];
}

export function useSearchResults(
  filters: FilterState,
  matchingCriteria?: MatchingCriteria | null
): SearchResultsSeparated {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [allTherapists, setAllTherapists] = useState<Therapist[]>([]);
  const [matchedTherapists, setMatchedTherapists] = useState<MatchedTherapist[]>([]);
  const [matchedBlogs, setMatchedBlogs] = useState<BlogPost[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [initialized, setInitialized] = useState(false);

  // Load all therapists once for alternatives when no results
  useEffect(() => {
    const loadAllTherapists = async () => {
      try {
        const defaultFilters: FilterState = {
          contentType: "all",
          searchQuery: "",
          location: "",
          specialties: [],
          therapyTypes: [],
          languages: [],
          priceRange: { min: 0, max: 300 },
          sessionType: null,
          insurance: [],
          availability: null,
          gender: null,
          minRating: 0,
        };
        const data = await searchTherapistsAction(defaultFilters);
        setAllTherapists(data);
      } catch {
        // Silently fail - alternatives are optional
      }
    };
    loadAllTherapists();
  }, []);

  // Fetch with matching if criteria provided
  useEffect(() => {
    setError(undefined);

    if (matchingCriteria && matchingCriteria.selectedTopics.length > 0) {
      // Build additional filters from current filter state
      const additionalFilters: AdditionalFilters = {
        location: filters.location || undefined,
        gender: filters.gender,
        sessionType: filters.sessionType,
        insurance: filters.insurance.length > 0 ? filters.insurance : undefined,
        priceRange: filters.priceRange,
        minRating: filters.minRating,
        therapyTypes: filters.therapyTypes.length > 0 ? filters.therapyTypes : undefined,
      };

      startTransition(async () => {
        try {
          const { therapists: matched, blogs } = await searchWithMatching(
            matchingCriteria,
            additionalFilters
          );
          setMatchedTherapists(matched);
          setMatchedBlogs(blogs);
          setTherapists([]);
        } catch (err) {
          console.error("Error fetching matched therapists:", err);
          setError("Failed to load therapists. Please try again.");
          setMatchedTherapists([]);
          setMatchedBlogs([]);
        } finally {
          setInitialized(true);
        }
      });
      return;
    }

    // Clear matching results when not in matching mode
    setMatchedTherapists([]);
    setMatchedBlogs([]);

    if (filters.contentType === "blogs") {
      setTherapists([]);
      setInitialized(true);
      return;
    }

    startTransition(async () => {
      try {
        const data = await searchTherapistsAction(filters);
        setTherapists(data);
      } catch (err) {
        console.error("Error fetching therapists:", err);
        setError("Failed to load therapists. Please try again.");
        setTherapists([]);
      } finally {
        setInitialized(true);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        scoreBreakdown: t.scoreBreakdown,
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

  // Determine alternatives if no results found
  const alternativeTherapists = useMemo(() => {
    const hasResults =
      separatedResults.therapists.length > 0 || separatedResults.articles.length > 0;
    if (hasResults) return undefined;

    // Return random selection of all therapists as alternatives
    return allTherapists
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }, [separatedResults.therapists.length, separatedResults.articles.length, allTherapists]);

  return {
    therapists: separatedResults.therapists,
    articles: separatedResults.articles,
    isLoading: isPending || !initialized,
    error,
    alternativeTherapists,
  };
}
