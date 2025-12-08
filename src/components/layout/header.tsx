"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const t = useTranslations("navigation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/therapists", label: t("findTherapist") },
    { href: "/blog", label: t("blog") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <div className="sticky top-0 z-50 w-full px-[5%] lg:px-[10%] pt-4">
      <header className="rounded-2xl border border-white/20 bg-background/70 backdrop-blur-xl shadow-lg shadow-black/5 dark:border-white/10 dark:bg-background/60 dark:shadow-black/20">
        <nav
          id="main-navigation"
          aria-label={t("mainNavigation")}
          className="flex h-14 items-center justify-between px-6"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          >
            <span>MeineApp</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex lg:items-center lg:gap-1" role="list">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full px-4 py-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />

            <div className="hidden lg:flex lg:items-center lg:gap-1.5 lg:ml-2">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" asChild className="rounded-full gap-2">
                    <Link href="/dashboard/settings">
                      <User className="h-4 w-4" />
                      {t("profile")}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full gap-2"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="rounded-full">
                    <Link href="/auth/login">{t("login")}</Link>
                  </Button>
                  <Button asChild className="rounded-full">
                    <Link href="/auth/register">{t("register")}</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="border-t border-white/20 dark:border-white/10 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t("mainNavigation")}
          >
            <ul className="space-y-1 px-4 py-4" role="list">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-full px-4 py-2.5 text-base font-medium text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="border-t border-white/20 dark:border-white/10 pt-4 mt-4">
                <div className="flex flex-col gap-2">
                  {isAuthenticated ? (
                    <>
                      <Button variant="outline" asChild className="w-full rounded-full gap-2">
                        <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)}>
                          <User className="h-4 w-4" />
                          {t("profile")}
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full rounded-full gap-2"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        {t("logout")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full rounded-full">
                        <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                          {t("login")}
                        </Link>
                      </Button>
                      <Button asChild className="w-full rounded-full">
                        <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                          {t("register")}
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </li>
            </ul>
          </div>
        )}
      </header>
    </div>
  );
}
