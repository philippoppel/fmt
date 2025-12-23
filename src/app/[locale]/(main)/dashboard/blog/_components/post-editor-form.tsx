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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Eye, Loader2, X, Plus, Sparkles, Lightbulb, FileText, User } from "lucide-react";
import { createBlogPost, updateBlogPost, publishBlogPost } from "@/lib/actions/blog/posts";
import { saveDraft } from "@/lib/actions/blog/drafts";
import {
  suggestTags,
  generateTakeaways,
  generateMetaDescription,
  suggestTitles,
} from "@/lib/actions/blog/ai";
import { cn } from "@/lib/utils";
import { FeaturedImagePicker } from "./featured-image-picker";

interface Category {
  id: string;
  slug: string;
  nameDE: string;
  nameEN: string;
}

interface Author {
  id: string;
  name: string | null;
  email: string;
}

interface PostEditorFormProps {
  locale: string;
  categories: Category[];
  authors?: Author[];
  isAdmin?: boolean;
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
    authorId?: string;
  };
}

export function PostEditorForm({
  locale,
  categories,
  authors = [],
  isAdmin = false,
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
  const [featuredImageCredit, setFeaturedImageCredit] = useState("");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categoryIds || []);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [authorId, setAuthorId] = useState(initialData?.authorId || "");
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // AI loading states
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isGeneratingTakeaways, setIsGeneratingTakeaways] = useState(false);
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [takeaways, setTakeaways] = useState<string[]>([]);

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

  const handleFeaturedImageChange = (url: string, alt: string, credit?: string) => {
    setFeaturedImage(url);
    setFeaturedImageAlt(alt);
    if (credit) {
      setFeaturedImageCredit(credit);
    }
  };

  // AI Functions
  const getContentAsHtml = (): string => {
    if (!content) return "";
    if (typeof content === "string") return content;
    // TipTap JSON content - convert to simple text
    try {
      return JSON.stringify(content);
    } catch {
      return "";
    }
  };

  const handleSuggestTags = async () => {
    const htmlContent = getContentAsHtml();
    if (!htmlContent) {
      setError("Bitte schreiben Sie zuerst Inhalt für Tag-Vorschläge");
      return;
    }

    setIsGeneratingTags(true);
    setError(null);
    try {
      const result = await suggestTags(htmlContent);
      if (result.error) {
        setError(result.error);
      } else if (result.tags.length > 0) {
        // Add tags that don't already exist
        const newTags = result.tags.filter((t) => !tags.includes(t.toLowerCase()));
        setTags((prev) => [...prev, ...newTags.map((t) => t.toLowerCase())]);
      }
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleGenerateTakeaways = async () => {
    const htmlContent = getContentAsHtml();
    if (!htmlContent) {
      setError("Bitte schreiben Sie zuerst Inhalt für Takeaways");
      return;
    }

    setIsGeneratingTakeaways(true);
    setError(null);
    try {
      const result = await generateTakeaways(htmlContent);
      if (result.error) {
        setError(result.error);
      } else if (result.takeaways.length > 0) {
        setTakeaways(result.takeaways);
        // Optionally add to summary if empty
        if (!summaryMedium) {
          setSummaryMedium(result.takeaways.map((t, i) => `${i + 1}. ${t}`).join("\n"));
        }
      }
    } finally {
      setIsGeneratingTakeaways(false);
    }
  };

  const handleGenerateMetaDescription = async () => {
    const htmlContent = getContentAsHtml();
    if (!htmlContent || !title) {
      setError("Bitte geben Sie einen Titel und Inhalt ein");
      return;
    }

    setIsGeneratingMeta(true);
    setError(null);
    try {
      const result = await generateMetaDescription(htmlContent, title);
      if (result.error) {
        setError(result.error);
      } else if (result.metaDescription) {
        setMetaDescription(result.metaDescription);
      }
    } finally {
      setIsGeneratingMeta(false);
    }
  };

  const handleSuggestTitles = async () => {
    const htmlContent = getContentAsHtml();
    if (!htmlContent) {
      setError("Bitte schreiben Sie zuerst Inhalt für Titel-Vorschläge");
      return;
    }

    setIsGeneratingTitles(true);
    setError(null);
    setSuggestedTitles([]);
    try {
      const result = await suggestTitles(htmlContent, title);
      if (result.error) {
        setError(result.error);
      } else if (result.titles.length > 0) {
        setSuggestedTitles(result.titles);
      }
    } finally {
      setIsGeneratingTitles(false);
    }
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
        ...(isAdmin && authorId ? { authorId } : {}),
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
        ...(isAdmin && authorId ? { authorId } : {}),
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
        <div className="flex items-center justify-between">
          <Label htmlFor="title">Titel *</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSuggestTitles}
            disabled={isGeneratingTitles || !content}
            className="text-xs gap-1.5 h-7"
          >
            {isGeneratingTitles ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            Titel vorschlagen
          </Button>
        </div>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Artikel-Titel..."
          className="text-xl font-semibold"
        />
        {suggestedTitles.length > 0 && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground">Vorgeschlagene Titel:</p>
            {suggestedTitles.map((suggestedTitle, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTitle(suggestedTitle);
                  setSuggestedTitles([]);
                }}
                className="block w-full text-left text-sm p-2 rounded hover:bg-muted transition-colors"
              >
                {suggestedTitle}
              </button>
            ))}
          </div>
        )}
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Zusammenfassung (TLDR) *</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerateTakeaways}
            disabled={isGeneratingTakeaways || !content}
            className="text-xs gap-1.5 h-7"
          >
            {isGeneratingTakeaways ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Lightbulb className="h-3 w-3" />
            )}
            Key Takeaways generieren
          </Button>
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
          {takeaways.length > 0 && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground">Generierte Takeaways:</p>
              <ul className="space-y-1.5">
                {takeaways.map((takeaway, idx) => (
                  <li key={idx} className="text-sm flex gap-2">
                    <span className="text-muted-foreground">{idx + 1}.</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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

      {/* Author Selection (Admin only) */}
      {isAdmin && authors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Autor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={authorId} onValueChange={setAuthorId}>
              <SelectTrigger>
                <SelectValue placeholder="Autor auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {authors.map((author) => (
                  <SelectItem key={author.id} value={author.id}>
                    {author.name || author.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Tags</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSuggestTags}
            disabled={isGeneratingTags || !content}
            className="text-xs gap-1.5 h-7"
          >
            {isGeneratingTags ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            Tags vorschlagen
          </Button>
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
        <CardContent>
          <FeaturedImagePicker
            value={featuredImage}
            alt={featuredImageAlt}
            onImageChange={handleFeaturedImageChange}
          />
          {featuredImageCredit && (
            <p className="text-xs text-muted-foreground mt-2">
              {featuredImageCredit}
            </p>
          )}
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">SEO</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerateMetaDescription}
            disabled={isGeneratingMeta || !content || !title}
            className="text-xs gap-1.5 h-7"
          >
            {isGeneratingMeta ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            Meta generieren
          </Button>
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
