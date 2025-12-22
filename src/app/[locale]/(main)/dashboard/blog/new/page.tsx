import { Metadata } from "next";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getCategories } from "@/lib/data/blog";
import { PostEditorForm } from "../_components/post-editor-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Neuer Artikel - Dashboard",
  };
}

export default async function NewPostPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/auth/login`);
  }

  const categories = await getCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Neuen Artikel erstellen</h1>
      <PostEditorForm locale={locale} categories={categories} />
    </div>
  );
}
