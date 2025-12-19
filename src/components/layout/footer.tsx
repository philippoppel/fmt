"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Heart, Mail, Instagram, Linkedin } from "lucide-react";

// Routes where footer should be hidden (fullscreen experiences)
const HIDDEN_FOOTER_ROUTES = ["/therapists/matching"];

// Logo SVG - matching header
function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 28 C6 16, 12 8, 20 8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M34 28 C34 16, 28 8, 20 8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="20" cy="22" r="5" fill="currentColor" />
    </svg>
  );
}

export function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  const shouldHide = HIDDEN_FOOTER_ROUTES.some((route) =>
    pathname.includes(route)
  );

  if (shouldHide) {
    return null;
  }

  return (
    <footer className="border-t bg-muted/30" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold">
                <span className="font-bold">Find</span>
                <span className="font-normal text-muted-foreground">My</span>
                <span className="font-bold">Therapy</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Die führende Plattform für Psychotherapie-Matching in Österreich.
              Finde die richtige Therapie – anonym, kostenlos und verständlich.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Navigation</h3>
            <ul className="space-y-2.5" role="list">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Startseite
                </Link>
              </li>
              <li>
                <Link
                  href="/therapists"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Therapeuten finden
                </Link>
              </li>
              <li>
                <Link
                  href="/therapists/matching"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Matching starten
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Wissen & Selbsthilfe
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Rechtliches</h3>
            <ul className="space-y-2.5" role="list">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("links.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("links.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/imprint"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("links.imprint")}
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibility"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("links.accessibility")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Kontakt</h3>
            <ul className="space-y-2.5" role="list">
              <li>
                <a
                  href="mailto:info@findmytherapy.at"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  info@findmytherapy.at
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/findmytherapy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                  <span className="sr-only"> (öffnet in neuem Tab)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/company/findmytherapy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                  <span className="sr-only"> (öffnet in neuem Tab)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} FindMyTherapy. Alle Rechte vorbehalten.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              Mit <Heart className="h-3.5 w-3.5 text-primary fill-primary" /> in
              Österreich entwickelt
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
