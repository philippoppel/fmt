import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KeyTakeaways } from "@/components/blog/display/key-takeaways";

describe("KeyTakeaways", () => {
  const mockTakeaways = [
    "First key takeaway point",
    "Second key takeaway point",
    "Third key takeaway point",
  ];

  it("renders all takeaways", () => {
    render(<KeyTakeaways takeaways={mockTakeaways} />);

    mockTakeaways.forEach((takeaway) => {
      expect(screen.getByText(takeaway)).toBeInTheDocument();
    });
  });

  it("renders nothing when takeaways array is empty", () => {
    const { container } = render(<KeyTakeaways takeaways={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the section title from translations", () => {
    render(<KeyTakeaways takeaways={mockTakeaways} />);
    // The mocked translation returns the key path
    expect(screen.getByText(/keyTakeaways\.title/)).toBeInTheDocument();
  });

  it("renders with proper ARIA role", () => {
    render(<KeyTakeaways takeaways={mockTakeaways} />);
    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <KeyTakeaways takeaways={mockTakeaways} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders check icons for each takeaway", () => {
    render(<KeyTakeaways takeaways={mockTakeaways} />);
    // Each takeaway should have a list item
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(mockTakeaways.length);
  });

  it("handles single takeaway", () => {
    render(<KeyTakeaways takeaways={["Single takeaway"]} />);
    expect(screen.getByText("Single takeaway")).toBeInTheDocument();
  });

  it("handles many takeaways", () => {
    const manyTakeaways = Array.from(
      { length: 10 },
      (_, i) => `Takeaway ${i + 1}`
    );
    render(<KeyTakeaways takeaways={manyTakeaways} />);

    manyTakeaways.forEach((takeaway) => {
      expect(screen.getByText(takeaway)).toBeInTheDocument();
    });
  });

  it("preserves takeaway order", () => {
    render(<KeyTakeaways takeaways={mockTakeaways} />);
    const items = screen.getAllByRole("listitem");

    items.forEach((item, index) => {
      expect(item).toHaveTextContent(mockTakeaways[index]);
    });
  });
});
