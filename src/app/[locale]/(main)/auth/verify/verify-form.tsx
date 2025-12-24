"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { verifyEmail } from "@/lib/actions/auth";

interface VerifyFormProps {
  token?: string;
}

export function VerifyForm({ token }: VerifyFormProps) {
  const t = useTranslations("auth.verify");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No verification token provided");
      return;
    }

    startTransition(async () => {
      const result = await verifyEmail(token);
      if (result.success) {
        setStatus("success");
        setVerifiedEmail(result.email);
      } else {
        setStatus("error");
        setError(result.error);
      }
    });
  }, [token]);

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
              <CardDescription>{t("verifying")}</CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                {t("successTitle")}
              </CardTitle>
              <CardDescription>{t("successDescription")}</CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold text-destructive">
                {t("errorTitle")}
              </CardTitle>
              <CardDescription className="text-destructive">
                {error}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "success" && (
            <>
              {verifiedEmail && (
                <div className="rounded-lg bg-muted p-4 text-sm text-center">
                  <Mail className="h-4 w-4 inline-block mr-2" />
                  <span className="font-medium">{verifiedEmail}</span>
                </div>
              )}
              <Button
                onClick={() => router.push("/dashboard/profile")}
                className="w-full"
              >
                {t("continueToDashboard")}
              </Button>
            </>
          )}

          {status === "error" && (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                asChild
                className="w-full"
              >
                <Link href="/auth/login">
                  {t("backToLogin")}
                </Link>
              </Button>
            </div>
          )}

          {status === "loading" && (
            <div className="text-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 inline-block mr-2 animate-spin" />
              {t("verifying")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
