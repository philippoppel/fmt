"use client";

import { useEffect, useState } from "react";

interface AnnounceProps {
  message: string;
  politeness?: "polite" | "assertive";
}

export function Announce({ message, politeness = "polite" }: AnnounceProps) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    // Kurze Verzögerung damit Screenreader die Änderung erkennen
    const timeout = setTimeout(() => {
      setAnnouncement(message);
    }, 100);

    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
