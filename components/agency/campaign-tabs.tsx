"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function CampaignTabs({ campaignId }: { campaignId: string }) {
  const pathname = usePathname();
  const base = `/agency/campaigns/${campaignId}`;

  const tabs = [
    { label: "Overview", href: base },
    { label: "Flights", href: `${base}/flights` },
    { label: "Assignments", href: `${base}/assignments` },
    { label: "Approvals", href: `${base}/approvals` },
    { label: "Performance", href: `${base}/performance` },
    { label: "Reports", href: `${base}/reports` },
  ];

  return (
    <div className="flex gap-1 border-b">
      {tabs.map((tab) => {
        const active =
          tab.href === base ? pathname === base : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
