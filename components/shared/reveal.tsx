"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Fades + lifts its children in on mount, staggering direct children by
 * `stagger` seconds. Used for card grids and lists where a small entrance
 * animation reads as "polished" without being distracting — one thing to
 * disable is prefers-reduced-motion, so this respects that via GSAP's
 * built-in matchMedia rather than a manual media-query check.
 */
export function Reveal({
  children,
  className,
  stagger = 0.06,
  y = 12,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const targets = scope.current ? Array.from(scope.current.children) : [];
      if (targets.length === 0) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // fromTo (not from) — from() infers its end state by reading the
        // element's current style when the tween is created, which under
        // React Strict Mode's mount->cleanup->mount dev cycle can read back
        // the opacity:0 the first (aborted) run just set, animating 0->0
        // and leaving the content permanently invisible. fromTo pins both
        // ends explicitly so remounting can't corrupt the target state.
        gsap.fromTo(
          targets,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger,
            clearProps: "opacity,transform",
          },
        );
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className={cn(className)}>
      {children}
    </div>
  );
}
