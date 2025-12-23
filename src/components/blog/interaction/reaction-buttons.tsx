"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ThumbsUp, Lightbulb, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  toggleReaction,
  getPostReactions,
  type ReactionType,
} from "@/lib/actions/blog/reactions";

interface ReactionButtonsProps {
  postId: string;
  className?: string;
}

const REACTIONS: {
  type: ReactionType;
  icon: React.ElementType;
  label: string;
  activeColor: string;
}[] = [
  { type: "like", icon: ThumbsUp, label: "Gefällt mir", activeColor: "text-blue-500" },
  { type: "love", icon: Heart, label: "Liebe", activeColor: "text-red-500" },
  { type: "insightful", icon: Lightbulb, label: "Aufschlussreich", activeColor: "text-yellow-500" },
  { type: "helpful", icon: HelpCircle, label: "Hilfreich", activeColor: "text-green-500" },
];

export function ReactionButtons({ postId, className }: ReactionButtonsProps) {
  const [reactions, setReactions] = useState<Record<ReactionType, number>>({
    like: 0,
    love: 0,
    insightful: 0,
    helpful: 0,
  });
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getPostReactions(postId).then((data) => {
      setReactions(data.reactions);
      setUserReactions(data.userReactions);
    });
  }, [postId]);

  const handleReaction = (type: ReactionType) => {
    startTransition(async () => {
      const result = await toggleReaction(postId, type);
      if (result.success) {
        setReactions((prev) => ({
          ...prev,
          [type]: result.added ? prev[type] + 1 : Math.max(0, prev[type] - 1),
        }));
        setUserReactions((prev) =>
          result.added
            ? [...prev, type]
            : prev.filter((t) => t !== type)
        );
      }
    });
  };

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm text-muted-foreground">
        War dieser Artikel hilfreich?
        {totalReactions > 0 && (
          <span className="ml-2 text-foreground font-medium">
            {totalReactions} {totalReactions === 1 ? "Reaktion" : "Reaktionen"}
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map(({ type, icon: Icon, label, activeColor }) => {
          const isActive = userReactions.includes(type);
          const count = reactions[type];

          return (
            <Button
              key={type}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleReaction(type)}
              disabled={isPending}
              className={cn(
                "gap-1.5 transition-all",
                isActive && activeColor
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "fill-current")} />
              <span>{label}</span>
              {count > 0 && (
                <span className="ml-1 text-xs opacity-70">{count}</span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
