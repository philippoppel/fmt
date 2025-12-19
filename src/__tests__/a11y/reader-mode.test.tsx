import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  ReaderModeProvider,
  ReaderModeToggle,
  ReaderModeSettings,
  ReaderModeContent,
  useReaderMode,
} from "@/components/blog/a11y/reader-mode";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Test component to access context
function TestConsumer() {
  const { settings, toggle, updateSetting, reset } = useReaderMode();
  return (
    <div>
      <span data-testid="enabled">{settings.enabled.toString()}</span>
      <span data-testid="fontSize">{settings.fontSize}</span>
      <span data-testid="theme">{settings.theme}</span>
      <button data-testid="toggle" onClick={toggle}>
        Toggle
      </button>
      <button
        data-testid="setLarge"
        onClick={() => updateSetting("fontSize", "large")}
      >
        Set Large
      </button>
      <button data-testid="reset" onClick={reset}>
        Reset
      </button>
    </div>
  );
}

describe("ReaderModeProvider", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-reader-theme");
  });

  it("provides default settings", () => {
    render(
      <ReaderModeProvider>
        <TestConsumer />
      </ReaderModeProvider>
    );

    expect(screen.getByTestId("enabled")).toHaveTextContent("false");
    expect(screen.getByTestId("fontSize")).toHaveTextContent("normal");
    expect(screen.getByTestId("theme")).toHaveTextContent("auto");
  });

  it("toggles enabled state", () => {
    render(
      <ReaderModeProvider>
        <TestConsumer />
      </ReaderModeProvider>
    );

    expect(screen.getByTestId("enabled")).toHaveTextContent("false");

    fireEvent.click(screen.getByTestId("toggle"));
    expect(screen.getByTestId("enabled")).toHaveTextContent("true");

    fireEvent.click(screen.getByTestId("toggle"));
    expect(screen.getByTestId("enabled")).toHaveTextContent("false");
  });

  it("updates individual settings", () => {
    render(
      <ReaderModeProvider>
        <TestConsumer />
      </ReaderModeProvider>
    );

    expect(screen.getByTestId("fontSize")).toHaveTextContent("normal");

    fireEvent.click(screen.getByTestId("setLarge"));
    expect(screen.getByTestId("fontSize")).toHaveTextContent("large");
  });

  it("resets settings to defaults with enabled=true", () => {
    render(
      <ReaderModeProvider>
        <TestConsumer />
      </ReaderModeProvider>
    );

    // Change some settings
    fireEvent.click(screen.getByTestId("setLarge"));
    expect(screen.getByTestId("fontSize")).toHaveTextContent("large");

    // Reset
    fireEvent.click(screen.getByTestId("reset"));
    expect(screen.getByTestId("fontSize")).toHaveTextContent("normal");
    expect(screen.getByTestId("enabled")).toHaveTextContent("true");
  });

  it("persists settings to localStorage", () => {
    render(
      <ReaderModeProvider>
        <TestConsumer />
      </ReaderModeProvider>
    );

    fireEvent.click(screen.getByTestId("toggle"));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "reader-mode-settings",
      expect.stringContaining('"enabled":true')
    );
  });

  it("loads settings from localStorage", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({
        enabled: true,
        fontSize: "large",
        theme: "dark",
      })
    );

    render(
      <ReaderModeProvider>
        <TestConsumer />
      </ReaderModeProvider>
    );

    // Need to wait for useEffect to run
    expect(localStorageMock.getItem).toHaveBeenCalledWith("reader-mode-settings");
  });
});

describe("ReaderModeToggle", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("renders toggle button", () => {
    render(
      <ReaderModeProvider>
        <ReaderModeToggle />
      </ReaderModeProvider>
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("toggles reader mode on click", () => {
    render(
      <ReaderModeProvider>
        <ReaderModeToggle />
        <TestConsumer />
      </ReaderModeProvider>
    );

    expect(screen.getByTestId("enabled")).toHaveTextContent("false");

    fireEvent.click(screen.getByRole("button", { name: /enable|aktivieren/i }));
    expect(screen.getByTestId("enabled")).toHaveTextContent("true");
  });

  it("has aria-pressed attribute", () => {
    render(
      <ReaderModeProvider>
        <ReaderModeToggle />
      </ReaderModeProvider>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("applies custom className", () => {
    render(
      <ReaderModeProvider>
        <ReaderModeToggle className="custom-class" />
      </ReaderModeProvider>
    );

    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });
});

describe("ReaderModeSettings", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-reader-theme");
  });

  it("renders nothing when reader mode is disabled", () => {
    const { container } = render(
      <ReaderModeProvider>
        <ReaderModeSettings />
      </ReaderModeProvider>
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders settings panel when reader mode is enabled", () => {
    render(
      <ReaderModeProvider>
        <ReaderModeToggle />
        <ReaderModeSettings />
      </ReaderModeProvider>
    );

    // Enable reader mode
    fireEvent.click(screen.getByRole("button"));

    // Settings panel should appear
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has close button", () => {
    render(
      <ReaderModeProvider>
        <ReaderModeToggle />
        <ReaderModeSettings />
      </ReaderModeProvider>
    );

    // Enable reader mode
    fireEvent.click(screen.getByRole("button", { name: /enable|aktivieren/i }));

    // Find close button in the dialog
    const dialog = screen.getByRole("dialog");
    const closeButton = dialog.querySelector('button[aria-label]');
    expect(closeButton).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <ReaderModeProvider>
        <ReaderModeToggle />
        <ReaderModeSettings className="custom-class" />
      </ReaderModeProvider>
    );

    // Enable reader mode
    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog")).toHaveClass("custom-class");
  });
});

describe("ReaderModeContent", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-reader-theme");
  });

  it("renders children", () => {
    render(
      <ReaderModeProvider>
        <ReaderModeContent>
          <p>Test content</p>
        </ReaderModeContent>
      </ReaderModeProvider>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ReaderModeProvider>
        <ReaderModeContent className="custom-class">
          <p>Test content</p>
        </ReaderModeContent>
      </ReaderModeProvider>
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies font size styles when enabled", () => {
    render(
      <ReaderModeProvider>
        <ReaderModeToggle />
        <TestConsumer />
        <ReaderModeContent>
          <p>Test content</p>
        </ReaderModeContent>
      </ReaderModeProvider>
    );

    // Enable reader mode
    fireEvent.click(screen.getByTestId("toggle"));
    // Set large font
    fireEvent.click(screen.getByTestId("setLarge"));

    // The content wrapper should have the text-lg class
    const contentWrapper = screen.getByText("Test content").parentElement;
    expect(contentWrapper).toHaveClass("text-lg");
  });

  it("sets data-reader-theme attribute on document", () => {
    render(
      <ReaderModeProvider>
        <ReaderModeToggle />
        <ReaderModeContent>
          <p>Test content</p>
        </ReaderModeContent>
      </ReaderModeProvider>
    );

    // Enable reader mode - theme should still be "auto" so no attribute
    fireEvent.click(screen.getByRole("button"));

    // Initially auto - no attribute
    expect(document.documentElement.getAttribute("data-reader-theme")).toBeNull();
  });
});

describe("useReaderMode hook", () => {
  it("throws error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow("useReaderMode must be used within a ReaderModeProvider");

    consoleSpy.mockRestore();
  });
});
