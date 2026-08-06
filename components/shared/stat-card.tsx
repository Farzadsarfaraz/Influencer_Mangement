import type { LucideIcon } from "lucide-react";

import { AnimatedNumber } from "@/components/shared/animated-number";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
}) {
  return (
    <Card className="shadow-soft hover:border-primary/30 group gap-3 py-5 transition-all duration-300 hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <span className="bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground flex size-8 items-center justify-center rounded-lg transition-colors duration-300">
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">
          <AnimatedNumber value={value} />
        </div>
      </CardContent>
    </Card>
  );
}
