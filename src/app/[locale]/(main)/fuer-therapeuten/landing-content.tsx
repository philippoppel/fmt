"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  BarChart3,
  Shield,
  Sparkles,
  Check,
  ArrowRight,
  Star,
  Clock,
  Target,
  Palette,
  TrendingUp,
  Heart,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function TherapistsLandingContent() {
  const t = useTranslations("therapistsLanding");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection t={t} />

      {/* Benefits Section */}
      <BenefitsSection t={t} />

      {/* How It Works */}
      <HowItWorksSection t={t} />

      {/* Features Grid */}
      <FeaturesSection t={t} />

      {/* Pricing Preview */}
      <PricingSection t={t} />

      {/* Testimonials */}
      <TestimonialsSection t={t} />

      {/* FAQ */}
      <FAQSection t={t} />

      {/* Final CTA */}
      <FinalCTASection t={t} />
    </div>
  );
}

// Hero Section
function HeroSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/50 via-white to-white py-20 lg:py-32">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              {t("hero.badge")}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              {t("hero.title")}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="gap-2">
                <Link href="/auth/register">
                  <Sparkles className="h-5 w-5" />
                  {t("hero.ctaPrimary")}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2">
                <Link href="/pricing">
                  {t("hero.ctaSecondary")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                {t("hero.benefit1")}
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                {t("hero.benefit2")}
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 p-8">
              <img
                src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&h=600&fit=crop"
                alt="Therapist in a comfortable office"
                className="w-full h-full object-cover rounded-xl shadow-2xl"
              />
              {/* Floating Stats Card */}
              <div className="absolute -left-6 bottom-8 bg-white rounded-xl shadow-xl p-4 animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">+47%</p>
                    <p className="text-xs text-muted-foreground">{t("hero.statLabel")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}

// Benefits Section
function BenefitsSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const benefits = [
    {
      icon: Search,
      title: t("benefits.visibility.title"),
      description: t("benefits.visibility.description"),
    },
    {
      icon: Target,
      title: t("benefits.matching.title"),
      description: t("benefits.matching.description"),
    },
    {
      icon: Heart,
      title: t("benefits.focus.title"),
      description: t("benefits.focus.description"),
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t("benefits.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("benefits.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, i) => (
            <Card key={i} className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="p-3 w-fit rounded-xl bg-primary/10 mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const steps = [
    {
      number: "01",
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.description"),
      icon: Users,
    },
    {
      number: "02",
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.description"),
      icon: Palette,
    },
    {
      number: "03",
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.description"),
      icon: BarChart3,
    },
  ];

  return (
    <section className="py-20">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">{t("howItWorks.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              {/* Step number */}
              <div className="relative z-10 mx-auto w-32 h-32 rounded-full bg-white shadow-lg border-4 border-primary/10 flex items-center justify-center mb-6">
                <div className="text-center">
                  <span className="text-sm text-primary font-medium">{step.number}</span>
                  <step.icon className="h-8 w-8 mx-auto mt-1 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const features = [
    { icon: Search, label: t("features.seo") },
    { icon: Palette, label: t("features.microsite") },
    { icon: BarChart3, label: t("features.stats") },
    { icon: Target, label: t("features.matching") },
    { icon: Shield, label: t("features.privacy") },
    { icon: Clock, label: t("features.support") },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-amber-50/30">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t("features.title")}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl bg-white border shadow-sm"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const tiers = [
    {
      name: t("pricing.gratis.name"),
      price: "0",
      description: t("pricing.gratis.description"),
      features: [
        t("pricing.gratis.feature1"),
        t("pricing.gratis.feature2"),
        t("pricing.gratis.feature3"),
      ],
      cta: t("pricing.gratis.cta"),
      popular: false,
    },
    {
      name: t("pricing.mittel.name"),
      price: "29",
      description: t("pricing.mittel.description"),
      features: [
        t("pricing.mittel.feature1"),
        t("pricing.mittel.feature2"),
        t("pricing.mittel.feature3"),
        t("pricing.mittel.feature4"),
      ],
      cta: t("pricing.mittel.cta"),
      popular: true,
    },
    {
      name: t("pricing.premium.name"),
      price: "79",
      description: t("pricing.premium.description"),
      features: [
        t("pricing.premium.feature1"),
        t("pricing.premium.feature2"),
        t("pricing.premium.feature3"),
        t("pricing.premium.feature4"),
        t("pricing.premium.feature5"),
      ],
      cta: t("pricing.premium.cta"),
      popular: false,
    },
  ];

  return (
    <section className="py-20">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t("pricing.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <Card
              key={i}
              className={cn(
                "relative",
                tier.popular && "border-primary shadow-xl scale-105"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white">
                    {t("pricing.popular")}
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}€</span>
                  <span className="text-muted-foreground">/Monat</span>
                </div>
                <CardDescription className="mt-2">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href="/auth/register">{tier.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const testimonials = [
    {
      quote: t("testimonials.1.quote"),
      author: t("testimonials.1.author"),
      role: t("testimonials.1.role"),
    },
    {
      quote: t("testimonials.2.quote"),
      author: t("testimonials.2.author"),
      role: t("testimonials.2.role"),
    },
    {
      quote: t("testimonials.3.quote"),
      author: t("testimonials.3.author"),
      role: t("testimonials.3.role"),
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t("testimonials.title")}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="bg-white">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: t("faq.1.question"), a: t("faq.1.answer") },
    { q: t("faq.2.question"), a: t("faq.2.answer") },
    { q: t("faq.3.question"), a: t("faq.3.answer") },
    { q: t("faq.4.question"), a: t("faq.4.answer") },
    { q: t("faq.5.question"), a: t("faq.5.answer") },
  ];

  return (
    <section className="py-20">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t("faq.title")}</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-muted/50 transition-colors"
              >
                {faq.q}
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    openIndex === i && "rotate-180"
                  )}
                />
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 text-muted-foreground">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Final CTA Section
function FinalCTASection({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
      <div className="container max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t("cta.title")}</h2>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          {t("cta.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild className="gap-2">
            <Link href="/auth/register">
              <Sparkles className="h-5 w-5" />
              {t("cta.primary")}
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="bg-transparent border-white text-white hover:bg-white/10"
          >
            <Link href="/pricing">{t("cta.secondary")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
