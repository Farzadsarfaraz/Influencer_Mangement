"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useRef } from "react";

gsap.registerPlugin(MorphSVGPlugin);

/**
 * A circle morphs into an octagon badge (a real MorphSVGPlugin shape morph),
 * then the "OCTAGON" wordmark fades/slides in beside it as plain SVG <text>.
 *
 * MorphSVGPlugin.convertToPath() only converts rect/circle/ellipse/line/
 * polyline/polygon into a path — it has no glyph-outline extraction, so it
 * can't turn <text> into a morph target (confirmed by reading
 * gsap/utils/paths.js: the "text" tag name hits no branch and yields an
 * empty path). So the word is never morphed — it's revealed with an
 * ordinary opacity/x tween, which needs nothing more than a real font.
 *
 * The octagon's 8 points are computed by cutting the corners off a square
 * by a fixed amount — an exact, checkable construction, unlike freehand
 * letter curves.
 */
export function octagonPoints(x: number, y: number, size: number, cut: number) {
  const x1 = x + size;
  const y1 = y + size;
  return [
    [x + cut, y],
    [x1 - cut, y],
    [x1, y + cut],
    [x1, y1 - cut],
    [x1 - cut, y1],
    [x + cut, y1],
    [x, y1 - cut],
    [x, y + cut],
  ]
    .map(([px, py]) => `${px},${py}`)
    .join(" ");
}

export function MorphingWordmark() {
  const scope = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      gsap.set("#wm-target-octagon", { opacity: 0 });
      gsap.set("#wm-word", { opacity: 0, x: -12 });

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          animate: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const conditions = context.conditions as { reduce: boolean };

          MorphSVGPlugin.convertToPath("#wm-shape, #wm-target-octagon");

          if (conditions.reduce) {
            gsap.set("#wm-shape", { morphSVG: "#wm-target-octagon" });
            gsap.set("#wm-word", { opacity: 1, x: 0 });
            return;
          }

          gsap
            .timeline({
              delay: 0.2,
              defaults: { duration: 0.8, ease: "power3.inOut" },
            })
            .to("#wm-shape", { morphSVG: "#wm-target-octagon" })
            .to(
              "#wm-word",
              { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
              "-=0.2",
            );
        },
      );

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <svg
      ref={scope}
      viewBox="0 0 320 90"
      className="w-full max-w-70"
      role="img"
      aria-label="Octagon"
    >
      <defs>
        <linearGradient
          id="wm-grad"
          x1="0"
          y1="0"
          x2="320"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#c7d2fe" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>

      <circle id="wm-shape" cx="45" cy="45" r="36" fill="url(#wm-grad)" />

      {/* Hidden morph target — never rendered directly, only referenced. */}
      <polygon
        id="wm-target-octagon"
        points={octagonPoints(9, 9, 72, 21)}
        fill="url(#wm-grad)"
        opacity="0"
      />

      <text
        id="wm-word"
        x="100"
        y="58"
        fontSize="34"
        fontWeight="700"
        letterSpacing="0.5"
        fontFamily="var(--font-sans), ui-sans-serif, sans-serif"
        fill="url(#wm-grad)"
      >
        OCTAGON
      </text>
    </svg>
  );
}
