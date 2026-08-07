"use client";

import type { TargetAndTransition } from "motion/react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import {
  WELCOME_BACK_PATH,
  WELCOME_BACK_VIEWBOX,
  WELCOME_TO_OCTAGON_PATH,
  WELCOME_TO_OCTAGON_VIEWBOX,
} from "@/components/shared/welcome-effect-paths";

const strokeInitial: TargetAndTransition = { pathLength: 0, opacity: 1 };
const strokeAnimate: TargetAndTransition = { pathLength: 1, opacity: 1 };

const CONTENT = {
  new: {
    d: WELCOME_TO_OCTAGON_PATH,
    viewBox: WELCOME_TO_OCTAGON_VIEWBOX,
    label: "Welcome to Octagon",
    drawDuration: 2.6,
  },
  back: {
    d: WELCOME_BACK_PATH,
    viewBox: WELCOME_BACK_VIEWBOX,
    label: "Welcome back",
    drawDuration: 2,
  },
} as const;

type Props = {
  variant: keyof typeof CONTENT;
  className?: string;
  onAnimationComplete?: () => void;
};

// Traces the real Pacifico glyph outline as a thin stroke (pathLength 0 -> 1,
// see components/shared/welcome-effect-paths.ts for provenance), then fades
// in the filled glyph on top for the final "written then inked" look.
export function WelcomeHelloEffect({
  variant,
  className,
  onAnimationComplete,
}: Props) {
  const { d, viewBox, label, drawDuration } = CONTENT[variant];
  const fillDelay = drawDuration * 0.55;

  return (
    <svg
      className={cn("text-foreground h-24 w-auto", className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="none"
    >
      <title>{label}</title>
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={strokeInitial}
        animate={strokeAnimate}
        transition={{ duration: drawDuration, ease: "easeInOut" }}
      />
      <motion.path
        d={d}
        fill="currentColor"
        stroke="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: drawDuration * 0.5,
          delay: fillDelay,
          ease: "easeOut",
        }}
        onAnimationComplete={onAnimationComplete}
      />
    </svg>
  );
}
