import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ReadingPreferences,
  ReadingPreferencesCompact,
} from "@/components/blog/a11y/reading-preferences";

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

// Mock Web Speech API
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
const mockGetVoices = vi.fn(() => [
  {
    name: "German Voice",
    lang: "de-DE",
    localService: true,
    voiceURI: "German Voice",
    default: false,
  },
  {
    name: "English Voice",
    lang: "en-US",
    localService: true,
    voiceURI: "English Voice",
    default: false,
  },
]);

Object.defineProperty(window, "speechSynthesis", {
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    getVoices: mockGetVoices,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

// Mock SpeechSynthesisUtterance as a proper class
class MockSpeechSynthesisUtterance {
  lang: string = "";
  rate: number = 1;
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  text: string = "";

  constructor(text?: string) {
    this.text = text || "";
  }
}

global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as unknown as typeof SpeechSynthesisUtterance;

describe("ReadingPreferences", () => {
  const mockText = "This is a test article text for TTS testing.";

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // Create a mock article element
    const article = document.createElement("article");
    article.className = "text-base";
    document.body.appendChild(article);
  });

  afterEach(() => {
    // Clean up article element
    const article = document.querySelector("article");
    if (article) {
      document.body.removeChild(article);
    }
  });

  describe("Rendering", () => {
    it("renders the component", () => {
      render(<ReadingPreferences text={mockText} />);
      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    it("renders font size controls", () => {
      render(<ReadingPreferences text={mockText} />);
      expect(screen.getByLabelText("Schrift verkleinern")).toBeInTheDocument();
      expect(screen.getByLabelText("Schrift vergrößern")).toBeInTheDocument();
    });

    it("renders TTS play button when supported", () => {
      render(<ReadingPreferences text={mockText} />);
      expect(screen.getByRole("button", { name: /vorlesen/i })).toBeInTheDocument();
    });

    it("displays current font size", () => {
      render(<ReadingPreferences text={mockText} />);
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<ReadingPreferences text={mockText} className="custom-class" />);
      expect(screen.getByRole("region")).toHaveClass("custom-class");
    });
  });

  describe("Font Size Controls", () => {
    it("increases font size", () => {
      render(<ReadingPreferences text={mockText} />);

      const increaseButton = screen.getByLabelText("Schrift vergrößern");
      fireEvent.click(increaseButton);

      expect(screen.getByText("112%")).toBeInTheDocument();
    });

    it("decreases font size", () => {
      render(<ReadingPreferences text={mockText} />);

      // First increase
      const increaseButton = screen.getByLabelText("Schrift vergrößern");
      fireEvent.click(increaseButton);
      expect(screen.getByText("112%")).toBeInTheDocument();

      // Then decrease
      const decreaseButton = screen.getByLabelText("Schrift verkleinern");
      fireEvent.click(decreaseButton);
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("disables decrease button at minimum size", () => {
      render(<ReadingPreferences text={mockText} />);
      const decreaseButton = screen.getByLabelText("Schrift verkleinern");
      expect(decreaseButton).toBeDisabled();
    });

    it("disables increase button at maximum size", () => {
      render(<ReadingPreferences text={mockText} />);

      const increaseButton = screen.getByLabelText("Schrift vergrößern");
      // Click 3 times to reach max (100% -> 112% -> 125% -> 150%)
      fireEvent.click(increaseButton);
      fireEvent.click(increaseButton);
      fireEvent.click(increaseButton);

      expect(increaseButton).toBeDisabled();
      expect(screen.getByText("150%")).toBeInTheDocument();
    });

    it("persists font size to localStorage", () => {
      render(<ReadingPreferences text={mockText} />);

      const increaseButton = screen.getByLabelText("Schrift vergrößern");
      fireEvent.click(increaseButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith("blog-font-size", "1");
    });

    it("applies font size class to article element", () => {
      render(<ReadingPreferences text={mockText} />);

      const increaseButton = screen.getByLabelText("Schrift vergrößern");
      fireEvent.click(increaseButton);

      const article = document.querySelector("article");
      expect(article).toHaveClass("text-lg");
    });
  });

  describe("Text-to-Speech", () => {
    it("renders TTS button", () => {
      render(<ReadingPreferences text={mockText} />);
      const playButton = screen.getByRole("button", { name: /vorlesen/i });
      expect(playButton).toBeInTheDocument();
    });

    it("starts TTS on play button click", () => {
      render(<ReadingPreferences text={mockText} />);

      const playButton = screen.getByRole("button", { name: /vorlesen/i });
      fireEvent.click(playButton);

      expect(mockSpeak).toHaveBeenCalled();
    });

    it("cancels TTS before starting new speech", () => {
      render(<ReadingPreferences text={mockText} />);

      const playButton = screen.getByRole("button", { name: /vorlesen/i });
      fireEvent.click(playButton);

      expect(mockCancel).toHaveBeenCalled();
    });

    it("renders settings button", () => {
      render(<ReadingPreferences text={mockText} />);
      expect(screen.getByLabelText("Spracheinstellungen")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA region role", () => {
      render(<ReadingPreferences text={mockText} />);
      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    it("has accessible labels for all buttons", () => {
      render(<ReadingPreferences text={mockText} />);
      expect(screen.getByLabelText("Schrift verkleinern")).toBeInTheDocument();
      expect(screen.getByLabelText("Schrift vergrößern")).toBeInTheDocument();
      expect(screen.getByLabelText("Spracheinstellungen")).toBeInTheDocument();
    });
  });
});

describe("ReadingPreferencesCompact", () => {
  it("renders the same as ReadingPreferences", () => {
    render(<ReadingPreferencesCompact text="Test" />);
    expect(screen.getByRole("region")).toBeInTheDocument();
  });
});
