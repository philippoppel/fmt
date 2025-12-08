"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types/therapist";

interface KnowledgeCardProps {
  article: BlogPost;
  className?: string;
}

export function KnowledgeCard({ article, className }: KnowledgeCardProps) {
  const t = useTranslations("therapists.results");
  const tSpec = useTranslations("therapists.specialties");

  return (
    <Link href={`/blog/${article.slug}`}>
      <Card
        className={cn(
          "group flex overflow-hidden transition-all duration-200",
          "hover:shadow-lg hover:shadow-accent/10",
          "h-full",
          className
        )}
      >
        {/* Image */}
        <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28 overflow-hidden">
          <Image
            src={article.featuredImage || "/placeholder-blog.jpg"}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="112px"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
          <div className="space-y-1.5">
            {/* Category Badge */}
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-accent-foreground/30 text-accent-foreground"
            >
              {tSpec(article.category)}
            </Badge>

            {/* Title */}
            <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.readingTimeMinutes} Min
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {article.author.name.split(" ")[0]}
              </span>
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
