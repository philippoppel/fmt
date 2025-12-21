"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { HeaderSearch } from "@/components/layout/header-search";
import { Menu, X, User, LogOut, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const HIDDEN_HEADER_ROUTES = ["/therapists/matching"];

// Logo SVG - Abstract hands forming protective/supportive gesture
function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      {/* Left curved hand/shape */}
      <path
        d="M6 28 C6 16, 12 8, 20 8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right curved hand/shape */}
      <path
        d="M34 28 C34 16, 28 8, 20 8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Center dot - the person being supported */}
      <circle cx="20" cy="22" r="5" fill="currentColor" />
    </svg>
  );
}

export function Header() {
  const t = useTranslations("navigation");
  const tHome = useTranslations("home.hero");
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  // Check if we're on the home page
  const isHomePage = pathname === "/" || pathname === "/de" || pathname === "/en";

  // Show CTA when scrolled past hero section (approx 500px)
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowCta(scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const shouldHide = HIDDEN_HEADER_ROUTES.some((route) => pathname.includes(route));
  if (shouldHide) return null;

  const navItems = [
    { href: "/", label: t("start") },
    { href: "/blog", label: t("wissen") },
    { href: "/about", label: t("mission") },
    { href: "/therapists", label: t("therapie") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full p-4">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-semibold">
          <Logo className="h-7 w-7 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
          <span className="text-sm sm:text-lg whitespace-nowrap">
            <span className="font-bold">Find</span>
            <span className="font-normal text-muted-foreground">My</span>
            <span className="font-bold">Therapy</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Sticky CTA - appears when scrolled past hero */}
          <div
            className={cn(
              "transition-all duration-300 ease-out",
              showCta
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 translate-x-4 scale-95 pointer-events-none"
            )}
          >
            <Button
              size="sm"
              asChild
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 gap-1.5"
            >
              <Link href="/therapists/matching">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tHome("cta")}</span>
                <span className="sm:hidden">Start</span>
              </Link>
            </Button>
          </div>

          <HeaderSearch />
          <LanguageSwitcher />

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/settings">
                  <User className="h-4 w-4 mr-1" />
                  {t("profile")}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
              <Link href="/fuer-therapeuten">Für Therapeut:innen</Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 mx-4 rounded-xl bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-4 border-t border-black/10 dark:border-white/10">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/fuer-therapeuten" onClick={() => setMobileMenuOpen(false)}>
                    Für Therapeut:innen
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
