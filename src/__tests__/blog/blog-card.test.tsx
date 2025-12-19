import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogCard } from "@/components/blog/blog-card";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="mock-image" />
  ),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

const mockPost = {
  slug: "test-article",
  title: "Test Article Title",
  excerpt: "This is a test excerpt for the article.",
  summaryShort: "Short summary of the article.",
  featuredImage: "/test-image.jpg",
  featuredImageAlt: "Test image description",
  readingTimeMinutes: 5,
  isReviewed: false,
  publishedAt: new Date("2024-01-15"),
  author: {
    name: "Test Author",
    image: "/author.jpg",
  },
  categories: [
    {
      category: {
        slug: "mental-health",
        nameDE: "Psychische Gesundheit",
        nameEN: "Mental Health",
        color: "#4CAF50",
      },
    },
  ],
  _count: {
    comments: 3,
    bookmarks: 10,
  },
};

describe("BlogCard", () => {
  describe("Default variant", () => {
    it("renders title correctly", () => {
      render(<BlogCard post={mockPost} locale="de" />);
      expect(screen.getByText("Test Article Title")).toBeInTheDocument();
    });

    it("renders excerpt when available", () => {
      render(<BlogCard post={mockPost} locale="de" />);
      expect(
        screen.getByText("This is a test excerpt for the article.")
      ).toBeInTheDocument();
    });

    it("falls back to summaryShort when excerpt is null", () => {
      const postWithoutExcerpt = { ...mockPost, excerpt: null };
      render(<BlogCard post={postWithoutExcerpt} locale="de" />);
      expect(
        screen.getByText("Short summary of the article.")
      ).toBeInTheDocument();
    });

    it("displays reading time", () => {
      render(<BlogCard post={mockPost} locale="de" />);
      expect(screen.getByText("5 min")).toBeInTheDocument();
    });

    it("displays author name", () => {
      render(<BlogCard post={mockPost} locale="de" />);
      expect(screen.getByText("Test Author")).toBeInTheDocument();
    });

    it("generates correct href for German locale", () => {
      render(<BlogCard post={mockPost} locale="de" />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/blog/test-article");
    });

    it("generates correct href for English locale", () => {
      render(<BlogCard post={mockPost} locale="en" />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/en/blog/test-article");
    });

    it("displays category in German for de locale", () => {
      render(<BlogCard post={mockPost} locale="de" />);
      expect(screen.getByText("Psychische Gesundheit")).toBeInTheDocument();
    });

    it("displays category in English for en locale", () => {
      render(<BlogCard post={mockPost} locale="en" />);
      expect(screen.getByText("Mental Health")).toBeInTheDocument();
    });

    it("shows reviewed badge when isReviewed is true", () => {
      const reviewedPost = { ...mockPost, isReviewed: true };
      render(<BlogCard post={reviewedPost} locale="de" />);
      expect(screen.getByText("Geprüft")).toBeInTheDocument();
    });

    it("does not show reviewed badge when isReviewed is false", () => {
      render(<BlogCard post={mockPost} locale="de" />);
      expect(screen.queryByText("Geprüft")).not.toBeInTheDocument();
    });
  });

  describe("Featured variant", () => {
    it("renders with featured variant styling", () => {
      render(<BlogCard post={mockPost} locale="de" variant="featured" />);
      // Check for h2 instead of h3 in featured variant
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Test Article Title");
    });

    it("shows comment and bookmark counts in featured variant", () => {
      render(<BlogCard post={mockPost} locale="de" variant="featured" />);
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("displays formatted date in featured variant", () => {
      render(<BlogCard post={mockPost} locale="de" variant="featured" />);
      // Date format depends on locale
      expect(screen.getByText(/15.*2024|2024.*15/)).toBeInTheDocument();
    });

    it("shows expert reviewed badge in English for en locale", () => {
      const reviewedPost = { ...mockPost, isReviewed: true };
      render(<BlogCard post={reviewedPost} locale="en" variant="featured" />);
      expect(screen.getByText("Expert reviewed")).toBeInTheDocument();
    });
  });

  describe("Compact variant", () => {
    it("renders with compact layout", () => {
      render(<BlogCard post={mockPost} locale="de" variant="compact" />);
      // Compact variant uses h3
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("Test Article Title");
    });

    it("does not show excerpt in compact variant", () => {
      render(<BlogCard post={mockPost} locale="de" variant="compact" />);
      expect(
        screen.queryByText("This is a test excerpt for the article.")
      ).not.toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles missing featured image gracefully", () => {
      const postWithoutImage = { ...mockPost, featuredImage: null };
      render(<BlogCard post={postWithoutImage} locale="de" />);
      // Should still render title without crashing
      expect(screen.getByText("Test Article Title")).toBeInTheDocument();
      // No featured image wrapper (aspect ratio container)
      const images = screen.queryAllByTestId("mock-image");
      // Only author image should remain (if author.image is set)
      expect(images.length).toBeLessThanOrEqual(1);
    });

    it("handles missing publishedAt date", () => {
      const postWithoutDate = { ...mockPost, publishedAt: null };
      render(<BlogCard post={postWithoutDate} locale="de" variant="featured" />);
      // Should not throw and should render
      expect(screen.getByText("Test Article Title")).toBeInTheDocument();
    });

    it("handles empty categories array", () => {
      const postWithoutCategories = { ...mockPost, categories: [] };
      render(<BlogCard post={postWithoutCategories} locale="de" />);
      expect(screen.getByText("Test Article Title")).toBeInTheDocument();
    });

    it("handles missing author name", () => {
      const postWithoutAuthorName = {
        ...mockPost,
        author: { name: null, image: null },
      };
      render(<BlogCard post={postWithoutAuthorName} locale="de" />);
      expect(screen.getByText("Test Article Title")).toBeInTheDocument();
    });
  });
});
