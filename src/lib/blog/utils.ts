/**
 * Blog utility functions
 */

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-|-$/g, "");
}

/**
 * Calculate estimated reading time in minutes
 * Based on average reading speed of 200 words per minute
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = countWords(text);
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Count words in a text
 */
export function countWords(text: string): number {
  return text
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((word) => word.length > 0).length;
}

/**
 * Extract plain text from TipTap JSON content
 */
export function extractTextFromTipTap(json: TipTapNode): string {
  if (!json) return "";

  let text = "";

  if (json.text) {
    text += json.text;
  }

  if (json.content && Array.isArray(json.content)) {
    for (const node of json.content) {
      text += extractTextFromTipTap(node);
      // Add space/newline after block elements
      if (["paragraph", "heading", "listItem", "blockquote"].includes(node.type || "")) {
        text += " ";
      }
    }
  }

  return text;
}

/**
 * Extract headings from TipTap JSON for Table of Contents
 */
export function extractHeadings(json: TipTapNode): TOCHeading[] {
  const headings: TOCHeading[] = [];

  function traverse(node: TipTapNode) {
    if (node.type === "heading" && node.attrs?.level) {
      const level = node.attrs.level as 1 | 2 | 3 | 4 | 5 | 6;
      // Only include h2 and h3 for TOC
      if (level === 2 || level === 3) {
        const text = extractTextFromTipTap(node).trim();
        if (text) {
          headings.push({
            id: generateSlug(text),
            text,
            level,
          });
        }
      }
    }

    if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        traverse(child);
      }
    }
  }

  traverse(json);
  return headings;
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(text: string, maxLength: number = 160): string {
  const cleanText = text
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  // Find last complete word within limit
  const truncated = cleanText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + "..."
    : truncated + "...";
}

/**
 * Format date for display
 */
export function formatDate(date: Date, locale: string = "de"): string {
  return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date, locale: string = "de"): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffDay > 30) {
    return formatDate(date, locale);
  } else if (diffDay > 0) {
    return rtf.format(-diffDay, "day");
  } else if (diffHour > 0) {
    return rtf.format(-diffHour, "hour");
  } else if (diffMin > 0) {
    return rtf.format(-diffMin, "minute");
  } else {
    return rtf.format(-diffSec, "second");
  }
}

// Types
export interface TipTapNode {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

export interface TOCHeading {
  id: string;
  text: string;
  level: 2 | 3;
}
