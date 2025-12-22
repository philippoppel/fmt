"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { UserTypeToggle, type UserType } from "./user-type-toggle";
import { AboutPageContent } from "@/components/about/about-page-content";
import { SeekerMissionContent } from "./seeker-mission-content";

export function MissionPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const view = (searchParams.get("view") as UserType) || "seeker";

  const setView = useCallback(
    (newView: UserType) => {
      const params = new URLSearchParams(searchParams);
      params.set("view", newView);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Toggle Section */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 py-4">
        <div className="container mx-auto px-4">
          <UserTypeToggle value={view} onChange={setView} />
        </div>
      </div>

      {/* Content */}
      {view === "seeker" ? <SeekerMissionContent /> : <AboutPageContent />}
    </div>
  );
}
