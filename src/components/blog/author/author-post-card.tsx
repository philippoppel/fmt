"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { submitForReview } from "@/lib/actions/blog/workflow";
import {
  Eye,
  Edit,
  Clock,
  MessageCircle,
  Bookmark,
  Send,
  CalendarClock,
  AlertCircle,
  Loader2,
} from "lucide-react";

type PostStatus = "draft" | "review" | "scheduled" | "published" | "archived";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  readingTimeMinutes: number;
  commentCount: number;
  bookmarkCount: number;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  latestFeedback: {
    feedback: string | null;
    createdAt: Date;
    reviewerName: string | null;
  } | null;
}

interface AuthorPostCardProps {
  post: Post;
  locale: string;
}

const STATUS_CONFIG: Record<
  PostStatus,
  { label: string; variant: "default" | "secondary" | "outline"; className?: string }
> = {
  draft: { label: "Entwurf", variant: "secondary" },
  review: { label: "Zur Prüfung", variant: "secondary", className: "bg-yellow-100 text-yellow-700" },
  scheduled: { label: "Geplant", variant: "secondary", className: "bg-blue-100 text-blue-700" },
  published: { label: "Veröffentlicht", variant: "default" },
  archived: { label: "Archiviert", variant: "outline" },
};

export function AuthorPostCard({ post, locale }: AuthorPostCardProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const localePath = locale === "de" ? "" : `/${locale}`;

  const statusConfig = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    try {
      const result = await submitForReview(post.id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Fehler beim Einreichen");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Feedback Alert */}
        {post.latestFeedback && post.latestFeedback.feedback && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800">
                  Änderungen angefordert
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  {post.latestFeedback.feedback}
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  {post.latestFeedback.reviewerName && `${post.latestFeedback.reviewerName} - `}
                  {formatDistanceToNow(new Date(post.latestFeedback.createdAt), {
                    addSuffix: true,
                    locale: de,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge
                variant={statusConfig.variant}
                className={statusConfig.className}
              >
                {statusConfig.label}
              </Badge>

              {post.status === "scheduled" && post.scheduledAt && (
                <span className="flex items-center gap-1 text-xs text-blue-600">
                  <CalendarClock className="h-3 w-3" />
                  {format(new Date(post.scheduledAt), "dd.MM.yy HH:mm", { locale: de })}
                </span>
              )}

              {post.status === "published" && post.publishedAt && (
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.publishedAt), {
                    addSuffix: true,
                    locale: de,
                  })}
                </span>
              )}
            </div>

            <Link
              href={`${localePath}/dashboard/blog/${post.id}/edit`}
              className="font-semibold hover:text-primary transition-colors line-clamp-1"
            >
              {post.title}
            </Link>

            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readingTimeMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {post.commentCount}
              </span>
              <span className="flex items-center gap-1">
                <Bookmark className="h-3 w-3" />
                {post.bookmarkCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Submit for Review Button (only for drafts) */}
            {post.status === "draft" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSubmitForReview}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Zur Prüfung
              </Button>
            )}

            {/* View Button (only for published) */}
            {post.status === "published" && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`${localePath}/blog/${post.slug}`} target="_blank">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Ansehen</span>
                </Link>
              </Button>
            )}

            {/* Edit Button (not for posts in review) */}
            {post.status !== "review" && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`${localePath}/dashboard/blog/${post.id}/edit`}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Bearbeiten</span>
                </Link>
              </Button>
            )}

            {/* Disabled Edit Button for posts in review */}
            {post.status === "review" && (
              <Button variant="ghost" size="sm" disabled title="Warten auf Prüfung">
                <Edit className="h-4 w-4" />
                <span className="sr-only">In Prüfung</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
