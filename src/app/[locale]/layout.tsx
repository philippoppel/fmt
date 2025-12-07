import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SkipLinks } from "@/components/a11y/skip-links";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { generateSeoMetadata, generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo";
import "../globals.css";

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
    de: "Meine App - Ihre Lösung für...",
    en: "My App - Your Solution for...",
    fr: "Mon App - Votre Solution pour...",
    es: "Mi App - Tu Solución para...",
    it: "La Mia App - La Tua Soluzione per...",
  };

  const descriptions: Record<string, string> = {
    de: "Eine barrierefreie, mehrsprachige Webanwendung mit höchster Qualität und Benutzerfreundlichkeit.",
    en: "An accessible, multilingual web application with the highest quality and user experience.",
    fr: "Une application web accessible et multilingue avec la plus haute qualité et expérience utilisateur.",
    es: "Una aplicación web accesible y multilingüe con la más alta calidad y experiencia de usuario.",
    it: "Un'applicazione web accessibile e multilingue con la massima qualità e esperienza utente.",
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
      className={`${geistSans.variable} ${geistMono.variable}`}
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <SkipLinks />
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main id="main-content" className="flex-1" tabIndex={-1}>
                {children}
              </main>
              <Footer />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
