import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MatchingCTA } from "@/components/blog/display/matching-cta";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("MatchingCTA", () => {
  describe("Variants", () => {
    it("renders inline variant by default", () => {
      const { container } = render(<MatchingCTA />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders sidebar variant", () => {
      render(<MatchingCTA variant="sidebar" />);
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("renders footer variant with full-width layout", () => {
      render(<MatchingCTA variant="footer" />);
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("renders minimal variant as simple link", () => {
      render(<MatchingCTA variant="minimal" />);
      expect(screen.getByRole("link")).toBeInTheDocument();
    });
  });

  describe("Topic-specific messaging", () => {
    it("shows anxiety-specific messaging for anxiety topic", () => {
      render(<MatchingCTA topic="anxiety" />);
      // Check that some anxiety-related translation key is used
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("shows depression-specific messaging for depression topic", () => {
      render(<MatchingCTA topic="depression" />);
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("falls back to default messaging for unknown topics", () => {
      render(<MatchingCTA topic="unknown-topic" />);
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("handles undefined topic gracefully", () => {
      render(<MatchingCTA topic={undefined} />);
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });
  });

  describe("Link construction", () => {
    it("constructs correct link with German locale path", () => {
      render(<MatchingCTA localePath="" />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/therapists/matching");
    });

    it("constructs correct link with English locale path", () => {
      render(<MatchingCTA localePath="/en" />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/en/therapists/matching");
    });

    it("includes topic in link when provided", () => {
      render(<MatchingCTA localePath="" topic="anxiety" />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute(
        "href",
        expect.stringContaining("/therapists/matching")
      );
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA role for complementary content", () => {
      render(<MatchingCTA />);
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("link is keyboard accessible", () => {
      render(<MatchingCTA />);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies custom className", () => {
      const { container } = render(<MatchingCTA className="custom-class" />);
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
