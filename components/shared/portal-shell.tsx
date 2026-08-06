import { NotificationBell } from "@/components/shared/notification-bell";
import { PortalNav } from "@/components/shared/portal-nav";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { CurrentUser } from "@/lib/auth/session";

export type PortalNavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

export function PortalShell({
  portalLabel,
  navItems,
  user,
  children,
}: {
  portalLabel: string;
  navItems: PortalNavItem[];
  user: CurrentUser;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex h-11 items-center gap-2 px-2">
            <span className="shadow-glow bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-sm font-semibold">
              O
            </span>
            <div className="text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <div className="font-semibold">Octagon</div>
              <div className="text-muted-foreground">{portalLabel}</div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:mt-0">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <PortalNav navItems={navItems} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm font-medium">{portalLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
            <UserMenu name={user.name} email={user.email} image={user.image} />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
