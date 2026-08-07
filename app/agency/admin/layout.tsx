import Link from "next/link";
import { redirect } from "next/navigation";

import { OctagonBackground } from "@/components/agency/octagon-background";
import { ADMIN_ROLES } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

const ADMIN_NAV = [
  { label: "Users", href: "/agency/admin/users" },
  { label: "Roles", href: "/agency/admin/roles" },
  { label: "Feature flags", href: "/agency/admin/feature-flags" },
  { label: "Settings", href: "/agency/admin/settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) redirect("/agency/dashboard");

  return (
    <div className="relative isolate min-h-[calc(100vh-8rem)] space-y-6">
      <OctagonBackground />
      <div className="flex gap-4 border-b pb-2 text-sm">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-muted-foreground hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
