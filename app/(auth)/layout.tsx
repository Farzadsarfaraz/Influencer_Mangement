import { CheckCircle2 } from "lucide-react";

import { MorphingWordmark } from "@/components/shared/morphing-wordmark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { WovenBackground } from "@/components/shared/woven-background";

const HIGHLIGHTS = [
  "Brief to payout in one workspace",
  "Two-stage approvals, client-side sign-off included",
  "Live KPI dashboards for every campaign",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <div className="fixed top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="bg-primary text-primary-foreground relative hidden overflow-hidden md:flex md:flex-col md:justify-between md:p-8 lg:p-12">
        <WovenBackground />
        <MorphingWordmark />

        <div className="relative z-10 max-w-md space-y-8">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance">
            Run influencer campaigns end to end.
          </h1>
          <ul className="space-y-3 text-sm">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 opacity-80" />
                <span className="text-primary-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-primary-foreground/60 relative z-10 text-xs">
          One workspace for agencies, brands, and creators.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="flex w-full max-w-sm flex-col items-center gap-8">
          <div className="flex items-center gap-2.5 md:hidden">
            <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl text-base font-semibold">
              O
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Octagon
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
