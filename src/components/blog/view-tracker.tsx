"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  postId: string;
}

export function ViewTracker({ postId }: ViewTrackerProps) {
  useEffect(() => {
    // Only track in production or if explicitly enabled
    const shouldTrack = process.env.NODE_ENV === "production" ||
                        process.env.NEXT_PUBLIC_TRACK_VIEWS === "true";

    if (!shouldTrack) return;

    // Track the view
    fetch("/api/blog/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    }).catch(() => {
      // Silently fail - view tracking is not critical
    });
  }, [postId]);

  // This component doesn't render anything
  return null;
}
