"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, Clock, FileText, MessageSquare, Bookmark } from "lucide-react";
import { getPostStats } from "@/lib/actions/blog/versions";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface PostStatsProps {
  postId: string;
}

interface Stats {
  viewCount: number;
  uniqueViewCount: number;
  readingTimeMinutes: number;
  wordCount: number;
  commentCount: number;
  bookmarkCount: number;
  publishedAt: Date | null;
}

export function PostStats({ postId }: PostStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const result = await getPostStats(postId);
      if (result.stats) {
        setStats(result.stats);
      }
      setLoading(false);
    }
    loadStats();
  }, [postId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statistiken</CardTitle>
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

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      icon: Eye,
      label: "Aufrufe",
      value: stats.viewCount.toLocaleString("de-DE"),
    },
    {
      icon: Users,
      label: "Unique Besucher",
      value: stats.uniqueViewCount.toLocaleString("de-DE"),
    },
    {
      icon: Clock,
      label: "Lesezeit",
      value: `${stats.readingTimeMinutes} Min.`,
    },
    {
      icon: FileText,
      label: "Wörter",
      value: stats.wordCount.toLocaleString("de-DE"),
    },
    {
      icon: MessageSquare,
      label: "Kommentare",
      value: stats.commentCount.toString(),
    },
    {
      icon: Bookmark,
      label: "Lesezeichen",
      value: stats.bookmarkCount.toString(),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Statistiken</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((item) => (
            <div key={item.label} className="flex items-start gap-2 min-w-0">
              <item.icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold tabular-nums">{item.value}</p>
                <p className="text-xs text-muted-foreground truncate">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
        {stats.publishedAt && (
          <p className="text-xs text-muted-foreground mt-4 pt-3 border-t">
            Veröffentlicht{" "}
            {formatDistanceToNow(new Date(stats.publishedAt), {
              addSuffix: true,
              locale: de,
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
