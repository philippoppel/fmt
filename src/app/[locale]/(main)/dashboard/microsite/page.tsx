import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

// This route has been merged into /dashboard/customize
// Redirect all traffic there
export default async function MicrositePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  redirect(`/${locale}/dashboard/customize`);
}
