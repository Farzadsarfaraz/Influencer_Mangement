import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getInfluencerForUser } from "@/lib/data/influencers";
import { listConversationsForInfluencer } from "@/lib/data/messaging";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Messages" };

export default async function InfluencerMessagesPage() {
  const user = await requireUser();
  const influencer = await getInfluencerForUser(user.id);
  if (!influencer) redirect("/influencer/dashboard");

  const conversations = await listConversationsForInfluencer(influencer.id);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Messages</h1>

      <div className="divide-y rounded-lg border">
        {conversations.map((conversation) => {
          const lastMessage = conversation.messages[0];
          const content = (
            <div className="flex items-center justify-between p-4 text-sm">
              <div>
                <div className="font-medium">
                  {conversation.campaign.name} · {conversation.campaign.brand.name}
                </div>
                <div className="text-muted-foreground">
                  {lastMessage ? lastMessage.body : "No messages yet."}
                </div>
              </div>
              {lastMessage ? (
                <div className="text-xs text-muted-foreground">
                  {lastMessage.createdAt.toLocaleDateString()}
                </div>
              ) : null}
            </div>
          );

          return conversation.assignmentId ? (
            <Link
              key={conversation.id}
              href={`/influencer/assignments/${conversation.assignmentId}`}
              className="block hover:bg-accent"
            >
              {content}
            </Link>
          ) : (
            <div key={conversation.id}>{content}</div>
          );
        })}
        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No conversations yet — messages with your agency contact will show up here.
          </p>
        ) : null}
      </div>
    </div>
  );
}
