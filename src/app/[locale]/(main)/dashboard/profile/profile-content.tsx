"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ProfileForm } from "../settings/profile-form";
import type { ProfileData } from "@/lib/actions/profile";
import type { AccountType } from "@/types/therapist";

interface ProfileContentProps {
  initialData: ProfileData;
  accountType: AccountType;
  slug?: string | null;
}

export function ProfileContent({ initialData, accountType, slug }: ProfileContentProps) {
  const t = useTranslations("dashboard.profile");

  return (
    <div className="space-y-6">
      {/* Header with Preview Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        {slug && (
          <Link href={`/therapeuten/${slug}`} target="_blank">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              {t("viewMicrosite")}
            </Button>
          </Link>
        )}
      </div>

      {/* Profile Form */}
      <ProfileForm initialData={initialData} accountType={accountType} />
    </div>
  );
}
