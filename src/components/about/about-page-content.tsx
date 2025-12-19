"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Heart,
  Shield,
  Sparkles,
  BookOpen,
  Search,
  ArrowRight,
  CheckCircle2,
  Lock,
  Compass,
  Users,
  Eye,
  Lightbulb,
  Brain,
  FileText,
  Image as ImageIcon,
  Star,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Scroll-triggered animation hook
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = ref.current?.querySelectorAll(".scroll-animate");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

// Animated section wrapper
function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "scroll-animate opacity-0 translate-y-8 transition-all duration-700 ease-out",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Icon component for features
function FeatureIcon({
  icon: Icon,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: "trust" | "calm" | "hope" | "primary";
}) {
  const colorClasses = {
    trust: "bg-trust/10 text-trust",
    calm: "bg-calm/10 text-calm",
    hope: "bg-hope/10 text-hope",
    primary: "bg-primary/10 text-primary",
  };

  return (
    <div
      className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center",
        colorClasses[color]
      )}
    >
      <Icon className="w-7 h-7" />
    </div>
  );
}

export function AboutPageContent() {
  const containerRef = useScrollAnimation();
  const t = useTranslations("mission");

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      {/* =====================================================
          SECTION 1: EMOTIONAL HERO
          ===================================================== */}
      <section className="relative py-24 lg:py-40 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Overline */}
            <AnimatedSection>
              <p className="text-primary font-medium mb-6 tracking-widest uppercase text-sm">
                {t("hero.overline")}
              </p>
            </AnimatedSection>

            {/* Main Headline - Serif for emotional impact */}
            <AnimatedSection delay={100}>
              <h1 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight mb-8 leading-[1.1] text-foreground">
                {t("hero.title")}
              </h1>
            </AnimatedSection>

            {/* Subheadline */}
            <AnimatedSection delay={200}>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {t("hero.subtitle")}
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 2: OUR CONVICTION
          ===================================================== */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Visual */}
              <AnimatedSection>
                <div className="relative">
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-hope/10 to-calm/10 relative">
                    {/* Decorative elements instead of image - more intentional design */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {/* Abstract supportive hands icon - large, centered */}
                        <svg viewBox="0 0 200 200" className="w-48 h-48 text-primary/20" fill="none">
                          {/* Left curved hand */}
                          <path
                            d="M30 140 C30 80, 60 40, 100 40"
                            stroke="currentColor"
                            strokeWidth="12"
                            strokeLinecap="round"
                          />
                          {/* Right curved hand */}
                          <path
                            d="M170 140 C170 80, 140 40, 100 40"
                            stroke="currentColor"
                            strokeWidth="12"
                            strokeLinecap="round"
                          />
                          {/* Center circle - the person */}
                          <circle cx="100" cy="110" r="25" fill="currentColor" />
                        </svg>
                        {/* Animated glow */}
                        <div className="absolute inset-0 animate-pulse-glow rounded-full" style={{ "--glow-color": "rgba(139, 115, 85, 0.2)" } as React.CSSProperties} />
                      </div>
                    </div>
                    {/* Soft gradient waves */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-primary/10 to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-hope/10 to-transparent" />
                  </div>
                  {/* Floating accent */}
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-hope/20 rounded-full blur-2xl" />
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-calm/20 rounded-full blur-2xl" />
                </div>
              </AnimatedSection>

              {/* Right: Content */}
              <div className="space-y-8">
                <AnimatedSection delay={100}>
                  <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight">
                    {t("conviction.title")}
                  </h2>
                </AnimatedSection>

                <AnimatedSection delay={200}>
                  <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <p>{t("conviction.paragraph1")}</p>
                    <p>{t("conviction.paragraph2")}</p>
                    <p className="text-foreground font-medium">
                      {t("conviction.paragraph3")}
                    </p>
                  </div>
                </AnimatedSection>

                <AnimatedSection delay={300}>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 rounded-full bg-trust/10 text-trust text-sm font-medium">
                      {t("conviction.tag1")}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-calm/10 text-calm text-sm font-medium">
                      {t("conviction.tag2")}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-hope/10 text-hope text-sm font-medium">
                      {t("conviction.tag3")}
                    </span>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 3: THE PEOPLE BEHIND FINDMYTHERAPY
          ===================================================== */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl lg:text-5xl font-medium mb-6">
                  {t("team.title")}
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t("team.subtitle")}
                </p>
              </div>
            </AnimatedSection>

            {/* Team Cards - Equal presentation with transparent photos */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Gregor - Experienced */}
              <AnimatedSection delay={100}>
                <div className="group h-full">
                  <div className="bg-white rounded-3xl overflow-hidden shadow-lg border h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                    {/* Portrait with elegant gradient background */}
                    <div className="relative overflow-hidden">
                      {/* Gradient background for transparent photo */}
                      <div className="absolute inset-0 bg-gradient-to-b from-trust/40 via-calm/30 to-white" />

                      {/* Photo container - fixed height, photo fills width */}
                      <div className="relative h-72 sm:h-80 flex items-end justify-center">
                        <Image
                          src="/images/team/gregorstudlar.png"
                          alt="MMag. Dr. Gregor Studlar BA"
                          width={400}
                          height={400}
                          className="h-full w-auto object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.02] drop-shadow-2xl"
                        />
                      </div>
                    </div>

                    <div className="p-8">
                      {/* Tags */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {t("team.gregor.role")}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-calm/10 text-calm text-sm font-medium">
                          {t("team.gregor.experience")}
                        </span>
                      </div>

                      {/* Name & Title */}
                      <h3 className="text-2xl font-bold mb-1">
                        {t("team.gregor.name")}
                      </h3>
                      <p className="text-primary font-medium mb-4">
                        {t("team.gregor.title")}
                      </p>

                      {/* Description */}
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {t("team.gregor.bio")}
                      </p>

                      {/* Expertise Tags */}
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-sm">
                          {t("team.gregor.spec1")}
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-muted text-sm">
                          {t("team.gregor.spec2")}
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-muted text-sm">
                          {t("team.gregor.spec3")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Thomas - Fresh Perspective */}
              <AnimatedSection delay={200}>
                <div className="group h-full">
                  <div className="bg-white rounded-3xl overflow-hidden shadow-lg border h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                    {/* Portrait with elegant gradient background */}
                    <div className="relative overflow-hidden">
                      {/* Gradient background for transparent photo */}
                      <div className="absolute inset-0 bg-gradient-to-b from-hope/40 via-calm/30 to-white" />

                      {/* Photo container - fixed height, photo scaled up */}
                      <div className="relative h-72 sm:h-80 flex items-end justify-center">
                        <Image
                          src="/images/team/thomaskaufmann.png"
                          alt="Thomas Kaufmann BA pth."
                          width={600}
                          height={600}
                          className="h-[125%] w-auto object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.02] drop-shadow-2xl"
                        />
                      </div>
                    </div>

                    <div className="p-8">
                      {/* Tags */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {t("team.thomas.role")}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-hope/10 text-hope text-sm font-medium">
                          {t("team.thomas.experience")}
                        </span>
                      </div>

                      {/* Name & Title */}
                      <h3 className="text-2xl font-bold mb-1">
                        {t("team.thomas.name")}
                      </h3>
                      <p className="text-primary font-medium mb-4">
                        {t("team.thomas.title")}
                      </p>

                      {/* Description */}
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {t("team.thomas.bio")}
                      </p>

                      {/* Expertise Tags */}
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-sm">
                          {t("team.thomas.spec1")}
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-muted text-sm">
                          {t("team.thomas.spec2")}
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-muted text-sm">
                          {t("team.thomas.spec3")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Team Note */}
            <AnimatedSection delay={300}>
              <div className="mt-12 text-center">
                <p className="text-muted-foreground flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  {t("team.note")}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 3.5: PARTNERS & SUPPORTERS
          ===================================================== */}
      <section className="py-16 lg:py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-12">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
                  {t("partners.overline")}
                </p>
                <h3 className="text-xl sm:text-2xl font-medium text-foreground">
                  {t("partners.title")}
                </h3>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
                {/* SFU Wien */}
                <div className="grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300">
                  <Image
                    src="/images/partners/sfu.svg"
                    alt="SFU Wien - Sigmund Freud Privatuniversität"
                    width={120}
                    height={60}
                    className="h-12 sm:h-14 w-auto object-contain"
                  />
                </div>

                {/* VÖPP */}
                <div className="grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300">
                  <Image
                    src="/images/partners/voepp.png"
                    alt="VÖPP - Vereinigung Österreichischer Psychotherapeutinnen und Psychotherapeuten"
                    width={120}
                    height={60}
                    className="h-12 sm:h-14 w-auto object-contain"
                  />
                </div>

                {/* ÖBVP */}
                <div className="grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300">
                  <Image
                    src="/images/partners/oebvp.png"
                    alt="ÖBVP - Österreichischer Bundesverband für Psychotherapie"
                    width={120}
                    height={60}
                    className="h-12 sm:h-14 w-auto object-contain"
                  />
                </div>

                {/* 2 Minuten 2 Millionen */}
                <div className="grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300">
                  <Image
                    src="/images/partners/2min2mil.png"
                    alt="2 Minuten 2 Millionen"
                    width={140}
                    height={60}
                    className="h-12 sm:h-14 w-auto object-contain"
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 4: WHAT MAKES FINDMYTHERAPY SPECIAL
          ===================================================== */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl lg:text-5xl font-medium mb-6">
                  {t("features.title")}
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t("features.subtitle")}
                </p>
              </div>
            </AnimatedSection>

            {/* Feature 1: Guided Matching - Hero Feature */}
            <AnimatedSection delay={100}>
              <div className="mb-12">
                <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-3xl p-8 sm:p-12 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                  <div className="relative z-10 grid lg:grid-cols-5 gap-8 items-center">
                    <div className="lg:col-span-3">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        {t("features.matching.badge")}
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                        {t("features.matching.title")}
                      </h3>
                      <p className="text-xl text-white/80 mb-6 leading-relaxed">
                        {t("features.matching.description")}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1.5 rounded-full bg-white/20 text-sm">
                          {t("features.matching.tag1")}
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-white/20 text-sm">
                          {t("features.matching.tag2")}
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-white/20 text-sm">
                          {t("features.matching.tag3")}
                        </span>
                      </div>
                    </div>
                    <div className="lg:col-span-2 flex justify-center">
                      <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20">
                        <Compass className="w-20 h-20 sm:w-28 sm:h-28 text-white/90" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Features 2-4: Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 2: Evidence-based Knowledge */}
              <AnimatedSection delay={200}>
                <div className="bg-white rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-all duration-300 h-full">
                  <FeatureIcon icon={BookOpen} color="hope" />
                  <h3 className="text-xl font-bold mt-6 mb-3">
                    {t("features.knowledge.title")}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t("features.knowledge.description")}
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      {t("features.knowledge.point1")}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      {t("features.knowledge.point2")}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      {t("features.knowledge.point3")}
                    </li>
                  </ul>
                </div>
              </AnimatedSection>

              {/* Feature 3: Modern Search */}
              <AnimatedSection delay={300}>
                <div className="bg-white rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-all duration-300 h-full">
                  <FeatureIcon icon={Search} color="trust" />
                  <h3 className="text-xl font-bold mt-6 mb-3">
                    {t("features.search.title")}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t("features.search.description")}
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      {t("features.search.point1")}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      {t("features.search.point2")}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      {t("features.search.point3")}
                    </li>
                  </ul>
                </div>
              </AnimatedSection>

              {/* Feature 4: Right Therapy */}
              <AnimatedSection delay={400}>
                <div className="bg-white rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-all duration-300 h-full">
                  <FeatureIcon icon={Brain} color="calm" />
                  <h3 className="text-xl font-bold mt-6 mb-3">
                    {t("features.rightTherapy.title")}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t("features.rightTherapy.description")}
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      {t("features.rightTherapy.point1")}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      {t("features.rightTherapy.point2")}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      {t("features.rightTherapy.point3")}
                    </li>
                  </ul>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 5: PRIVACY AS TRUST ANCHOR
          ===================================================== */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-trust/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-calm/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start gap-5 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                      <Shield className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                        {t("privacy.title")}
                      </h2>
                      <p className="text-white/60">{t("privacy.subtitle")}</p>
                    </div>
                  </div>

                  {/* Main text */}
                  <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-10">
                    {t("privacy.description")}
                  </p>

                  {/* Trust points */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                      <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                      <span>{t("privacy.point1")}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                      <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                      <span>{t("privacy.point2")}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                      <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                      <span>{t("privacy.point3")}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                      <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                      <span>{t("privacy.point4")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 6: FOR THERAPISTS (B2B)
          ===================================================== */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <AnimatedSection>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Lightbulb className="w-4 h-4" />
                  {t("therapists.badge")}
                </div>
                <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl lg:text-5xl font-medium mb-6">
                  {t("therapists.title")}
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  {t("therapists.subtitle")}
                </p>
              </div>
            </AnimatedSection>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Gratis */}
              <AnimatedSection delay={100}>
                <div className="bg-white rounded-2xl p-8 border-2 border-border hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-1">
                      {t("therapists.plans.gratis.name")}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t("therapists.plans.gratis.description")}
                    </p>
                  </div>
                  <div className="text-4xl font-bold mb-6">
                    0€
                    <span className="text-lg font-normal text-muted-foreground">
                      /Monat
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-grow">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm">
                        {t("therapists.plans.gratis.feature1")}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm">
                        {t("therapists.plans.gratis.feature2")}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm">
                        {t("therapists.plans.gratis.feature3")}
                      </span>
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link href="/auth/register">{t("therapists.cta.free")}</Link>
                  </Button>
                </div>
              </AnimatedSection>

              {/* Standard - Popular */}
              <AnimatedSection delay={200}>
                <div className="bg-white rounded-2xl p-8 border-2 border-primary shadow-xl relative h-full flex flex-col">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" />
                      {t("therapists.plans.standard.badge")}
                    </span>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-1">
                      {t("therapists.plans.standard.name")}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t("therapists.plans.standard.description")}
                    </p>
                  </div>
                  <div className="text-4xl font-bold mb-6">
                    29€
                    <span className="text-lg font-normal text-muted-foreground">
                      /Monat
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-grow">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm">
                        {t("therapists.plans.standard.feature1")}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm">
                        {t("therapists.plans.standard.feature2")}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm">
                        {t("therapists.plans.standard.feature3")}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm">
                        {t("therapists.plans.standard.feature4")}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm">
                        {t("therapists.plans.standard.feature5")}
                      </span>
                    </li>
                  </ul>
                  <Button asChild className="w-full rounded-full">
                    <Link href="/auth/register">
                      {t("therapists.cta.upgrade")}
                    </Link>
                  </Button>
                </div>
              </AnimatedSection>

              {/* Premium */}
              <AnimatedSection delay={300}>
                <div className="bg-white rounded-2xl p-8 border-2 border-border hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-1">
                      {t("therapists.plans.premium.name")}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t("therapists.plans.premium.description")}
                    </p>
                  </div>
                  <div className="text-4xl font-bold mb-6">
                    59€
                    <span className="text-lg font-normal text-muted-foreground">
                      /Monat
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-grow">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm">
                        {t("therapists.plans.premium.feature1")}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm">
                        {t("therapists.plans.premium.feature2")}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm">
                        {t("therapists.plans.premium.feature3")}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm">
                        {t("therapists.plans.premium.feature4")}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm">
                        {t("therapists.plans.premium.feature5")}
                      </span>
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link href="/auth/register">
                      {t("therapists.cta.premium")}
                    </Link>
                  </Button>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 7: FINAL EMOTIONAL CTA
          ===================================================== */}
      <section className="py-24 lg:py-40 relative overflow-hidden bg-slate-900">
        {/* Decorative blurs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-hope/30 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center text-white">
              <Heart className="w-16 h-16 mx-auto mb-8 text-primary" />

              <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl lg:text-5xl font-medium mb-6 leading-tight">
                {t("cta.title")}
              </h2>

              <p className="text-xl sm:text-2xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                {t("cta.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-10 h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl"
                >
                  <Link href="/therapists/matching">
                    {t("cta.primary")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full px-10 h-14 text-lg bg-transparent border-2 border-white/40 text-white hover:bg-white/10"
                >
                  <Link href="/therapists">{t("cta.secondary")}</Link>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CSS for scroll animations */}
      <style jsx global>{`
        .scroll-animate.is-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
}
