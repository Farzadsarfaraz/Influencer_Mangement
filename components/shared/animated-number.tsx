"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

/**
 * Counts up from 0 to `value` on mount. Non-numeric string values (e.g.
 * already-formatted "$25,000" or "—") pass through unanimated — this only
 * tweens plain numbers, since animating a formatted string's digits
 * one-by-one is a different, much fussier problem than this needs.
 */
export function AnimatedNumber({
  value,
  formatter,
}: {
  value: number | string;
  formatter?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isNumeric = typeof value === "number";

  useGSAP(
    () => {
      if (!isNumeric || !ref.current) return;
      const target = { n: 0 };
      gsap.to(target, {
        n: value,
        duration: 1,
        ease: "power2.out",
        onUpdate: () => {
          if (!ref.current) return;
          const rounded = Math.round(target.n);
          ref.current.textContent = formatter ? formatter(rounded) : rounded.toLocaleString();
        },
      });
    },
    { dependencies: [value], scope: ref },
  );

  if (!isNumeric) return <>{value}</>;

  return <span ref={ref}>0</span>;
}
