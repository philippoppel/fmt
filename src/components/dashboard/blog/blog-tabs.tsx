"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AuthorPostCard } from "@/components/blog/author/author-post-card";
import { AdminBlogTable } from "@/components/blog/admin/admin-blog-table";
import { ReviewQueueList } from "@/components/blog/admin/review-queue-list";
import { ScheduledPostsList } from "@/components/blog/admin/scheduled-posts-list";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CalendarClock } from "lucide-react";

type PostStatus = "draft" | "review" | "scheduled" | "published" | "archived";

interface UserPost {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  readingTimeMinutes: number;
  commentCount: number;
  bookmarkCount: number;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  latestFeedback: {
    feedback: string | null;
    createdAt: Date;
    reviewerName: string | null;
  } | null;
}

interface AdminPost {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  author: { name: string | null; email: string };
  categories: { nameDE: string; slug: string }[];
  readingTimeMinutes: number;
  commentCount: number;
  bookmarkCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  scheduledAt: Date | null;
}

interface ReviewPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author: { id: string; name: string | null; email: string };
  categories: { nameDE: string; slug: string }[];
  readingTimeMinutes: number;
  wordCount: number;
  submittedAt: Date;
  featuredImage: string | null;
}

interface ScheduledPost {
  id: string;
  title: string;
  slug: string;
  author: { id: string; name: string | null; email: string };
  categories: { nameDE: string; slug: string }[];
  readingTimeMinutes: number;
  scheduledAt: Date;
}

interface Author {
  id: string;
  name: string | null;
  email: string;
}

interface BlogTabsProps {
  isAdmin: boolean;
  locale: string;
  userPosts: UserPost[];
  // Admin-only props
  allPosts?: AdminPost[];
  reviewPosts?: ReviewPost[];
  scheduledPosts?: ScheduledPost[];
  authors?: Author[];
  reviewCount?: number;
  scheduledCount?: number;
}

export function BlogTabs({
  isAdmin,
  locale,
  userPosts,
  allPosts = [],
  reviewPosts = [],
  scheduledPosts = [],
  authors = [],
  reviewCount = 0,
  scheduledCount = 0,
}: BlogTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "my-articles";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "my-articles") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : ".", { scroll: false });
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="flex flex-wrap h-auto gap-1">
        <TabsTrigger value="my-articles" className="gap-1.5">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Meine Artikel</span>
          <span className="sm:hidden">Meine</span>
        </TabsTrigger>

        {isAdmin && (
          <>
            <TabsTrigger value="all" className="gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Alle Artikel</span>
              <span className="sm:hidden">Alle</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {allPosts.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger value="review" className="gap-1.5">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Zur Prüfung</span>
              <span className="sm:hidden">Prüfung</span>
              {reviewCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                  {reviewCount}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="scheduled" className="gap-1.5">
              <CalendarClock className="h-4 w-4" />
              <span className="hidden sm:inline">Geplant</span>
              <span className="sm:hidden">Geplant</span>
              {scheduledCount > 0 && (
                <Badge variant="outline" className="ml-1 h-5 px-1.5 text-xs">
                  {scheduledCount}
                </Badge>
              )}
            </TabsTrigger>
          </>
        )}
      </TabsList>

      {/* My Articles Tab */}
      <TabsContent value="my-articles" className="mt-6">
        {userPosts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Noch keine Artikel</h3>
              <p className="text-muted-foreground text-center">
                Erstellen Sie Ihren ersten Blog-Artikel
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <AuthorPostCard
                key={post.id}
                post={post}
                locale={locale}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Admin: All Articles Tab */}
      {isAdmin && (
        <TabsContent value="all" className="mt-6">
          <AdminBlogTable
            posts={allPosts}
            authors={authors}
            currentStatus={searchParams.get("status") || "all"}
            currentAuthor={searchParams.get("author") || ""}
            currentSearch={searchParams.get("search") || ""}
          />
        </TabsContent>
      )}

      {/* Admin: Review Queue Tab */}
      {isAdmin && (
        <TabsContent value="review" className="mt-6">
          {reviewPosts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Keine Artikel zur Prüfung</h3>
                <p className="text-muted-foreground text-center">
                  Alle eingereichten Artikel wurden bereits geprüft.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ReviewQueueList posts={reviewPosts} />
          )}
        </TabsContent>
      )}

      {/* Admin: Scheduled Posts Tab */}
      {isAdmin && (
        <TabsContent value="scheduled" className="mt-6">
          {scheduledPosts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarClock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Keine geplanten Artikel</h3>
                <p className="text-muted-foreground text-center">
                  Geplante Veröffentlichungen erscheinen hier.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScheduledPostsList posts={scheduledPosts} />
          )}
        </TabsContent>
      )}
    </Tabs>
  );
}
