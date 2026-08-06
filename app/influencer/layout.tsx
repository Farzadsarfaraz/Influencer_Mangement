import { LayoutDashboard, MessageCircle, Sparkles, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

import { PortalShell, type PortalNavItem } from "@/components/shared/portal-shell";
import { INFLUENCER_ROLES } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

const navItems: PortalNavItem[] = [
  { label: "Dashboard", href: "/influencer/dashboard", icon: <LayoutDashboard /> },
  { label: "Assignments", href: "/influencer/assignments", icon: <Sparkles /> },
  { label: "Messages", href: "/influencer/messages", icon: <MessageCircle /> },
  { label: "Payments", href: "/influencer/payments", icon: <Wallet /> },
];

export default async function InfluencerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || !INFLUENCER_ROLES.includes(user.role)) redirect("/sign-in");

  return (
    <PortalShell portalLabel="Influencer Portal" navItems={navItems} user={user}>
      {children}
    </PortalShell>
  );
}
