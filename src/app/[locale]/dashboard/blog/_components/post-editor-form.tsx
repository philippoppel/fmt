"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TipTapEditor } from "@/components/blog/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Eye, Loader2, X, Plus } from "lucide-react";
import { createBlogPost, updateBlogPost, publishBlogPost } from "@/lib/actions/blog/posts";
import { saveDraft } from "@/lib/actions/blog/drafts";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  slug: string;
  nameDE: string;
  nameEN: string;
}

interface PostEditorFormProps {
  locale: string;
  categories: Category[];
  initialData?: {
    id: string;
    title: string;
    content: unknown;
    summaryShort: string;
    summaryMedium: string | null;
    featuredImage: string | null;
    featuredImageAlt: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    categoryIds: string[];
    tags: string[];
    status: "draft" | "published";
  };
}

export function PostEditorForm({
  locale,
  categories,
  initialData,
}: PostEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState<unknown>(initialData?.content || null);
  const [summaryShort, setSummaryShort] = useState(initialData?.summaryShort || "");
  const [summaryMedium, setSummaryMedium] = useState(initialData?.summaryMedium || "");
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featuredImageAlt || "");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categoryIds || []);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const localePath = locale === "de" ? "" : `/${locale}`;

  // Autosave draft every 30 seconds
  useEffect(() => {
    if (!title && !content) return;

    const timeout = setTimeout(() => {
      saveDraft({
        title,
        content,
        summaryShort,
        postId: initialData?.id,
      }).then(() => {
        setLastSaved(new Date());
      });
    }, 30000);

    return () => clearTimeout(timeout);
  }, [title, content, summaryShort, initialData?.id]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSaveDraft = () => {
    setError(null);

    if (!title) {
      setError("Bitte geben Sie einen Titel ein");
      return;
    }

    if (selectedCategories.length === 0) {
      setError("Bitte wählen Sie mindestens eine Kategorie");
      return;
    }

    if (!summaryShort) {
      setError("Bitte geben Sie eine kurze Zusammenfassung ein");
      return;
    }

    startTransition(async () => {
      const data = {
        title,
        content,
        summaryShort,
        summaryMedium: summaryMedium || undefined,
        featuredImage: featuredImage || undefined,
        featuredImageAlt: featuredImageAlt || undefined,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        categoryIds: selectedCategories,
        tags,
        status: "draft" as const,
      };

      const result = initialData?.id
        ? await updateBlogPost(initialData.id, data)
        : await createBlogPost(data);

      if (result.success) {
        router.push(`${localePath}/dashboard/blog`);
        router.refresh();
      } else {
        setError(result.error || "Ein Fehler ist aufgetreten");
      }
    });
  };

  const handlePublish = () => {
    setError(null);

    if (!title) {
      setError("Bitte geben Sie einen Titel ein");
      return;
    }

    if (selectedCategories.length === 0) {
      setError("Bitte wählen Sie mindestens eine Kategorie");
      return;
    }

    if (!summaryShort) {
      setError("Bitte geben Sie eine kurze Zusammenfassung ein");
      return;
    }

    if (!content) {
      setError("Bitte schreiben Sie Inhalt für den Artikel");
      return;
    }

    startTransition(async () => {
      const data = {
        title,
        content,
        summaryShort,
        summaryMedium: summaryMedium || undefined,
        featuredImage: featuredImage || undefined,
        featuredImageAlt: featuredImageAlt || undefined,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        categoryIds: selectedCategories,
        tags,
        status: "published" as const,
      };

      let result;
      if (initialData?.id) {
        result = await updateBlogPost(initialData.id, data);
        if (result.success) {
          await publishBlogPost(initialData.id);
        }
      } else {
        result = await createBlogPost(data);
      }

      if (result.success) {
        router.push(`${localePath}/dashboard/blog`);
        router.refresh();
      } else {
        setError(result.error || "Ein Fehler ist aufgetreten");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Titel *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Artikel-Titel..."
          className="text-xl font-semibold"
        />
      </div>

      {/* Editor */}
      <div className="space-y-2">
        <Label>Inhalt</Label>
        <TipTapEditor
          content={content}
          onChange={setContent}
          placeholder="Schreiben Sie hier Ihren Artikel..."
        />
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Zusammenfassung (TLDR) *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summaryShort">
              Kurz (max. 280 Zeichen) *
            </Label>
            <Input
              id="summaryShort"
              value={summaryShort}
              onChange={(e) => setSummaryShort(e.target.value)}
              maxLength={280}
              placeholder="Worum geht es in diesem Artikel?"
            />
            <p className="text-xs text-muted-foreground text-right">
              {summaryShort.length}/280
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summaryMedium">Ausführlich (optional)</Label>
            <textarea
              id="summaryMedium"
              value={summaryMedium}
              onChange={(e) => setSummaryMedium(e.target.value)}
              placeholder="Detailliertere Zusammenfassung..."
              className="w-full min-h-[100px] px-3 py-2 border rounded-md bg-background text-sm resize-y"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kategorien *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => handleCategoryToggle(category.id)}
                />
                <span className="text-sm">
                  {locale === "de" ? category.nameDE : category.nameEN}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Neuen Tag hinzufügen..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleAddTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured Image */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Titelbild</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="featuredImage">Bild-URL</Label>
            <Input
              id="featuredImage"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="featuredImageAlt">Alt-Text</Label>
            <Input
              id="featuredImageAlt"
              value={featuredImageAlt}
              onChange={(e) => setFeaturedImageAlt(e.target.value)}
              placeholder="Bildbeschreibung für Barrierefreiheit"
            />
          </div>
          {featuredImage && (
            <img
              src={featuredImage}
              alt={featuredImageAlt || "Vorschau"}
              className="max-h-48 rounded-lg object-cover"
            />
          )}
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta-Titel (max. 60 Zeichen)</Label>
            <Input
              id="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              maxLength={60}
              placeholder={title || "Wird aus Titel generiert"}
            />
            <p className="text-xs text-muted-foreground text-right">
              {metaTitle.length}/60
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription">
              Meta-Beschreibung (max. 160 Zeichen)
            </Label>
            <textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              maxLength={160}
              placeholder={summaryShort || "Wird aus Zusammenfassung generiert"}
              className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background text-sm resize-y"
            />
            <p className="text-xs text-muted-foreground text-right">
              {metaDescription.length}/160
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {lastSaved && (
            <span>
              Automatisch gespeichert um{" "}
              {lastSaved.toLocaleTimeString(locale === "de" ? "de-DE" : "en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Als Entwurf speichern
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            Veröffentlichen
          </Button>
        </div>
      </div>
    </div>
  );
}
