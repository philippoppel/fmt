"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toggleBookmark, isBookmarked } from "@/lib/actions/blog/bookmarks";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  postId: string;
  className?: string;
  showLabel?: boolean;
}

export function BookmarkButton({
  postId,
  className,
  showLabel = true,
}: BookmarkButtonProps) {
  const { status } = useSession();
  const [bookmarked, setBookmarked] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status === "authenticated") {
      isBookmarked(postId).then((result) => {
        if (result.success && result.data) {
          setBookmarked(result.data);
        }
      });
    }
  }, [postId, status]);

  const handleToggle = () => {
    if (status !== "authenticated") {
      // Redirect to login or show message
      return;
    }

    startTransition(async () => {
      const result = await toggleBookmark(postId);
      if (result.success && result.data) {
        setBookmarked(result.data.isBookmarked);
      }
    });
  };

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <Button
      variant={bookmarked ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isPending || status === "loading"}
      className={cn("gap-2", className)}
      aria-pressed={bookmarked}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : bookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showLabel && (bookmarked ? "Gespeichert" : "Merken")}
    </Button>
  );
}
