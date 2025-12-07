import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables for tests
vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
  useLocale: () => "de",
  getTranslations: async () => (key: string) => key,
}));

// Mock next-intl/routing
vi.mock("next-intl/routing", () => ({
  defineRouting: (config: unknown) => config,
  createNavigation: () => ({
    Link: () => null,
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => "/",
    redirect: vi.fn(),
  }),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}));
