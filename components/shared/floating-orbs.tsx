"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

/**
 * Purely decorative — a couple of soft blurred circles drifting slowly
 * behind the auth panel's content. Respects prefers-reduced-motion (skips
 * the drift entirely, the orbs just sit still as a static gradient wash).
 */
export function FloatingOrbs() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const orbs = scope.current ? gsap.utils.toArray<HTMLElement>(".orb") : [];
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        orbs.forEach((orb, i) => {
          gsap.to(orb, {
            x: `random(-40, 40)`,
            y: `random(-30, 30)`,
            duration: 8 + i * 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="orb bg-primary/30 absolute top-[10%] left-[15%] size-64 rounded-full blur-3xl" />
      <div className="orb bg-primary/20 absolute top-[45%] right-[10%] size-72 rounded-full blur-3xl" />
      <div className="orb absolute bottom-[10%] left-[30%] size-56 rounded-full bg-white/10 blur-3xl" />
    </div>
  );
}
