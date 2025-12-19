"use client";

import { useState, useId } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  { id: 1, questionKey: "q1", answerKey: "a1" },
  { id: 2, questionKey: "q2", answerKey: "a2" },
  { id: 3, questionKey: "q3", answerKey: "a3" },
  { id: 4, questionKey: "q4", answerKey: "a4" },
  { id: 5, questionKey: "q5", answerKey: "a5" },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();
  const t = useTranslations("home.faq");

  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </span>
            <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-4">
              {t("title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("subtitle")}{" "}
              <a
                href="mailto:servus@findmytherapy.at"
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                servus@findmytherapy.at
              </a>
            </p>
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              const contentId = `${baseId}-content-${index}`;
              const triggerId = `${baseId}-trigger-${index}`;

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
                >
                  <button
                    id={triggerId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <span className="text-sm sm:text-base font-semibold text-foreground">
                      {t(item.questionKey)}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-primary transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </button>
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={triggerId}
                    aria-hidden={!isOpen}
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out"
                  >
                    <div
                      className={cn(
                        "overflow-hidden px-5 pb-4 sm:px-6 sm:pb-5 text-sm sm:text-base leading-relaxed text-muted-foreground transition-opacity duration-200",
                        isOpen ? "opacity-100" : "opacity-0"
                      )}
                    >
                      {t(item.answerKey)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
