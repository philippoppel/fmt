"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTopicById } from "@/lib/matching/topics";
import { useMatching } from "../matching-context";

export function RefinementSelection() {
  const t = useTranslations();
  const { state, actions, computed } = useMatching();

  if (computed.selectedTopicDetails.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("matching.wizard.step3Title")}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t("matching.wizard.step3Subtitle")}
        </p>
      </div>

      {/* Subtopics grouped by topic */}
      <div className="mx-auto max-w-3xl space-y-4">
        {computed.selectedTopicDetails.map((topic) => (
          <Card key={topic.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50 py-3">
              <CardTitle className="text-base font-medium">
                {t(topic.labelKey)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {topic.subTopics.map((subTopic) => (
                  <label
                    key={subTopic.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <Checkbox
                      checked={state.selectedSubTopics.includes(subTopic.id)}
                      onCheckedChange={() =>
                        actions.toggleSubTopic(subTopic.id)
                      }
                    />
                    <span className="text-sm font-medium">
                      {t(subTopic.labelKey)}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selection count */}
      {state.selectedSubTopics.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {t("matching.wizard.refinementCount", {
            count: state.selectedSubTopics.length,
          })}
        </p>
      )}

      {/* Skip hint */}
      <p className="text-center text-sm text-muted-foreground">
        {t("matching.wizard.refinementOptional")}
      </p>
    </div>
  );
}
