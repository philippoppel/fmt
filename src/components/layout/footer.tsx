"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";

// Routes where footer should be hidden (fullscreen experiences)
const HIDDEN_FOOTER_ROUTES = ["/therapists/matching"];

export function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Check if current path matches any hidden route (supports localized paths)
  const shouldHide = HIDDEN_FOOTER_ROUTES.some(route =>
    pathname.includes(route)
  );

  if (shouldHide) {
    return null;
  }

  return (
    <footer className="border-t bg-background" role="contentinfo">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">MeineApp</h2>
            <p className="text-sm text-muted-foreground">
              Eine barrierefreie, mehrsprachige Webanwendung.
            </p>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-2" role="list">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {t("links.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {t("links.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/imprint"
                  className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {t("links.imprint")}
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibility"
                  className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {t("links.accessibility")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("social.followUs")}</h3>
            <ul className="space-y-2" role="list">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {t("social.twitter")}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {t("social.linkedin")}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {t("social.github")}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {t("copyright", { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}
