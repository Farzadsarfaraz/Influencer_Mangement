import { CheckCircle2, FolderOpen, LayoutDashboard, Megaphone } from "lucide-react";
import { redirect } from "next/navigation";

import { PortalShell, type PortalNavItem } from "@/components/shared/portal-shell";
import { CLIENT_ROLES } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

const navItems: PortalNavItem[] = [
  { label: "Dashboard", href: "/customer/dashboard", icon: <LayoutDashboard /> },
  { label: "Campaigns", href: "/customer/campaigns", icon: <Megaphone /> },
  { label: "Approvals", href: "/customer/approvals", icon: <CheckCircle2 /> },
  { label: "Files", href: "/customer/files", icon: <FolderOpen /> },
];

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || !CLIENT_ROLES.includes(user.role)) redirect("/sign-in");

  return (
    <PortalShell portalLabel="Customer Portal" navItems={navItems} user={user}>
      {children}
    </PortalShell>
  );
}
