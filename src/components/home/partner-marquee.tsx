"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

const PARTNERS = [
  {
    name: "SFU Wien",
    logo: "/images/partners/sfu.svg",
    alt: "SFU Wien - Sigmund Freud Privatuniversität",
  },
  {
    name: "VÖPP",
    logo: "/images/partners/voepp.png",
    alt: "VÖPP - Vereinigung Österreichischer Psychotherapeutinnen und Psychotherapeuten",
  },
  {
    name: "ÖBVP",
    logo: "/images/partners/oebvp.png",
    alt: "ÖBVP - Österreichischer Bundesverband für Psychotherapie",
  },
  {
    name: "2 Minuten 2 Millionen",
    logo: "/images/partners/2min2mil.png",
    alt: "2 Minuten 2 Millionen",
  },
];

export function PartnerMarquee() {
  const t = useTranslations("home.partners");

  return (
    <section className="py-8 bg-white/80 backdrop-blur-sm border-y border-border/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-4">
        <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-widest">
          {t("title")}
        </p>
      </div>

      {/* Marquee container */}
      <div className="relative">
        {/* Gradient fades on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Scrolling content */}
        <div className="flex animate-marquee">
          {/* First set */}
          {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex-shrink-0 mx-8 sm:mx-12 flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
            >
              <Image
                src={partner.logo}
                alt={partner.alt}
                width={120}
                height={48}
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, index) => (
            <div
              key={`${partner.name}-dup-${index}`}
              className="flex-shrink-0 mx-8 sm:mx-12 flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
            >
              <Image
                src={partner.logo}
                alt={partner.alt}
                width={120}
                height={48}
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
