"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

/**
 * Wrapped by a template.tsx in each portal — template.tsx remounts on every
 * navigation within that segment (unlike layout.tsx, which persists), so
 * this fires a fresh fade+lift on each page change. See
 * app/agency/template.tsx (and the customer/influencer equivalents).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // fromTo, not from — see the comment in components/shared/reveal.tsx
        // for why from() risks getting stuck at opacity:0 under Strict Mode.
        gsap.fromTo(
          scope.current,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
            clearProps: "opacity,transform",
          },
        );
      });
      return () => mm.revert();
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
