"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Themenbilder mit Unsplash - warme, hoffnungsvolle Motive
// matchingId = ID für MATCHING_TOPICS, labelKey = Übersetzungsschlüssel
const THEME_IMAGES = [
  {
    matchingId: "depression",
    labelKey: "depression",
    src: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop",
    alt: "Hoffnung und Licht",
  },
  {
    matchingId: "anxiety",
    labelKey: "anxiety",
    src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop",
    alt: "Meditation und Ruhe",
  },
  {
    matchingId: "trauma",
    labelKey: "trauma",
    src: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop",
    alt: "Heilung und Wachstum",
  },
  {
    matchingId: "stress",
    labelKey: "stress",
    src: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=300&fit=crop",
    alt: "Entspannung und Ruhe",
  },
  {
    matchingId: "addiction",
    labelKey: "addiction",
    src: "https://images.unsplash.com/photo-1470116945706-e6bf5d5a53ca?w=400&h=300&fit=crop",
    alt: "Freiheit und Neuanfang",
  },
  {
    matchingId: "eating_disorders",
    labelKey: "eating",
    src: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop",
    alt: "Balance und Wohlbefinden",
  },
  {
    matchingId: "family",
    labelKey: "family",
    src: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop",
    alt: "Familie und Zusammenhalt",
  },
  {
    matchingId: "relationships",
    labelKey: "relationships",
    src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop",
    alt: "Verbindung und Nähe",
  },
  {
    matchingId: "burnout",
    labelKey: "burnout",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    alt: "Erholung und Balance",
  },
  {
    matchingId: "self_care",
    labelKey: "selfcare",
    src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    alt: "Selbstfürsorge",
  },
  {
    matchingId: "adhd",
    labelKey: "adhd",
    src: "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=400&h=300&fit=crop",
    alt: "Fokus und Kreativität",
  },
  {
    matchingId: "sleep",
    labelKey: "sleep",
    src: "https://images.unsplash.com/photo-1515894203077-9cd36032142f?w=400&h=300&fit=crop",
    alt: "Ruhe und Erholung",
  },
];

function TopicCard({
  matchingId,
  src,
  alt,
  label,
  delay,
  className,
}: {
  matchingId: string;
  src: string;
  alt: string;
  label: string;
  delay: number;
  className?: string;
}) {
  return (
    <Link
      href={`/therapists/matching?topic=${matchingId}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm",
        "shadow-lg hover:shadow-2xl transition-all duration-500 ease-out",
        "hover:scale-[1.05] hover:-translate-y-1",
        "opacity-0 animate-hero-image-reveal",
        "ring-1 ring-white/20 hover:ring-white/40",
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Label */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <span className="text-white text-sm font-semibold drop-shadow-lg flex items-center gap-1.5">
            {label}
            <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function HeroSection() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 -z-10">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/hero-therapy.mp4" type="video/mp4" />
          <source src="/videos/hero-therapy.webm" type="video/webm" />
        </video>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32 min-h-screen flex flex-col justify-center">
        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6 opacity-0 animate-hero-text-reveal ring-1 ring-white/20"
            style={{ animationDelay: "0.1s" }}
          >
            <Sparkles className="w-4 h-4" />
            {t("features")}
          </div>

          {/* Main Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 opacity-0 animate-hero-text-reveal drop-shadow-lg"
            style={{ animationDelay: "0.2s" }}
          >
            {t("title")}
          </h1>

          {/* Subtitle */}
          <p
            className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8 opacity-0 animate-hero-text-reveal"
            style={{ animationDelay: "0.3s" }}
          >
            {t("subtitle")}
          </p>

          {/* CTA Button */}
          <div
            className="opacity-0 animate-hero-text-reveal"
            style={{ animationDelay: "0.4s" }}
          >
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 text-lg h-14 shadow-2xl hover:shadow-primary/25 transition-all bg-white text-foreground hover:bg-white/90"
            >
              <Link href="/therapists/matching">
                {t("cta")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-white/60 mt-3">
              {t("ctaHint")}
            </p>
          </div>
        </div>

        {/* Topics Section */}
        <div className="max-w-6xl mx-auto w-full">
          <h2
            className="text-center text-lg font-medium text-white/70 mb-8 opacity-0 animate-hero-text-reveal"
            style={{ animationDelay: "0.5s" }}
          >
            {t("topicsTitle")}
          </h2>

          {/* Topic Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {THEME_IMAGES.map((img, index) => (
              <TopicCard
                key={img.matchingId}
                matchingId={img.matchingId}
                src={img.src}
                alt={img.alt}
                label={t(`topics.${img.labelKey}`)}
                delay={0.6 + index * 0.05}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
