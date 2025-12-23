"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, GripVertical } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface Category {
  id: string;
  slug: string;
  name: string;
  nameDE: string;
  nameEN: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  postCount: number;
}

interface CategoryListProps {
  categories: Category[];
}

// Helper to get icon component from string name
function getIcon(iconName: string | null) {
  if (!iconName) return FileText;
  const Icon = (LucideIcons as any)[iconName];
  return Icon || FileText;
}

export function CategoryList({ categories }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Noch keine Kategorien vorhanden
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const Icon = getIcon(category.icon);

        return (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-muted-foreground cursor-grab">
                  <GripVertical className="h-5 w-5" />
                </div>

                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: category.color
                      ? `${category.color}20`
                      : "#f3f4f6",
                    color: category.color || "#6b7280",
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{category.nameDE}</h3>
                    <Badge variant="outline" className="text-xs">
                      {category.slug}
                    </Badge>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-semibold">{category.postCount}</div>
                    <div className="text-xs text-muted-foreground">Artikel</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
