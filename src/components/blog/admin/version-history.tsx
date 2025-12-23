"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { History, RotateCcw, Eye, Loader2 } from "lucide-react";
import { getVersions, getVersion, restoreVersion } from "@/lib/actions/blog/versions";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface Version {
  id: string;
  versionNumber: number;
  changeNote: string | null;
  title: string;
  createdAt: Date;
  createdBy: {
    name: string | null;
    image: string | null;
  };
}

interface VersionDetail {
  id: string;
  versionNumber: number;
  changeNote: string | null;
  title: string;
  content: unknown;
  contentHtml: string;
  summaryShort: string;
  summaryMedium: string | null;
  createdAt: Date;
  createdBy: {
    name: string | null;
    image: string | null;
  };
}

interface VersionHistoryProps {
  postId: string;
}

export function VersionHistory({ postId }: VersionHistoryProps) {
  const router = useRouter();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<VersionDetail | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadVersions() {
      const result = await getVersions(postId);
      if (result.versions) {
        setVersions(result.versions);
      }
      setLoading(false);
    }
    loadVersions();
  }, [postId]);

  const handleViewVersion = async (versionId: string) => {
    const result = await getVersion(versionId);
    if (result.version) {
      setSelectedVersion(result.version);
      setShowPreview(true);
    }
  };

  const handleRestoreClick = (version: Version) => {
    setSelectedVersion(version as unknown as VersionDetail);
    setShowRestoreConfirm(true);
  };

  const handleRestoreConfirm = () => {
    if (!selectedVersion) return;

    startTransition(async () => {
      const result = await restoreVersion(postId, selectedVersion.id);
      if (result.success) {
        setShowRestoreConfirm(false);
        setSelectedVersion(null);
        router.refresh();
        // Reload versions
        const versionsResult = await getVersions(postId);
        if (versionsResult.versions) {
          setVersions(versionsResult.versions);
        }
      }
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Versionen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Versionen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Noch keine Versionen vorhanden. Versionen werden automatisch bei Änderungen erstellt.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Versionen ({versions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Version {version.versionNumber}
                    </span>
                    {version.changeNote && (
                      <span className="text-xs text-muted-foreground truncate">
                        – {version.changeNote}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {version.createdBy.name || "Unbekannt"} •{" "}
                    {formatDistanceToNow(new Date(version.createdAt), {
                      addSuffix: true,
                      locale: de,
                    })}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewVersion(version.id)}
                    className="h-8 w-8 p-0"
                    title="Vorschau"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestoreClick(version)}
                    className="h-8 w-8 p-0"
                    title="Wiederherstellen"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Version {selectedVersion?.versionNumber} – {selectedVersion?.title}
            </DialogTitle>
            <DialogDescription>
              Erstellt{" "}
              {selectedVersion?.createdAt &&
                formatDistanceToNow(new Date(selectedVersion.createdAt), {
                  addSuffix: true,
                  locale: de,
                })}
            </DialogDescription>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Zusammenfassung</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedVersion.summaryShort}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Inhalt</h4>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: selectedVersion.contentHtml }}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Schließen
            </Button>
            <Button
              onClick={() => {
                setShowPreview(false);
                setShowRestoreConfirm(true);
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Wiederherstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Version wiederherstellen?</DialogTitle>
            <DialogDescription>
              Der aktuelle Inhalt wird gesichert und durch Version{" "}
              {selectedVersion?.versionNumber} ersetzt. Diese Aktion kann rückgängig
              gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRestoreConfirm(false)}
              disabled={isPending}
            >
              Abbrechen
            </Button>
            <Button onClick={handleRestoreConfirm} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Wiederherstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
