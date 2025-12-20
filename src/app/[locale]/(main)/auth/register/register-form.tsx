"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Loader2, Mail, ExternalLink } from "lucide-react";
import { register } from "@/lib/actions/auth";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  const passwordRequirements = [
    { key: "minLength", met: password.length >= 8 },
    { key: "uppercase", met: /[A-Z]/.test(password) },
    { key: "lowercase", met: /[a-z]/.test(password) },
    { key: "number", met: /[0-9]/.test(password) },
    { key: "special", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await register(formData);
      if (result.success) {
        setRegistrationSuccess(true);
        // Store token for dev mode display
        if (result.verificationToken) {
          setVerificationToken(result.verificationToken);
        }
      } else {
        setError(result.error);
      }
    });
  }

  // Show success message after registration
  if (registrationSuccess) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">{t("successTitle")}</CardTitle>
            <CardDescription>{t("successDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <p>{t("checkEmailInstructions")}</p>
            </div>

            {/* Development mode: Show verification link */}
            {verificationToken && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="mb-2 text-sm font-medium text-amber-800">
                  🔧 Development Mode
                </p>
                <p className="mb-3 text-xs text-amber-700">
                  In production, this link would be sent via email.
                </p>
                <Link
                  href={`/auth/verify?token=${verificationToken}`}
                  className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Verify Email Now
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/settings")}
                className="w-full"
              >
                {t("continueToDashboard")}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {t("verifyLater")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <form action={handleSubmit} className="space-y-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-destructive">{t("passwordMismatch")}</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {t("passwordMatch")}
                </p>
              )}
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                t("submit")
              )}
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
