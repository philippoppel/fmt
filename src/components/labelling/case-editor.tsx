"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  SkipForward,
  Loader2,
  AlertCircle,
  CheckCircle,
  Scale,
} from "lucide-react";
import { MATCHING_TOPICS } from "@/lib/matching/topics";
import { INTENSITY_STATEMENTS } from "@/lib/matching/intensity";
import { createLabel, updateLabel } from "@/lib/actions/labelling";
import type { LabellingCaseWithLabels, Label as LabelType, PrimaryCategory, RelatedTopic, EvidenceSnippet } from "@/types/labelling";

interface CaseEditorProps {
  labelCase: LabellingCaseWithLabels;
  existingLabel: LabelType | null;
  nextCaseId: string | null;
  userId: string;
}

const CATEGORIES = MATCHING_TOPICS.filter((t) => t.id !== "other");

export function CaseEditor({
  labelCase,
  existingLabel,
  nextCaseId,
  userId,
}: CaseEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Label state
  const [selectedCategories, setSelectedCategories] = useState<PrimaryCategory[]>(
    existingLabel?.primaryCategories || []
  );
  const [subcategories, setSubcategories] = useState<Record<string, string[]>>(
    existingLabel?.subcategories || {}
  );
  const [intensity, setIntensity] = useState<Record<string, string[]>>(
    existingLabel?.intensity || {}
  );
  const [relatedTopics, setRelatedTopics] = useState<RelatedTopic[]>(
    existingLabel?.relatedTopics || []
  );
  const [uncertain, setUncertain] = useState(existingLabel?.uncertain || false);
  const [evidenceSnippets, setEvidenceSnippets] = useState<EvidenceSnippet[]>(
    existingLabel?.evidenceSnippets || []
  );

  // Get next available rank
  const getNextRank = (): 1 | 2 | 3 | null => {
    const usedRanks = new Set(selectedCategories.map((c) => c.rank));
    if (!usedRanks.has(1)) return 1;
    if (!usedRanks.has(2)) return 2;
    if (!usedRanks.has(3)) return 3;
    return null;
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    const existing = selectedCategories.find((c) => c.key === categoryId);

    if (existing) {
      // Remove category and clean up related selections
      const newCategories = selectedCategories.filter((c) => c.key !== categoryId);
      // Reorder ranks
      const sorted = newCategories.sort((a, b) => a.rank - b.rank);
      const reranked = sorted.map((c, i) => ({ ...c, rank: (i + 1) as 1 | 2 | 3 }));
      setSelectedCategories(reranked);

      // Clean up subcategories and intensity
      const newSub = { ...subcategories };
      delete newSub[categoryId];
      setSubcategories(newSub);

      const newInt = { ...intensity };
      delete newInt[categoryId];
      setIntensity(newInt);
    } else {
      // Add category
      const nextRank = getNextRank();
      if (nextRank) {
        setSelectedCategories([
          ...selectedCategories,
          { key: categoryId, rank: nextRank },
        ]);
        setSubcategories({ ...subcategories, [categoryId]: [] });
        setIntensity({ ...intensity, [categoryId]: [] });
      }
    }
  };

  // Update category rank
  const updateRank = (categoryId: string, newRank: 1 | 2 | 3) => {
    const otherWithSameRank = selectedCategories.find(
      (c) => c.rank === newRank && c.key !== categoryId
    );

    if (otherWithSameRank) {
      // Swap ranks
      const currentCategory = selectedCategories.find((c) => c.key === categoryId);
      if (currentCategory) {
        setSelectedCategories(
          selectedCategories.map((c) => {
            if (c.key === categoryId) return { ...c, rank: newRank };
            if (c.key === otherWithSameRank.key)
              return { ...c, rank: currentCategory.rank };
            return c;
          })
        );
      }
    } else {
      setSelectedCategories(
        selectedCategories.map((c) =>
          c.key === categoryId ? { ...c, rank: newRank } : c
        )
      );
    }
  };

  // Toggle subcategory
  const toggleSubcategory = (categoryId: string, subId: string) => {
    const current = subcategories[categoryId] || [];
    if (current.includes(subId)) {
      setSubcategories({
        ...subcategories,
        [categoryId]: current.filter((s) => s !== subId),
      });
    } else {
      setSubcategories({
        ...subcategories,
        [categoryId]: [...current, subId],
      });
    }
  };

  // Toggle intensity
  const toggleIntensity = (categoryId: string, intensityId: string) => {
    const current = intensity[categoryId] || [];
    if (current.includes(intensityId)) {
      setIntensity({
        ...intensity,
        [categoryId]: current.filter((i) => i !== intensityId),
      });
    } else {
      setIntensity({
        ...intensity,
        [categoryId]: [...current, intensityId],
      });
    }
  };

  // Toggle related topic
  const toggleRelatedTopic = (categoryId: string) => {
    const existing = relatedTopics.find((r) => r.key === categoryId);
    if (existing) {
      setRelatedTopics(relatedTopics.filter((r) => r.key !== categoryId));
    } else {
      // Don't add if already a primary category
      if (!selectedCategories.find((c) => c.key === categoryId)) {
        setRelatedTopics([...relatedTopics, { key: categoryId, strength: "OFTEN" }]);
      }
    }
  };

  // Handle text selection for evidence
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = labelCase.text;
    const selectedText = selection.toString();
    const startIndex = text.indexOf(selectedText);

    if (startIndex !== -1 && evidenceSnippets.length < 5) {
      const newSnippet = { start: startIndex, end: startIndex + selectedText.length };
      if (!evidenceSnippets.some((s) => s.start === newSnippet.start && s.end === newSnippet.end)) {
        setEvidenceSnippets([...evidenceSnippets, newSnippet]);
      }
    }
    selection.removeAllRanges();
  };

  // Remove evidence snippet
  const removeSnippet = (index: number) => {
    setEvidenceSnippets(evidenceSnippets.filter((_, i) => i !== index));
  };

  // Save label
  const handleSave = async (andNext: boolean = false) => {
    setError(null);
    setSuccess(false);

    if (selectedCategories.length === 0) {
      setError("Mindestens eine Kategorie auswählen");
      return;
    }

    startTransition(async () => {
      const labelData = {
        caseId: labelCase.id,
        primaryCategories: selectedCategories,
        subcategories,
        intensity,
        relatedTopics,
        uncertain,
        evidenceSnippets,
      };

      let result;
      if (existingLabel) {
        result = await updateLabel(existingLabel.id, labelData);
      } else {
        result = await createLabel(labelData);
      }

      if (result.success) {
        setSuccess(true);
        if (andNext && nextCaseId) {
          router.push(`/de/labelling/cases/${nextCaseId}`);
        } else {
          router.refresh();
        }
      } else {
        setError(result.error || "Fehler beim Speichern");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Text Display */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            Text
            {labelCase.calibrationPool && (
              <Badge variant="secondary">
                <Scale className="h-3 w-3 mr-1" />
                Kalibrierung
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/50 p-4 rounded-lg cursor-text select-text"
            onMouseUp={handleTextSelection}
          >
            {labelCase.text}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Tipp: Text markieren um Evidenz hinzuzufügen
          </p>

          {/* Evidence Snippets */}
          {evidenceSnippets.length > 0 && (
            <div className="mt-4">
              <Label className="text-sm">Markierte Evidenz:</Label>
              <div className="space-y-2 mt-2">
                {evidenceSnippets.map((snippet, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 p-2 rounded text-sm"
                  >
                    <span className="flex-1 italic">
                      &ldquo;{labelCase.text.slice(snippet.start, snippet.end)}&rdquo;
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSnippet(i)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right: Label Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Label</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {/* Primary Categories */}
              <div>
                <Label className="text-sm font-semibold">
                  Hauptkategorien (max. 3, priorisiert)
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {CATEGORIES.map((cat) => {
                    const selected = selectedCategories.find((c) => c.key === cat.id);
                    return (
                      <div
                        key={cat.id}
                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-muted-foreground/50"
                        }`}
                        onClick={() => toggleCategory(cat.id)}
                      >
                        <Checkbox checked={!!selected} />
                        <span className="text-sm flex-1">{cat.id}</span>
                        {selected && (
                          <select
                            className="text-xs border rounded px-1"
                            value={selected.rank}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              updateRank(cat.id, parseInt(e.target.value) as 1 | 2 | 3)
                            }
                          >
                            <option value={1}>#1</option>
                            <option value={2}>#2</option>
                            <option value={3}>#3</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subcategories for selected categories */}
              {selectedCategories.length > 0 && (
                <>
                  <Separator />
                  {selectedCategories
                    .sort((a, b) => a.rank - b.rank)
                    .map((cat) => {
                      const topic = CATEGORIES.find((t) => t.id === cat.key);
                      if (!topic || topic.subTopics.length === 0) return null;

                      return (
                        <div key={cat.key}>
                          <Label className="text-sm font-semibold">
                            Subkategorien: {cat.key} (#{cat.rank})
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {topic.subTopics.map((sub) => {
                              const isSelected = (subcategories[cat.key] || []).includes(
                                sub.id
                              );
                              return (
                                <Badge
                                  key={sub.id}
                                  variant={isSelected ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => toggleSubcategory(cat.key, sub.id)}
                                >
                                  {sub.id}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </>
              )}

              {/* Intensity Markers */}
              {selectedCategories.length > 0 && (
                <>
                  <Separator />
                  {selectedCategories
                    .sort((a, b) => a.rank - b.rank)
                    .map((cat) => {
                      const statements = INTENSITY_STATEMENTS[cat.key];
                      if (!statements || statements.length === 0) return null;

                      return (
                        <div key={`intensity-${cat.key}`}>
                          <Label className="text-sm font-semibold">
                            Intensität: {cat.key}
                          </Label>
                          <p className="text-xs text-muted-foreground mb-2">
                            Nur auswählen, wenn im Text erkennbar
                          </p>
                          <div className="space-y-1">
                            {statements.map((stmt) => {
                              const isSelected = (intensity[cat.key] || []).includes(
                                stmt.id
                              );
                              return (
                                <div
                                  key={stmt.id}
                                  className="flex items-center gap-2"
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      toggleIntensity(cat.key, stmt.id)
                                    }
                                  />
                                  <span className="text-sm">{stmt.id}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </>
              )}

              {/* Related Topics */}
              <Separator />
              <div>
                <Label className="text-sm font-semibold">
                  Related Topics (optional)
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Themen, die häufig zusammenhängen
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter(
                    (cat) => !selectedCategories.find((c) => c.key === cat.id)
                  ).map((cat) => {
                    const isRelated = relatedTopics.find((r) => r.key === cat.id);
                    return (
                      <Badge
                        key={cat.id}
                        variant={isRelated ? "secondary" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleRelatedTopic(cat.id)}
                      >
                        {cat.id}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Uncertain Flag */}
              <Separator />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="uncertain"
                  checked={uncertain}
                  onCheckedChange={(checked) => setUncertain(!!checked)}
                />
                <Label htmlFor="uncertain" className="text-sm cursor-pointer">
                  Unsicher / mehr Info nötig
                </Label>
              </div>
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                Label gespeichert!
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => handleSave(false)}
                disabled={isPending || selectedCategories.length === 0}
                className="flex-1"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Speichern
              </Button>

              {nextCaseId && (
                <Button
                  onClick={() => handleSave(true)}
                  disabled={isPending || selectedCategories.length === 0}
                  variant="secondary"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <SkipForward className="h-4 w-4 mr-2" />
                  )}
                  Speichern & Weiter
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
