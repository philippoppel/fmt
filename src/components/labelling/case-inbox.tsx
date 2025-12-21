"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Tag,
  Trash2,
  Scale,
} from "lucide-react";
import { createCase, deleteCase, addToCalibrationPool } from "@/lib/actions/labelling";
import type { LabellingCaseWithLabels } from "@/types/labelling";

interface CaseInboxProps {
  cases: LabellingCaseWithLabels[];
  total: number;
  page: number;
  limit: number;
  currentFilters: {
    status?: string;
    source?: string;
    search?: string;
    calibrationOnly?: boolean;
  };
  isAdmin: boolean;
}

export function CaseInbox({
  cases,
  total,
  page,
  limit,
  currentFilters,
  isAdmin,
}: CaseInboxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(currentFilters.search || "");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCaseText, setNewCaseText] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / limit);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/de/labelling/cases?${params.toString()}`);
  };

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/de/labelling/cases?${params.toString()}`);
  };

  const handleSearch = () => {
    updateFilter("search", searchValue || null);
  };

  const handleCreateCase = async () => {
    setCreateError(null);
    const result = await createCase({ text: newCaseText, language: "de", source: "MANUAL" });
    if (result.success) {
      setIsCreateOpen(false);
      setNewCaseText("");
      router.refresh();
    } else {
      setCreateError(result.error || "Fehler beim Erstellen");
    }
  };

  const handleDelete = async (caseId: string) => {
    if (!confirm("Fall wirklich löschen?")) return;
    const result = await deleteCase(caseId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  const handleAddToCalibration = async (caseId: string) => {
    const result = await addToCalibrationPool(caseId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800";
      case "LABELED":
        return "bg-green-100 text-green-800";
      case "REVIEW":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <Input
            placeholder="Text durchsuchen..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="max-w-sm"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Select
          value={currentFilters.status || "all"}
          onValueChange={(v) => updateFilter("status", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="NEW">Neu</SelectItem>
            <SelectItem value="LABELED">Gelabelt</SelectItem>
            <SelectItem value="REVIEW">Review</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={currentFilters.source || "all"}
          onValueChange={(v) => updateFilter("source", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Quelle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Quellen</SelectItem>
            <SelectItem value="MANUAL">Manuell</SelectItem>
            <SelectItem value="IMPORT">Import</SelectItem>
            <SelectItem value="AI_SEEDED">AI</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={currentFilters.calibrationOnly ? "default" : "outline"}
          size="sm"
          onClick={() =>
            updateFilter(
              "calibration",
              currentFilters.calibrationOnly ? null : "true"
            )
          }
        >
          <Scale className="h-4 w-4 mr-2" />
          Kalibrierung
        </Button>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Fall
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neuen Fall erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Text des Falls</Label>
                <Textarea
                  placeholder="Geben Sie den Text ein, der gelabelt werden soll..."
                  value={newCaseText}
                  onChange={(e) => setNewCaseText(e.target.value)}
                  rows={8}
                />
              </div>
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleCreateCase}
                disabled={newCaseText.length < 10}
              >
                Erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {cases.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Keine Fälle gefunden
            </CardContent>
          </Card>
        ) : (
          cases.map((c) => (
            <Card key={c.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(c.status)}>
                        {c.status === "NEW"
                          ? "Neu"
                          : c.status === "LABELED"
                          ? "Gelabelt"
                          : "Review"}
                      </Badge>
                      <Badge variant="outline">{c.source}</Badge>
                      {c.calibrationPool && (
                        <Badge variant="secondary">
                          <Scale className="h-3 w-3 mr-1" />
                          Kalibrierung
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString("de-DE")}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{c.text}</p>
                    {c.labels.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {c.labels[0].primaryCategories.map((cat) => (
                          <Badge
                            key={cat.key}
                            variant="outline"
                            className="text-xs"
                          >
                            #{cat.rank} {cat.key}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">
                          {c.labels.length} Label(s)
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && !c.calibrationPool && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Zur Kalibrierung hinzufügen"
                        onClick={() => handleAddToCalibration(c.id)}
                      >
                        <Scale className="h-4 w-4" />
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Löschen"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                    <Link href={`/de/labelling/cases/${c.id}`}>
                      <Button>
                        <Tag className="h-4 w-4 mr-2" />
                        Labeln
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Seite {page} von {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
