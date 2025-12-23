"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { format, formatDistanceToNow, isPast, isBefore, addHours } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  cancelScheduledPost,
  publishScheduledPostNow,
} from "@/lib/actions/blog/workflow";
import { reschedulePost } from "@/lib/actions/blog/scheduled";
import { ScheduleDatePicker } from "./schedule-date-picker";
import {
  Eye,
  Play,
  X,
  CalendarClock,
  User,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  author: { id: string; name: string | null; email: string };
  categories: { nameDE: string; slug: string }[];
  readingTimeMinutes: number;
  scheduledAt: Date;
}

interface ScheduledPostsListProps {
  posts: Post[];
}

export function ScheduledPostsList({ posts }: ScheduledPostsListProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    postId: string;
    postTitle: string;
    currentDate: Date;
  } | null>(null);
  const [newScheduledDate, setNewScheduledDate] = useState<Date | null>(null);

  const handlePublishNow = async (postId: string) => {
    setProcessing(postId);
    try {
      const result = await publishScheduledPostNow(postId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Fehler beim Veröffentlichen");
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleCancel = async (postId: string) => {
    if (!confirm("Möchten Sie die geplante Veröffentlichung wirklich abbrechen?")) {
      return;
    }

    setProcessing(postId);
    try {
      const result = await cancelScheduledPost(postId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Fehler beim Abbrechen");
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDialog || !newScheduledDate) return;

    setProcessing(rescheduleDialog.postId);
    try {
      const result = await reschedulePost(rescheduleDialog.postId, newScheduledDate);
      if (result.success) {
        setRescheduleDialog(null);
        setNewScheduledDate(null);
        router.refresh();
      } else {
        alert(result.error || "Fehler beim Umplanen");
      }
    } finally {
      setProcessing(null);
    }
  };

  const isComingSoon = (date: Date) => isBefore(date, addHours(new Date(), 2));

  return (
    <>
      <div className="space-y-4">
        {posts.map((post) => {
          const scheduledDate = new Date(post.scheduledAt);
          const comingSoon = isComingSoon(scheduledDate);
          const overdue = isPast(scheduledDate);

          return (
            <Card
              key={post.id}
              className={
                overdue
                  ? "border-red-200 bg-red-50/50"
                  : comingSoon
                  ? "border-yellow-200 bg-yellow-50/50"
                  : ""
              }
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <Link
                      href={`/dashboard/blog/edit/${post.id}`}
                      className="font-semibold hover:text-primary transition-colors line-clamp-1 block"
                    >
                      {post.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author.name || post.author.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readingTimeMinutes} min
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {post.categories.map((cat) => (
                        <Badge key={cat.slug} variant="outline" className="text-xs">
                          {cat.nameDE}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                        overdue
                          ? "bg-red-100 text-red-700"
                          : comingSoon
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {overdue ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <CalendarClock className="h-4 w-4" />
                      )}
                      {format(scheduledDate, "dd.MM.yy HH:mm", { locale: de })}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {overdue
                        ? "Überfällig"
                        : formatDistanceToNow(scheduledDate, {
                            addSuffix: true,
                            locale: de,
                          })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/blog/edit/${post.id}`} target="_blank">
                      <Eye className="h-4 w-4 mr-1" />
                      Vorschau
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRescheduleDialog({
                        postId: post.id,
                        postTitle: post.title,
                        currentDate: scheduledDate,
                      })
                    }
                    disabled={processing === post.id}
                  >
                    <CalendarClock className="h-4 w-4 mr-1" />
                    Umplanen
                  </Button>

                  <div className="flex-1" />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(post.id)}
                    disabled={processing === post.id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Abbrechen
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handlePublishNow(post.id)}
                    disabled={processing === post.id}
                  >
                    {processing === post.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    Jetzt veröffentlichen
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reschedule Dialog */}
      <Dialog
        open={!!rescheduleDialog}
        onOpenChange={(open) => !open && setRescheduleDialog(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Veröffentlichung umplanen</DialogTitle>
            <DialogDescription>
              Wählen Sie ein neues Datum und Uhrzeit für die Veröffentlichung.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ScheduleDatePicker
              value={newScheduledDate}
              onChange={setNewScheduledDate}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRescheduleDialog(null)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!newScheduledDate || processing === rescheduleDialog?.postId}
            >
              {processing === rescheduleDialog?.postId ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : null}
              Umplanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
