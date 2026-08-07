"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { GridPattern } from "@/components/ui/grid-pattern";

type CardInfluencer = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  tier: string | null;
  status: string;
  bio: string | null;
  socialAccounts: { id: string }[];
  tags: { id: string; name: string }[];
  _count: { assignments: number };
};

const TIER_LABELS: Record<string, string> = {
  NANO: "Nano",
  MICRO: "Micro",
  MID: "Mid",
  MACRO: "Macro",
  MEGA: "Mega",
};

function platformSummary(influencer: CardInfluencer) {
  const platformCount = influencer.socialAccounts.length;
  const platforms = platformCount === 1 ? "platform" : "platforms";
  const assignments = influencer._count.assignments;
  const assignmentsLabel = assignments === 1 ? "campaign" : "campaigns";
  return `${platformCount} ${platforms} · ${assignments} ${assignmentsLabel}`;
}

/**
 * Influencer roster shown as testimonial-style cards (dashed border, corner
 * grid-pattern accent, blur-in on scroll) instead of a dense table — bio
 * reads like the "quote," tier/platform count stand in for the role/company
 * line. Adapted from a vendored testimonials-section layout; see
 * components/ui/testimonials-section.tsx for the original.
 */
export function InfluencerCardGrid({
  influencers,
}: {
  influencers: CardInfluencer[];
}) {
  if (influencers.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed py-16 text-center text-sm">
        No influencers found.
      </div>
    );
  }

  return (
    <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {influencers.map((influencer, index) => (
        <motion.div
          key={influencer.id}
          initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
          whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 * (index % 6) + 0.05, duration: 0.6 }}
          className="border-foreground/25 hover:border-foreground/50 relative overflow-hidden border border-dashed p-4 transition-colors"
        >
          <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
            <div className="from-foreground/5 to-foreground/2 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
              <GridPattern
                width={25}
                height={25}
                x={-12}
                y={4}
                strokeDasharray="3"
                className="stroke-foreground/20 absolute inset-0 h-full w-full mix-blend-overlay"
              />
            </div>
          </div>

          <Link
            href={`/agency/influencers/${influencer.id}`}
            className="relative grid grid-cols-[auto_1fr] gap-x-3"
          >
            <UserAvatar
              name={influencer.displayName}
              image={influencer.avatarUrl}
              size="default"
            />
            <div className="min-w-0">
              <div className="-mt-0.5 -space-y-0.5">
                <p className="truncate text-sm font-medium hover:underline md:text-base">
                  {influencer.displayName}
                </p>
                <span className="text-muted-foreground block text-[11px] font-light tracking-tight">
                  {platformSummary(influencer)}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1">
                <Badge variant="secondary">{influencer.status}</Badge>
                {influencer.tier ? (
                  <Badge variant="outline">
                    {TIER_LABELS[influencer.tier] ?? influencer.tier}
                  </Badge>
                ) : null}
              </div>

              <blockquote className="mt-3">
                <p className="text-foreground line-clamp-3 text-sm font-light tracking-wide">
                  {influencer.bio || "No bio yet."}
                </p>
              </blockquote>

              {influencer.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {influencer.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
