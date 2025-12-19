import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SkipLinks } from "@/components/a11y/skip-links";
import { generateSeoMetadata, generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo";
import "../globals.css";

// Viewport configuration for Safari safe area support
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4a7c59",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    de: "FindMyTherapy – Die richtige Therapie für dich",
    en: "FindMyTherapy – The Right Therapy for You",
  };

  const descriptions: Record<string, string> = {
    de: "Finde die richtige Therapie, nicht nur einen Therapeuten. Kostenloses Wissen, moderne Suche und geführtes KI-Matching.",
    en: "Find the right therapy, not just a therapist. Free knowledge, modern search and guided AI matching.",
  };

  return generateSeoMetadata({
    title: titles[locale] || titles.de,
    description: descriptions[locale] || descriptions.de,
    locale,
    keywords: ["webapp", "accessibility", "multilingual", "seo"],
  });
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the locale
  const messages = await getMessages();

  // JSON-LD Structured Data
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            disableTransitionOnChange
          >
            <NextIntlClientProvider messages={messages}>
              <SkipLinks />
              {children}
            </NextIntlClientProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
