"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";

export function RegisterForm() {
  const t = useTranslations("auth.register");

  const passwordRequirements = [
    { key: "minLength", met: false },
    { key: "uppercase", met: false },
    { key: "lowercase", met: false },
    { key: "number", met: false },
    { key: "special", met: false },
  ];

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" required>
                {t("name")}
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder={t("namePlaceholder")}
                autoComplete="name"
                required
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" required>
                {t("email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                autoComplete="email"
                required
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" required>
                {t("password")}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                autoComplete="new-password"
                required
                aria-required="true"
                aria-describedby="password-requirements"
              />
              <div
                id="password-requirements"
                className="mt-2 space-y-1 text-xs"
                role="list"
                aria-label={t("passwordRequirements.title")}
              >
                <p className="font-medium text-muted-foreground">
                  {t("passwordRequirements.title")}
                </p>
                {passwordRequirements.map((req) => (
                  <div
                    key={req.key}
                    className="flex items-center gap-2"
                    role="listitem"
                  >
                    {req.met ? (
                      <Check
                        className="h-3 w-3 text-green-600"
                        aria-hidden="true"
                      />
                    ) : (
                      <X
                        className="h-3 w-3 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={
                        req.met ? "text-green-600" : "text-muted-foreground"
                      }
                    >
                      {t(`passwordRequirements.${req.key}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" required>
                {t("confirmPassword")}
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder={t("confirmPasswordPlaceholder")}
                autoComplete="new-password"
                required
                aria-required="true"
              />
            </div>
            <div className="flex items-start space-x-2">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                aria-required="true"
                className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-snug">
                {t.rich("acceptTerms", {
                  termsLink: (chunks) => (
                    <Link
                      href="/terms"
                      className="text-primary hover:underline"
                    >
                      {chunks}
                    </Link>
                  ),
                  privacyLink: (chunks) => (
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </Label>
            </div>
            <Button type="submit" className="w-full">
              {t("submit")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {t("loginLink")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
