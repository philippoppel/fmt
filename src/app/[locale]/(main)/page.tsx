import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Globe } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomePageContent />;
}

function HomePageContent() {
  const t = useTranslations("home");
  const tNav = useTranslations("navigation");

  const features = [
    {
      icon: Globe,
      title: t("features.accessibility.title"),
      description: t("features.accessibility.description"),
    },
    {
      icon: Zap,
      title: t("features.performance.title"),
      description: t("features.performance.description"),
    },
    {
      icon: Shield,
      title: t("features.security.title"),
      description: t("features.security.description"),
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section
        className="container mx-auto px-4 py-16 md:py-24"
        aria-labelledby="hero-heading"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h1
            id="hero-heading"
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            {t("hero.subtitle")}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/therapists">{t("hero.ctaSecondary")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/register">{t("hero.cta")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="border-t bg-muted/50 py-16 md:py-24"
        aria-labelledby="features-heading"
      >
        <div className="container mx-auto px-4">
          <h2
            id="features-heading"
            className="mb-12 text-center text-3xl font-bold tracking-tight"
          >
            {t("features.title")}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon
                      className="h-6 w-6 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
