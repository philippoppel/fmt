"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { login } from "@/lib/actions/auth";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result.success) {
        router.push("/dashboard/settings");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  async function handleOAuthLogin(provider: "google") {
    await signIn(provider, { callbackUrl: "/dashboard/settings" });
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required>
                  {t("password")}
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                autoComplete="current-password"
                required
                aria-required="true"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                {t("rememberMe")}
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t("orContinueWith")}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={() => handleOAuthLogin("google")}
            disabled={isPending}
          >
            Mit Google anmelden
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {t("registerLink")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
