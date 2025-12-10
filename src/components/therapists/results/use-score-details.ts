import { useCallback } from "react";
import { useTranslations } from "next-intl";

const toCamelCase = (value: string) =>
  value.replace(/_([a-z])/g, (_, char) => char.toUpperCase());

export function useScoreDetailsFormatter() {
  const tSpec = useTranslations("therapists.specialties");
  const tSubtopics = useTranslations("matching.subtopics");
  const tSessionType = useTranslations("therapists.filters.sessionType");
  const tGender = useTranslations("therapists.filters.gender");
  const tInsurance = useTranslations("therapists.filters.insurance");
  const tStyle = useTranslations("matching.quiz");
  const tDetails = useTranslations("matching.scoreBreakdownDetails");

  const translateToken = useCallback(
    (token: string): string => {
      const normalized = token.trim();
      if (!normalized) return "";

      if (tSpec.has(normalized)) {
        return tSpec(normalized);
      }

      const camelKey = toCamelCase(normalized);
      if (tSubtopics.has(camelKey)) {
        return tSubtopics(camelKey);
      }

      const yearsMatch = normalized.match(/^(\d+)\s+years\s+experience$/i);
      if (yearsMatch) {
        const years = Number.parseInt(yearsMatch[1], 10);
        return tDetails("yearsExperience", { count: years });
      }

      if (["directive", "balanced", "empathetic"].includes(normalized)) {
        return tStyle(`communication.${normalized}`);
      }

      if (normalized === "homework") return tDetails("homework");
      if (normalized === "noHomework") return tDetails("noHomework");

      if (tSessionType.has(normalized)) return tSessionType(normalized);
      if (tGender.has(normalized)) return tGender(normalized);
      if (tInsurance.has(normalized)) return tInsurance(normalized);

      if (["image", "description", "verified", "premium"].includes(normalized)) {
        return tDetails(normalized);
      }

      // Fallback: show a readable token instead of an ID
      return normalized.replace(/_/g, " ");
    },
    [tDetails, tGender, tInsurance, tSessionType, tSpec, tStyle, tSubtopics]
  );

  const formatDetails = useCallback(
    (details?: string): string => {
      if (!details) return "";
      const tokens = details
        .split(",")
        .map(translateToken)
        .filter(Boolean);
      return tokens.join(", ");
    },
    [translateToken]
  );

  return formatDetails;
}
