"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableItemProps {
  id: string;
  label: string;
  index: number;
  disabled?: boolean;
}

function SortableItem({ id, label, index, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Rank icons and styles
  const getRankIndicator = (idx: number) => {
    if (idx === 0) return { icon: Trophy, color: "text-amber-500", bg: "bg-amber-100" };
    if (idx === 1) return { icon: Medal, color: "text-slate-400", bg: "bg-slate-100" };
    if (idx === 2) return { icon: Award, color: "text-orange-600", bg: "bg-orange-100" };
    return null;
  };

  const rankIndicator = getRankIndicator(index);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 bg-background",
        "transition-shadow duration-200",
        isDragging && "shadow-lg ring-2 ring-primary z-50",
        disabled && "opacity-60 cursor-not-allowed",
        !disabled && "hover:border-primary/50"
      )}
    >
      {/* Drag Handle */}
      <button
        type="button"
        className={cn(
          "touch-none p-1 rounded hover:bg-muted transition-colors",
          disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Rank Indicator */}
      {rankIndicator && (
        <div className={cn("flex items-center justify-center h-7 w-7 rounded-full", rankIndicator.bg)}>
          <rankIndicator.icon className={cn("h-4 w-4", rankIndicator.color)} />
        </div>
      )}
      {!rankIndicator && (
        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted">
          <span className="text-xs text-muted-foreground font-medium">{index + 1}</span>
        </div>
      )}

      {/* Label */}
      <span className="text-sm font-medium flex-1">{label}</span>
    </div>
  );
}

interface SortableSpecializationsProps {
  items: string[];
  labels: Record<string, string>;
  onOrderChange: (newOrder: string[]) => void;
  disabled?: boolean;
}

export function SortableSpecializations({
  items,
  labels,
  onOrderChange,
  disabled = false,
}: SortableSpecializationsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      onOrderChange(newOrder);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Wähle zuerst Fachgebiete aus
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((id, index) => (
            <SortableItem
              key={id}
              id={id}
              label={labels[id] || id}
              index={index}
              disabled={disabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
