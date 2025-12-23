"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Plus, Loader2, Trash2 } from "lucide-react";
import {
  getUserSeries,
  createSeries,
  addPostToSeries,
  removePostFromSeries,
} from "@/lib/actions/blog/series";

interface Series {
  id: string;
  title: string;
  titleDE: string;
  titleEN: string;
  slug: string;
  isPublished: boolean;
  _count: { posts: number };
}

interface SeriesManagerProps {
  postId: string;
  currentSeriesId: string | null;
  currentSeriesTitle?: string;
  onSeriesChange?: () => void;
}

export function SeriesManager({
  postId,
  currentSeriesId,
  currentSeriesTitle,
  onSeriesChange,
}: SeriesManagerProps) {
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(
    currentSeriesId || ""
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserSeries().then((result) => {
      if (result.series) {
        setSeries(result.series);
      }
      setLoading(false);
    });
  }, []);

  const handleSeriesChange = (value: string) => {
    setSelectedSeriesId(value);

    if (value === "none") {
      startTransition(async () => {
        const result = await removePostFromSeries(postId);
        if (result.success) {
          onSeriesChange?.();
        }
      });
    } else if (value === "new") {
      setShowCreateDialog(true);
    } else {
      startTransition(async () => {
        const result = await addPostToSeries(postId, value);
        if (result.success) {
          onSeriesChange?.();
        }
      });
    }
  };

  const handleCreateSeries = () => {
    if (!newSeriesTitle.trim()) return;

    startTransition(async () => {
      const result = await createSeries({
        title: newSeriesTitle,
        titleDE: newSeriesTitle,
        titleEN: newSeriesTitle,
        isPublished: true,
      });

      if (result.success && result.seriesId) {
        // Add post to new series
        await addPostToSeries(postId, result.seriesId);

        // Reload series list
        const seriesResult = await getUserSeries();
        if (seriesResult.series) {
          setSeries(seriesResult.series);
        }

        setSelectedSeriesId(result.seriesId);
        setNewSeriesTitle("");
        setShowCreateDialog(false);
        onSeriesChange?.();
      }
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Serie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-10 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Serie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={selectedSeriesId || "none"}
            onValueChange={handleSeriesChange}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Serie auswählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Keine Serie</SelectItem>
              {series.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.titleDE} ({s._count.posts} Artikel)
                </SelectItem>
              ))}
              <SelectItem value="new" className="text-primary">
                <span className="flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  Neue Serie erstellen
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {currentSeriesId && currentSeriesTitle && (
            <p className="text-xs text-muted-foreground">
              Aktuell: {currentSeriesTitle}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create Series Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Serie erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seriesTitle">Serientitel</Label>
              <Input
                id="seriesTitle"
                value={newSeriesTitle}
                onChange={(e) => setNewSeriesTitle(e.target.value)}
                placeholder="z.B. Einführung in die Achtsamkeit"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isPending}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleCreateSeries}
              disabled={isPending || !newSeriesTitle.trim()}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Serie erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
