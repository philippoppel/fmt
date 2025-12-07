"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, FileText } from "lucide-react";
import type { BlogPost } from "@/types/therapist";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const t = useTranslations("therapists");
  const tSpec = useTranslations("therapists.specialties");

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg border-l-4 border-l-amber-500">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Featured Image */}
          <div className="relative aspect-video w-full sm:aspect-square sm:w-40 shrink-0">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 160px"
            />
            <Badge className="absolute left-2 top-2 bg-amber-500 hover:bg-amber-600 gap-1">
              <FileText className="h-3 w-3" aria-hidden="true" />
              {t("blog")}
            </Badge>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-4">
            <div className="flex-1 space-y-3">
              {/* Category */}
              <Badge variant="outline" className="text-xs">
                {tSpec(post.category)}
              </Badge>

              {/* Title */}
              <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
                {post.title}
              </h3>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                  {post.author.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {post.readingTimeMinutes} {t("minRead")}
                </span>
              </div>

              {/* Excerpt */}
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {post.excerpt}
              </p>
            </div>

            {/* Action */}
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href={`/blog/${post.slug}`}>{t("readMore")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
