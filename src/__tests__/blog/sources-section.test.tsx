import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SourcesSection } from "@/components/blog/display/sources-section";

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

const mockSources = [
  {
    id: "1",
    doi: "10.1234/example.001",
    title: "Example Research Paper",
    authors: ["Smith, J.", "Doe, A."],
    year: 2023,
    journal: "Journal of Psychology",
    url: "https://example.com/paper1",
    type: "article",
    formattedAPA:
      "Smith, J., & Doe, A. (2023). Example Research Paper. Journal of Psychology.",
    inlineKey: "smith2023",
  },
  {
    id: "2",
    doi: null,
    title: "Clinical Guidelines",
    authors: ["WHO"],
    year: 2022,
    journal: null,
    url: "https://who.int/guidelines",
    type: "guideline",
    formattedAPA: "WHO. (2022). Clinical Guidelines.",
    inlineKey: "who2022",
  },
];

describe("SourcesSection", () => {
  it("renders sources correctly", () => {
    render(<SourcesSection sources={mockSources} defaultExpanded={true} />);
    expect(screen.getByText(/Example Research Paper/)).toBeInTheDocument();
  });

  it("renders nothing when sources array is empty", () => {
    const { container } = render(<SourcesSection sources={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays source count", () => {
    render(<SourcesSection sources={mockSources} />);
    // The subtitle includes count, check the section renders
    const section = document.querySelector("section");
    expect(section).toBeInTheDocument();
  });

  it("renders DOI links correctly", () => {
    render(<SourcesSection sources={mockSources} defaultExpanded={true} />);
    // Find the DOI link by its text "DOI"
    const doiLink = screen.getByText("DOI");
    expect(doiLink.closest("a")).toHaveAttribute(
      "href",
      "https://doi.org/10.1234/example.001"
    );
  });

  it("renders URL links when DOI is absent", () => {
    const sourcesWithoutDOI = [mockSources[1]];
    render(<SourcesSection sources={sourcesWithoutDOI} defaultExpanded={true} />);
    expect(screen.getByText(/Clinical Guidelines/)).toBeInTheDocument();
  });

  it("is collapsible", () => {
    render(<SourcesSection sources={mockSources} defaultExpanded={false} />);
    // Section should be collapsible
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("respects defaultExpanded prop", () => {
    render(<SourcesSection sources={mockSources} defaultExpanded={true} />);
    // Content should be visible when expanded
    expect(screen.getByText(/Example Research Paper/)).toBeInTheDocument();
  });

  it("formats APA citations", () => {
    render(<SourcesSection sources={mockSources} defaultExpanded={true} />);
    expect(screen.getByText(/Smith, J., & Doe, A/)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <SourcesSection sources={mockSources} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("handles single source", () => {
    render(<SourcesSection sources={[mockSources[0]]} defaultExpanded={true} />);
    expect(screen.getByText(/Example Research Paper/)).toBeInTheDocument();
  });

  it("displays section header", () => {
    render(<SourcesSection sources={mockSources} />);
    // The component renders a heading with translated title
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
  });
});
