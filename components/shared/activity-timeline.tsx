import { UserAvatar } from "@/components/shared/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ActivityEventItem = {
  id: string;
  verb: string;
  createdAt: Date;
  actor: { name: string; image: string | null };
};

export function ActivityTimeline({
  events,
  title = "Activity",
}: {
  events: ActivityEventItem[];
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-sm">No activity yet.</p>
        ) : (
          <ol className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className="flex gap-2.5 text-sm">
                <UserAvatar
                  name={event.actor.name}
                  image={event.actor.image}
                  size="sm"
                />
                <div>
                  <span className="text-muted-foreground">
                    {event.createdAt.toLocaleString()} ·{" "}
                  </span>
                  <span className="font-medium">{event.actor.name}</span>{" "}
                  <span className="text-muted-foreground">
                    {event.verb.replace(/[._]/g, " ")}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
