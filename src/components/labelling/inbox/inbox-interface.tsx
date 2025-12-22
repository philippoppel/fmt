"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

import { FilterTabs } from "./filter-tabs";
import { CaseListItem } from "./case-list-item";
import { ProgressIndicator } from "./progress-indicator";
import type { CaseStatus } from "@prisma/client";

interface CaseItem {
  id: string;
  text: string;
  status: CaseStatus;
  createdAt: Date;
  labeledCategories: string[];
  isCalibration: boolean;
}

interface InboxInterfaceProps {
  cases: CaseItem[];
  counts: {
    all: number;
    new: number;
    labeled: number;
    review: number;
    calibration: number;
  };
  stats: {
    todayLabeled: number;
    totalLabeled: number;
  };
}

/**
 * Inbox interface showing all cases with filters
 */
export function InboxInterface({ cases, counts, stats }: InboxInterfaceProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<
    CaseStatus | "ALL" | "CALIBRATION"
  >("ALL");

  // Filter cases based on active filter
  const filteredCases = cases.filter((c) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "CALIBRATION") return c.isCalibration;
    return c.status === activeFilter;
  });

  const handleCaseClick = (caseId: string) => {
    router.push(`/de/labelling/cases/${caseId}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Inbox</h1>
          <ProgressIndicator
            todayLabeled={stats.todayLabeled}
            totalLabeled={stats.totalLabeled}
          />
        </div>
        <Link href="/de/labelling/cases/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Neuer Fall</span>
          </Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <FilterTabs
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />

      {/* Case list */}
      {filteredCases.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center">
          <p className="text-muted-foreground">Keine Fälle gefunden</p>
          <Link href="/de/labelling/cases/new">
            <Button variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Neuen Fall erstellen
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCases.map((caseItem) => (
            <CaseListItem
              key={caseItem.id}
              id={caseItem.id}
              text={caseItem.text}
              status={caseItem.status}
              createdAt={caseItem.createdAt}
              labeledCategories={caseItem.labeledCategories}
              isCalibration={caseItem.isCalibration}
              onClick={() => handleCaseClick(caseItem.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
