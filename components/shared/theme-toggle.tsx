"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Light/Dark/System picker for next-themes. The icon has to wait for mount
 * before reading `theme` — the server has no notion of the client's
 * localStorage/OS preference, so rendering it pre-mount would hydrate to
 * the wrong icon and mismatch.
 */
const noSubscription = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Hydration-safe mount check without a setState-in-effect: the server
  // snapshot is always false, the client snapshot always true, so React
  // itself reconciles the mismatch instead of us re-rendering post-mount.
  const mounted = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );

  const Icon = !mounted ? SunMoon : theme === "dark" ? Moon : theme === "light" ? Sun : SunMoon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <Icon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setTheme("light")}>
          <Sun className="size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("dark")}>
          <Moon className="size-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("system")}>
          <SunMoon className="size-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
