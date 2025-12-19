import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleInfoBox } from "@/components/blog/display/article-info-box";

describe("ArticleInfoBox", () => {
  it("renders target audience when provided", () => {
    render(
      <ArticleInfoBox targetAudience="Menschen, die Angststörungen verstehen möchten" />
    );
    expect(
      screen.getByText("Menschen, die Angststörungen verstehen möchten")
    ).toBeInTheDocument();
  });

  it("renders learning outcome when provided", () => {
    render(
      <ArticleInfoBox learningOutcome="Du verstehst die Grundlagen der Angstbewältigung" />
    );
    expect(
      screen.getByText("Du verstehst die Grundlagen der Angstbewältigung")
    ).toBeInTheDocument();
  });

  it("renders both fields when provided", () => {
    render(
      <ArticleInfoBox
        targetAudience="Betroffene und Angehörige"
        learningOutcome="Praktische Tipps für den Alltag"
      />
    );
    expect(
      screen.getByText("Betroffene und Angehörige")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Praktische Tipps für den Alltag")
    ).toBeInTheDocument();
  });

  it("renders nothing when both fields are empty", () => {
    const { container } = render(<ArticleInfoBox />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when both fields are null", () => {
    const { container } = render(
      <ArticleInfoBox targetAudience={null} learningOutcome={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders only target audience when learning outcome is null", () => {
    render(
      <ArticleInfoBox
        targetAudience="Alle Interessierten"
        learningOutcome={null}
      />
    );
    expect(screen.getByText("Alle Interessierten")).toBeInTheDocument();
    expect(screen.queryByText(/learningOutcome/i)).not.toBeInTheDocument();
  });

  it("renders only learning outcome when target audience is null", () => {
    render(
      <ArticleInfoBox
        targetAudience={null}
        learningOutcome="Wichtige Erkenntnisse"
      />
    );
    expect(screen.getByText("Wichtige Erkenntnisse")).toBeInTheDocument();
    expect(screen.queryByText(/targetAudience/i)).not.toBeInTheDocument();
  });

  it("has proper ARIA role", () => {
    render(
      <ArticleInfoBox targetAudience="Test audience" />
    );
    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ArticleInfoBox
        targetAudience="Test"
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("displays section headers from translations", () => {
    render(
      <ArticleInfoBox
        targetAudience="Test audience"
        learningOutcome="Test outcome"
      />
    );
    // Mocked translations return the key path
    expect(screen.getByText(/targetAudience/)).toBeInTheDocument();
    expect(screen.getByText(/learningOutcome/)).toBeInTheDocument();
  });

  it("renders with proper grid layout for both fields", () => {
    const { container } = render(
      <ArticleInfoBox
        targetAudience="Test audience"
        learningOutcome="Test outcome"
      />
    );
    // Should have grid classes for two-column layout
    expect(container.firstChild).toHaveClass("grid");
  });
});
