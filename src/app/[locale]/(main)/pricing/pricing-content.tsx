"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Star, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { FEATURE_COMPARISON } from "@/lib/permissions/profile-permissions";

const PRICING_TIERS = [
  {
    key: "gratis",
    price: 0,
    icon: User,
    popular: false,
    gradient: "",
    buttonVariant: "outline" as const,
  },
  {
    key: "mittel",
    price: 29,
    icon: Star,
    popular: true,
    gradient: "from-blue-500 to-blue-600",
    buttonVariant: "default" as const,
  },
  {
    key: "premium",
    price: 79,
    icon: Crown,
    popular: false,
    gradient: "from-amber-400 to-orange-500",
    buttonVariant: "default" as const,
  },
];

export function PricingContent() {
  const t = useTranslations("pricing");

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          Abo-Modelle
        </Badge>
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        {PRICING_TIERS.map((tier) => {
          const Icon = tier.icon;
          const isPopular = tier.popular;

          return (
            <Card
              key={tier.key}
              className={cn(
                "relative overflow-hidden transition-all hover:shadow-xl",
                isPopular && "border-primary shadow-lg scale-105 z-10"
              )}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -right-12 top-6 rotate-45 bg-primary px-12 py-1 text-xs font-semibold text-primary-foreground">
                  {t("mostPopular")}
                </div>
              )}

              {/* Gradient Header for paid tiers */}
              {tier.gradient && (
                <div className={cn("h-2 bg-gradient-to-r", tier.gradient)} />
              )}

              <CardHeader className="text-center pb-2">
                <div
                  className={cn(
                    "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                    tier.gradient
                      ? `bg-gradient-to-br ${tier.gradient} text-white`
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">{t(`tiers.${tier.key}`)}</CardTitle>
                <CardDescription>{t(`${tier.key}Description`)}</CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                {/* Price */}
                <div className="mb-6">
                  <span className="text-5xl font-bold">{tier.price}€</span>
                  <span className="text-muted-foreground">/{t("perMonth")}</span>
                </div>

                {/* CTA Button */}
                <Button
                  asChild
                  variant={tier.buttonVariant}
                  className={cn(
                    "w-full mb-6",
                    tier.gradient &&
                      `bg-gradient-to-r ${tier.gradient} hover:opacity-90 border-0`
                  )}
                  size="lg"
                >
                  <Link href="/contact">
                    {tier.price === 0 ? t("currentPlan") : t("contactUs")}
                  </Link>
                </Button>

                {/* Features List */}
                <div className="space-y-3 text-left">
                  {FEATURE_COMPARISON.map((feature) => {
                    const value = feature[tier.key as keyof typeof feature];
                    const isBoolean = typeof value === "boolean";
                    const isIncluded = isBoolean ? value : true;

                    return (
                      <div
                        key={feature.key}
                        className={cn(
                          "flex items-center gap-3 text-sm",
                          !isIncluded && "text-muted-foreground"
                        )}
                      >
                        {isIncluded ? (
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                        )}
                        <span>{t(`features.${feature.key}`)}</span>
                        {!isBoolean && value !== "-" && (
                          <span className="ml-auto font-medium text-primary">
                            {value}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Coming Soon Notice */}
      <div className="text-center">
        <Card className="max-w-2xl mx-auto border-dashed">
          <CardContent className="py-8">
            <Sparkles className="mx-auto h-12 w-12 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t("comingSoon")}</h3>
            <p className="text-muted-foreground mb-4">
              Die Abo-Verwaltung wird bald verfügbar sein. Kontaktiere uns für
              ein Upgrade.
            </p>
            <Button asChild>
              <Link href="/contact">Kontaktiere uns</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
