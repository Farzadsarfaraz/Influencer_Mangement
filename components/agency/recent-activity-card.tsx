import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { getRecentAgencyActivity } from "@/lib/data/activity";

type ActivityEvents = Awaited<ReturnType<typeof getRecentAgencyActivity>>;

const VERB_LABELS: Record<string, string> = {
  "brand.created": "created a brand",
  "brand.member_invited": "invited a brand member",
  "assignment.created": "created an assignment",
  "assignment.status_changed": "updated an assignment's status",
  "campaign.created": "created a campaign",
  "campaign.status_changed": "changed a campaign's status",
  "content.submitted": "submitted content",
  "influencer.created": "added an influencer",
};

function describeEvent(verb: string) {
  if (VERB_LABELS[verb]) return VERB_LABELS[verb];

  // Dynamic approval verbs: approval.<internal|client>_<approved|rejected|...>
  const [entity, ...rest] = verb.split(".");
  if (entity === "approval") {
    const [stage, ...decision] = rest.join("_").split("_");
    return `${decision.join(" ")} ${stage} review`.trim();
  }

  return verb.replace(/[._]/g, " ");
}

/** Agency-wide feed of what just happened, across every campaign. */
export function RecentActivityCard({ events }: { events: ActivityEvents }) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
            <Activity className="size-4" />
            Nothing has happened yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className="flex gap-2.5 text-sm">
                <span className="bg-primary/60 mt-1.5 size-1.5 shrink-0 rounded-full" />
                <p className="min-w-0 flex-1">
                  <span className="font-medium">{event.actor.name}</span>{" "}
                  <span className="text-muted-foreground">
                    {describeEvent(event.verb)}
                  </span>
                  {event.campaign ? (
                    <span className="text-muted-foreground">
                      {" "}
                      in {event.campaign.name}
                    </span>
                  ) : null}
                  <span className="text-muted-foreground block text-xs">
                    {formatDistanceToNow(event.createdAt, { addSuffix: true })}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
