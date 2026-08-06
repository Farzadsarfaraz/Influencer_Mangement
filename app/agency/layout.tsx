import {
  Building2,
  History,
  LayoutDashboard,
  Megaphone,
  ShieldCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { redirect } from "next/navigation";

import { PortalShell, type PortalNavItem } from "@/components/shared/portal-shell";
import { ADMIN_ROLES, AGENCY_ROLES } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

const baseNavItems: PortalNavItem[] = [
  { label: "Dashboard", href: "/agency/dashboard", icon: <LayoutDashboard /> },
  { label: "Campaigns", href: "/agency/campaigns", icon: <Megaphone /> },
  { label: "Brands", href: "/agency/brands", icon: <Building2 /> },
  { label: "Influencers", href: "/agency/influencers", icon: <Users /> },
  { label: "Teams", href: "/agency/teams", icon: <UsersRound /> },
];

const adminNavItems: PortalNavItem[] = [
  { label: "Admin", href: "/agency/admin/users", icon: <ShieldCheck /> },
  { label: "Audit log", href: "/agency/audit-log", icon: <History /> },
];

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || !AGENCY_ROLES.includes(user.role)) redirect("/sign-in");

  const navItems = ADMIN_ROLES.includes(user.role)
    ? [...baseNavItems, ...adminNavItems]
    : baseNavItems;

  return (
    <PortalShell portalLabel="Agency Workspace" navItems={navItems} user={user}>
      {children}
    </PortalShell>
  );
}
