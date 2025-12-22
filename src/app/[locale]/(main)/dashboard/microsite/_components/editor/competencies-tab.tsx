"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, GripVertical, Trash2, Edit2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { Competency } from "@/types/microsite";
import type { AccountType } from "@/types/therapist";
import { getTierLimits } from "@/lib/microsite/tier-limits";
import { CURATED_ICONS, ICON_CATEGORIES, searchIcons } from "@/lib/microsite/curated-icons";
import { cn } from "@/lib/utils";

interface CompetenciesTabProps {
  competencies: Competency[];
  accountType: AccountType;
  onUpdate: (competencies: Competency[]) => void;
}

export function CompetenciesTab({
  competencies,
  accountType,
  onUpdate,
}: CompetenciesTabProps) {
  const limits = getTierLimits(accountType);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const canAddMore =
    limits.maxCompetencies === Infinity ||
    competencies.length < limits.maxCompetencies;

  const handleAdd = (competency: Omit<Competency, "id" | "order">) => {
    const newCompetency: Competency = {
      ...competency,
      id: `comp_${Date.now()}`,
      order: competencies.length,
    };
    onUpdate([...competencies, newCompetency]);
    setIsAddDialogOpen(false);
  };

  const handleUpdate = (id: string, updates: Partial<Competency>) => {
    onUpdate(
      competencies.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleDelete = (id: string) => {
    onUpdate(
      competencies
        .filter((c) => c.id !== id)
        .map((c, index) => ({ ...c, order: index }))
    );
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newCompetencies = [...competencies];
    const [removed] = newCompetencies.splice(fromIndex, 1);
    newCompetencies.splice(toIndex, 0, removed);
    onUpdate(newCompetencies.map((c, index) => ({ ...c, order: index })));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Kompetenzen</h3>
          <p className="text-sm text-muted-foreground">
            {competencies.length}
            {limits.maxCompetencies !== Infinity && ` / ${limits.maxCompetencies}`}
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!canAddMore}>
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </DialogTrigger>
          <CompetencyDialog
            onSave={handleAdd}
            onClose={() => setIsAddDialogOpen(false)}
          />
        </Dialog>
      </div>

      {!canAddMore && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          Maximum erreicht. Upgrade für mehr Kompetenzen.
        </div>
      )}

      {/* Competency List */}
      <div className="space-y-2">
        {competencies
          .sort((a, b) => a.order - b.order)
          .map((competency, index) => (
            <CompetencyCard
              key={competency.id}
              competency={competency}
              index={index}
              onUpdate={(updates) => handleUpdate(competency.id, updates)}
              onDelete={() => handleDelete(competency.id)}
              onMoveUp={index > 0 ? () => handleReorder(index, index - 1) : undefined}
              onMoveDown={
                index < competencies.length - 1
                  ? () => handleReorder(index, index + 1)
                  : undefined
              }
            />
          ))}
      </div>

      {competencies.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Keine Kompetenzen definiert.</p>
          <p className="text-sm">Fügen Sie Ihre Schwerpunkte hinzu.</p>
        </div>
      )}
    </div>
  );
}

interface CompetencyCardProps {
  competency: Competency;
  index: number;
  onUpdate: (updates: Partial<Competency>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function CompetencyCard({
  competency,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: CompetencyCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const IconComponent = competency.icon
    ? (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
        competency.icon
      ]
    : null;

  return (
    <Card className="group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onMoveUp}
              disabled={!onMoveUp}
            >
              <LucideIcons.ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onMoveDown}
              disabled={!onMoveDown}
            >
              <LucideIcons.ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {IconComponent ? (
              <IconComponent className="h-5 w-5 text-primary" />
            ) : (
              <LucideIcons.Sparkles className="h-5 w-5 text-primary" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium">{competency.title}</h4>
            {competency.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {competency.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <CompetencyDialog
                competency={competency}
                onSave={(data) => {
                  onUpdate(data);
                  setIsEditing(false);
                }}
                onClose={() => setIsEditing(false)}
              />
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CompetencyDialogProps {
  competency?: Competency;
  onSave: (data: Omit<Competency, "id" | "order">) => void;
  onClose: () => void;
}

function CompetencyDialog({ competency, onSave, onClose }: CompetencyDialogProps) {
  const [title, setTitle] = useState(competency?.title || "");
  const [description, setDescription] = useState(competency?.description || "");
  const [icon, setIcon] = useState(competency?.icon || null);
  const [iconSearch, setIconSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredIcons = iconSearch
    ? searchIcons(iconSearch)
    : activeCategory
    ? CURATED_ICONS.filter((i) => i.category === activeCategory)
    : CURATED_ICONS;

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      icon,
      visible: true,
    });
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {competency ? "Kompetenz bearbeiten" : "Neue Kompetenz"}
        </DialogTitle>
        <DialogDescription>
          Beschreiben Sie einen Ihrer Schwerpunkte
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titel *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Depression & Burnout"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Beschreibung</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kurze Beschreibung Ihrer Expertise in diesem Bereich..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Icon</Label>
          <Input
            value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
            placeholder="Icon suchen..."
            className="mb-2"
          />

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Button
              variant={activeCategory === null ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveCategory(null)}
            >
              Alle
            </Button>
            {ICON_CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.labelDe}
              </Button>
            ))}
          </div>

          {/* Icon Grid */}
          <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
            {/* No icon option */}
            <button
              onClick={() => setIcon(null)}
              className={cn(
                "w-10 h-10 rounded-md flex items-center justify-center transition-colors",
                icon === null
                  ? "bg-primary text-white"
                  : "hover:bg-muted"
              )}
            >
              <LucideIcons.X className="h-5 w-5" />
            </button>

            {filteredIcons.slice(0, 63).map((iconDef) => {
              const IconComp = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
                iconDef.name
              ];
              if (!IconComp) return null;

              return (
                <button
                  key={iconDef.name}
                  onClick={() => setIcon(iconDef.name)}
                  className={cn(
                    "w-10 h-10 rounded-md flex items-center justify-center transition-colors",
                    icon === iconDef.name
                      ? "bg-primary text-white"
                      : "hover:bg-muted"
                  )}
                  title={iconDef.name}
                >
                  <IconComp className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
        <Button onClick={handleSave} disabled={!title.trim()}>
          {competency ? "Speichern" : "Hinzufügen"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
