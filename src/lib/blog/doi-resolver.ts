/**
 * DOI Resolver - Fetches bibliographic data from CrossRef API
 * and formats citations in APA style
 */

export interface DOIMetadata {
  title: string;
  authors: string[];
  journal?: string;
  year?: number;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  url: string;
  doi: string;
  type: string;
}

interface CrossRefAuthor {
  family?: string;
  given?: string;
  name?: string;
}

interface CrossRefWork {
  title?: string[];
  author?: CrossRefAuthor[];
  "container-title"?: string[];
  published?: {
    "date-parts"?: number[][];
  };
  volume?: string;
  issue?: string;
  page?: string;
  publisher?: string;
  URL?: string;
  DOI?: string;
  type?: string;
}

/**
 * Resolve a DOI to bibliographic metadata using CrossRef API
 */
export async function resolveDOI(doi: string): Promise<DOIMetadata | null> {
  // Clean up DOI
  const cleanDOI = doi
    .replace(/^https?:\/\/doi\.org\//i, "")
    .replace(/^doi:/i, "")
    .trim();

  if (!cleanDOI) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(cleanDOI)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "FMT-Blog/1.0 (mailto:info@fmt.app)",
        },
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    );

    if (!response.ok) {
      console.error(`DOI resolution failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const work: CrossRefWork = data.message;

    return {
      title: work.title?.[0] || "",
      authors: formatAuthors(work.author),
      journal: work["container-title"]?.[0],
      year: work.published?.["date-parts"]?.[0]?.[0],
      volume: work.volume,
      issue: work.issue,
      pages: work.page,
      publisher: work.publisher,
      url: work.URL || `https://doi.org/${cleanDOI}`,
      doi: cleanDOI,
      type: mapCrossRefType(work.type),
    };
  } catch (error) {
    console.error("DOI resolution error:", error);
    return null;
  }
}

/**
 * Format authors from CrossRef data
 */
function formatAuthors(authors?: CrossRefAuthor[]): string[] {
  if (!authors || authors.length === 0) {
    return [];
  }

  return authors.map((author) => {
    if (author.name) {
      return author.name;
    }
    const family = author.family || "";
    const given = author.given || "";
    // Format: "Family, G." (APA style)
    const initials = given
      .split(/[\s-]+/)
      .map((part) => part.charAt(0).toUpperCase() + ".")
      .join(" ");
    return `${family}, ${initials}`.trim();
  });
}

/**
 * Map CrossRef type to simplified type
 */
function mapCrossRefType(type?: string): string {
  const typeMap: Record<string, string> = {
    "journal-article": "article",
    "book-chapter": "chapter",
    book: "book",
    "proceedings-article": "conference",
    dissertation: "thesis",
    report: "report",
    dataset: "dataset",
  };
  return typeMap[type || ""] || "article";
}

/**
 * Format citation in APA 7th edition style
 */
export function formatAPA(meta: DOIMetadata): string {
  const parts: string[] = [];

  // Authors
  if (meta.authors.length > 0) {
    if (meta.authors.length <= 2) {
      parts.push(meta.authors.join(" & "));
    } else if (meta.authors.length <= 20) {
      const last = meta.authors[meta.authors.length - 1];
      parts.push(meta.authors.slice(0, -1).join(", ") + ", & " + last);
    } else {
      // More than 20 authors: first 19, ..., last
      parts.push(
        meta.authors.slice(0, 19).join(", ") +
          ", ... " +
          meta.authors[meta.authors.length - 1]
      );
    }
  }

  // Year
  parts.push(`(${meta.year || "n.d."})`);

  // Title
  parts.push(meta.title + ".");

  // Journal/Source (italicized in display)
  if (meta.journal) {
    let source = `*${meta.journal}*`;
    if (meta.volume) {
      source += `, *${meta.volume}*`;
      if (meta.issue) {
        source += `(${meta.issue})`;
      }
    }
    if (meta.pages) {
      source += `, ${meta.pages}`;
    }
    source += ".";
    parts.push(source);
  } else if (meta.publisher) {
    parts.push(`${meta.publisher}.`);
  }

  // DOI
  parts.push(`https://doi.org/${meta.doi}`);

  return parts.join(" ");
}

/**
 * Generate inline citation key (e.g., "smith2023")
 */
export function generateInlineKey(meta: DOIMetadata): string {
  const firstAuthor = meta.authors[0] || "unknown";
  const lastName = firstAuthor.split(",")[0].toLowerCase().replace(/\s+/g, "");
  const year = meta.year || "nd";
  return `${lastName}${year}`;
}

/**
 * Format inline citation text for display (e.g., "(Smith, 2023)")
 */
export function formatInlineCitation(meta: DOIMetadata): string {
  const firstAuthor = meta.authors[0] || "Unknown";
  const lastName = firstAuthor.split(",")[0];

  if (meta.authors.length === 1) {
    return `(${lastName}, ${meta.year || "n.d."})`;
  } else if (meta.authors.length === 2) {
    const secondAuthor = meta.authors[1].split(",")[0];
    return `(${lastName} & ${secondAuthor}, ${meta.year || "n.d."})`;
  } else {
    return `(${lastName} et al., ${meta.year || "n.d."})`;
  }
}

/**
 * Validate DOI format
 */
export function isValidDOI(doi: string): boolean {
  // DOI format: 10.prefix/suffix
  const doiPattern = /^10\.\d{4,}\/[^\s]+$/;
  const cleanDOI = doi
    .replace(/^https?:\/\/doi\.org\//i, "")
    .replace(/^doi:/i, "")
    .trim();
  return doiPattern.test(cleanDOI);
}
