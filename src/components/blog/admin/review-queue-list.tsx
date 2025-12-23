"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  approvePost,
  requestChanges,
} from "@/lib/actions/blog/workflow";
import {
  Check,
  X,
  Eye,
  Clock,
  FileText,
  User,
  CalendarClock,
  Loader2,
} from "lucide-react";
import { ScheduleDatePicker } from "./schedule-date-picker";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author: { id: string; name: string | null; email: string };
  categories: { nameDE: string; slug: string }[];
  readingTimeMinutes: number;
  wordCount: number;
  submittedAt: Date;
  featuredImage: string | null;
}

interface ReviewQueueListProps {
  posts: Post[];
}

export function ReviewQueueList({ posts }: ReviewQueueListProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);
  const [feedbackDialog, setFeedbackDialog] = useState<{
    postId: string;
    postTitle: string;
  } | null>(null);
  const [scheduleDialog, setScheduleDialog] = useState<{
    postId: string;
    postTitle: string;
  } | null>(null);
  const [feedback, setFeedback] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);

  const handleApproveNow = async (postId: string) => {
    setProcessing(postId);
    try {
      const result = await approvePost(postId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Fehler beim Genehmigen");
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveScheduled = async () => {
    if (!scheduleDialog || !scheduledDate) return;

    setProcessing(scheduleDialog.postId);
    try {
      const result = await approvePost(scheduleDialog.postId, scheduledDate);
      if (result.success) {
        setScheduleDialog(null);
        setScheduledDate(null);
        router.refresh();
      } else {
        alert(result.error || "Fehler beim Planen");
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleRequestChanges = async () => {
    if (!feedbackDialog || !feedback.trim()) return;

    setProcessing(feedbackDialog.postId);
    try {
      const result = await requestChanges(feedbackDialog.postId, feedback);
      if (result.success) {
        setFeedbackDialog(null);
        setFeedback("");
        router.refresh();
      } else {
        alert(result.error || "Fehler beim Senden des Feedbacks");
      }
    } finally {
      setProcessing(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-lg line-clamp-1">
                    {post.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author.name || post.author.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readingTimeMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {post.wordCount} Wörter
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                  <CalendarClock className="h-3 w-3" />
                  Eingereicht {formatDistanceToNow(new Date(post.submittedAt), {
                    addSuffix: true,
                    locale: de,
                  })}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Categories */}
              <div className="flex flex-wrap gap-1">
                {post.categories.map((cat) => (
                  <Badge key={cat.slug} variant="secondary" className="text-xs">
                    {cat.nameDE}
                  </Badge>
                ))}
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/blog/edit/${post.id}`} target="_blank">
                    <Eye className="h-4 w-4 mr-1" />
                    Vorschau
                  </Link>
                </Button>

                <div className="flex-1" />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFeedbackDialog({ postId: post.id, postTitle: post.title })
                  }
                  disabled={processing === post.id}
                >
                  <X className="h-4 w-4 mr-1" />
                  Änderungen anfordern
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setScheduleDialog({ postId: post.id, postTitle: post.title })
                  }
                  disabled={processing === post.id}
                >
                  <CalendarClock className="h-4 w-4 mr-1" />
                  Planen
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleApproveNow(post.id)}
                  disabled={processing === post.id}
                >
                  {processing === post.id ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Jetzt veröffentlichen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feedback Dialog */}
      <Dialog
        open={!!feedbackDialog}
        onOpenChange={(open) => !open && setFeedbackDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Änderungen anfordern</DialogTitle>
            <DialogDescription>
              Geben Sie dem Autor Feedback, was geändert werden soll.
              Der Artikel wird zurück in den Entwurf-Status versetzt.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Bitte überarbeiten Sie..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFeedbackDialog(null)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleRequestChanges}
              disabled={!feedback.trim() || processing === feedbackDialog?.postId}
            >
              {processing === feedbackDialog?.postId ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : null}
              Feedback senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog
        open={!!scheduleDialog}
        onOpenChange={(open) => !open && setScheduleDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Veröffentlichung planen</DialogTitle>
            <DialogDescription>
              Wählen Sie Datum und Uhrzeit für die Veröffentlichung.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ScheduleDatePicker
              value={scheduledDate}
              onChange={setScheduledDate}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScheduleDialog(null)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleApproveScheduled}
              disabled={!scheduledDate || processing === scheduleDialog?.postId}
            >
              {processing === scheduleDialog?.postId ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : null}
              Planen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
