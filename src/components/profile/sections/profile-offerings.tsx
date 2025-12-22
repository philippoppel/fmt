"use client";

import { Check, Clock, Star } from "lucide-react";
import type { Offering } from "@/types/microsite";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

interface ProfileOfferingsProps {
  offerings: Offering[];
  showPricing: boolean;
  locale: string;
}

const t = {
  de: {
    title: "Meine Angebote",
    subtitle: "Passende Unterstützung für jeden Bedarf",
    duration: "Dauer",
    popular: "Beliebt",
    contact: "Anfragen",
    priceOnRequest: "Preis auf Anfrage",
  },
  en: {
    title: "My Services",
    subtitle: "Suitable support for every need",
    duration: "Duration",
    popular: "Popular",
    contact: "Inquire",
    priceOnRequest: "Price on request",
  },
};

export function ProfileOfferings({
  offerings,
  showPricing,
  locale,
}: ProfileOfferingsProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const texts = t[locale as keyof typeof t] || t.de;

  if (offerings.length === 0) {
    return null;
  }

  return (
    <section
      ref={ref}
      className="py-16 lg:py-24"
      style={{ backgroundColor: "var(--profile-secondary)" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={cn(
            "text-center mb-12 lg:mb-16",
            "opacity-0",
            isVisible && "animate-fade-in-up"
          )}
          style={{ animationFillMode: "forwards" }}
        >
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: "var(--profile-text)" }}
          >
            {texts.title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "var(--profile-text)", opacity: 0.7 }}
          >
            {texts.subtitle}
          </p>
          {/* Decorative line */}
          <div
            className="mt-6 mx-auto w-24 h-1 rounded-full"
            style={{
              background: `linear-gradient(90deg, var(--profile-primary), var(--profile-accent))`,
            }}
          />
        </div>

        {/* Offerings Grid */}
        <div
          className={cn(
            "grid gap-6",
            offerings.length === 1 && "max-w-md mx-auto",
            offerings.length === 2 && "sm:grid-cols-2 max-w-3xl mx-auto",
            offerings.length >= 3 && "sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {offerings.map((offering, index) => (
            <OfferingCard
              key={offering.id}
              offering={offering}
              showPricing={showPricing}
              texts={texts}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface OfferingCardProps {
  offering: Offering;
  showPricing: boolean;
  texts: typeof t.de;
  index: number;
  isVisible: boolean;
}

function OfferingCard({
  offering,
  showPricing,
  texts,
  index,
  isVisible,
}: OfferingCardProps) {
  const formatPrice = (cents: number) => {
    return `${Math.floor(cents / 100)}€`;
  };

  return (
    <div
      className={cn(
        "relative flex flex-col",
        "p-6 rounded-2xl",
        "border-2 transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        offering.isHighlighted
          ? "border-transparent"
          : "border-white/50 bg-white/80",
        "opacity-0",
        isVisible && "animate-fade-in-up"
      )}
      style={{
        background: offering.isHighlighted
          ? `linear-gradient(135deg, var(--profile-primary), var(--profile-accent))`
          : "rgba(255, 255, 255, 0.9)",
        animationFillMode: "forwards",
        animationDelay: `${0.1 * index}s`,
      }}
    >
      {/* Popular Badge */}
      {offering.isHighlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 rounded-full bg-white shadow-lg">
          <Star
            className="h-4 w-4"
            style={{ color: "var(--profile-primary)" }}
            fill="currentColor"
          />
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--profile-primary)" }}
          >
            {texts.popular}
          </span>
        </div>
      )}

      {/* Title */}
      <h3
        className={cn(
          "text-xl font-semibold mb-2",
          offering.isHighlighted && "text-white"
        )}
        style={{
          color: offering.isHighlighted ? "white" : "var(--profile-text)",
        }}
      >
        {offering.title}
      </h3>

      {/* Description */}
      {offering.description && (
        <p
          className={cn(
            "text-sm leading-relaxed mb-4",
            offering.isHighlighted && "text-white/90"
          )}
          style={{
            color: offering.isHighlighted ? "rgba(255,255,255,0.9)" : "var(--profile-text)",
            opacity: offering.isHighlighted ? 1 : 0.75,
          }}
        >
          {offering.description}
        </p>
      )}

      {/* Duration */}
      {offering.duration && (
        <div
          className={cn(
            "flex items-center gap-2 text-sm mb-4",
            offering.isHighlighted && "text-white/80"
          )}
          style={{
            color: offering.isHighlighted ? "rgba(255,255,255,0.8)" : "var(--profile-text)",
            opacity: offering.isHighlighted ? 1 : 0.6,
          }}
        >
          <Clock className="h-4 w-4" />
          <span>{texts.duration}: {offering.duration}</span>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Price */}
      {showPricing && (
        <div className="mt-4 pt-4 border-t border-white/20">
          {offering.price !== null && offering.price > 0 ? (
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-3xl font-bold",
                  offering.isHighlighted && "text-white"
                )}
                style={{
                  color: offering.isHighlighted ? "white" : "var(--profile-primary)",
                }}
              >
                {formatPrice(offering.price)}
              </span>
            </div>
          ) : (
            <span
              className={cn(
                "text-sm",
                offering.isHighlighted ? "text-white/80" : "opacity-60"
              )}
              style={{
                color: offering.isHighlighted ? "rgba(255,255,255,0.8)" : "var(--profile-text)",
              }}
            >
              {texts.priceOnRequest}
            </span>
          )}
        </div>
      )}

      {/* Features list (could be extended) */}
      <div className="mt-4 space-y-2">
        <div
          className={cn(
            "flex items-center gap-2 text-sm",
            offering.isHighlighted ? "text-white/90" : ""
          )}
          style={{
            color: offering.isHighlighted ? "rgba(255,255,255,0.9)" : "var(--profile-text)",
          }}
        >
          <Check
            className="h-4 w-4 shrink-0"
            style={{
              color: offering.isHighlighted ? "white" : "var(--profile-primary)",
            }}
          />
          <span>Individuell auf Sie abgestimmt</span>
        </div>
      </div>
    </div>
  );
}
