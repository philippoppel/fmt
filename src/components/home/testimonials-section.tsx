"use client";

import { useTranslations } from "next-intl";
import { Quote, Star, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Testimonials config - mix of users and therapists
const TESTIMONIALS = [
  {
    id: 1,
    nameKey: "user1.name",
    locationKey: "user1.location",
    quoteKey: "user1.quote",
    avatar: "L",
    avatarBg: "from-rose-400 to-pink-500",
    rating: 5,
  },
  {
    id: 2,
    nameKey: "user2.name",
    locationKey: "user2.location",
    quoteKey: "user2.quote",
    avatar: "M",
    avatarBg: "from-trust to-trust/70",
    rating: 5,
  },
  {
    id: 3,
    nameKey: "therapist1.name",
    locationKey: "therapist1.location",
    quoteKey: "therapist1.quote",
    avatar: "A",
    avatarBg: "from-calm to-calm/70",
    rating: 5,
  },
  {
    id: 4,
    nameKey: "user3.name",
    locationKey: "user3.location",
    quoteKey: "user3.quote",
    avatar: "S",
    avatarBg: "from-hope to-hope/70",
    rating: 5,
  },
  {
    id: 5,
    nameKey: "therapist2.name",
    locationKey: "therapist2.location",
    quoteKey: "therapist2.quote",
    avatar: "T",
    avatarBg: "from-primary to-primary/70",
    rating: 5,
  },
  {
    id: 6,
    nameKey: "user4.name",
    locationKey: "user4.location",
    quoteKey: "user4.quote",
    avatar: "J",
    avatarBg: "from-cyan-500 to-blue-500",
    rating: 5,
  },
];

function TestimonialCard({
  testimonial,
  t,
}: {
  testimonial: (typeof TESTIMONIALS)[0];
  t: (key: string) => string;
}) {
  return (
    <div className="flex-shrink-0 w-[300px] sm:w-[360px]">
      <div className="relative h-full bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
        {/* Quote Icon */}
        <div className="absolute -top-3 -left-3 w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
          <Quote className="w-4 h-4 text-primary-foreground" />
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-3 ml-6">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 fill-hope text-hope"
            />
          ))}
        </div>

        {/* Quote */}
        <blockquote className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 line-clamp-3">
          &ldquo;{t(`testimonials.${testimonial.quoteKey}`)}&rdquo;
        </blockquote>

        {/* Author */}
        <footer className="flex items-center gap-3 pt-3 border-t border-border/50">
          <div
            className={cn(
              "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-md",
              testimonial.avatarBg
            )}
          >
            {testimonial.avatar}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">
              {t(`testimonials.${testimonial.nameKey}`)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(`testimonials.${testimonial.locationKey}`)}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const t = useTranslations("home");

  // Duplicate for seamless loop
  const allTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-muted/30">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-hope/5 rounded-full blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 px-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Heart className="w-4 h-4 fill-primary text-primary" />
            {t("testimonials.badge")}
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-4">
            {t("testimonials.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("testimonials.subtitle")}
          </p>
        </div>

        {/* Single Row Marquee */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />

          <div
            className="flex gap-5 sm:gap-6 animate-marquee-testimonials"
            style={{ width: "max-content" }}
          >
            {allTestimonials.map((testimonial, index) => (
              <TestimonialCard
                key={`${testimonial.id}-${index}`}
                testimonial={testimonial}
                t={t}
              />
            ))}
            {allTestimonials.map((testimonial, index) => (
              <TestimonialCard
                key={`dup-${testimonial.id}-${index}`}
                testimonial={testimonial}
                t={t}
              />
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 sm:mt-16 text-center px-4">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 px-6 sm:px-8 py-4 sm:py-5 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-border/50">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[
                  "from-rose-400 to-pink-500",
                  "from-trust to-trust/70",
                  "from-calm to-calm/70",
                  "from-hope to-hope/70",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-8 h-8 rounded-full bg-gradient-to-br border-2 border-white flex items-center justify-center text-white text-xs font-bold",
                      bg
                    )}
                  >
                    {["L", "M", "A", "S"][i]}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                {t("testimonials.usersCount")}
              </span>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-hope text-hope" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                {t("testimonials.rating")}
              </span>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground font-medium">
                {t("testimonials.verified")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
