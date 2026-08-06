"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

// Same corner-cut construction as the wordmark's octagon (see
// components/shared/morphing-wordmark.tsx), expressed as a CSS clip-path
// percentage polygon instead of SVG points, so the brand shape shows up
// here too instead of a generic blob.
const OCTAGON_CLIP =
  "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";

// Fixed pixel offsets, not percentages — admin pages vary wildly in height
// (a short settings form vs. a long user table), and the table/card content
// below is deliberately opaque for readability, so anything positioned as a
// % of the full (often very tall) container mostly ends up hidden behind
// it. Anchoring to a fixed band at the top keeps every shape inside the one
// area that's reliably visible above the content on every admin page.
const SHAPES = [
  { size: 260, top: -70, left: "58%", z: -80, rx: 16, ry: 0, duration: 42 },
  { size: 170, top: -20, left: "82%", z: -30, rx: -14, ry: 18, duration: 34 },
  { size: 200, top: -50, left: "4%", z: -110, rx: 12, ry: -16, duration: 48 },
  { size: 120, top: 40, left: "24%", z: -20, rx: -18, ry: 12, duration: 28 },
];

const BAND_HEIGHT = 220;

/**
 * Ambient depth behind the admin panel's header band (tab nav + page
 * heading) — real CSS 3D (perspective + preserve-3d + rotateX/Y), not a
 * flat blurred blob. Confined to a fixed-height strip at the top rather
 * than the whole (often much taller, opaque-table-covered) admin section —
 * see SHAPES' comment. Respects prefers-reduced-motion: shapes still
 * render (the depth/parallax look is static and fine to keep), just
 * without the continuous rotation.
 */
export function AdminBackground() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const shapes = scope.current
        ? gsap.utils.toArray<HTMLElement>(".admin-bg-shape")
        : [];
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        shapes.forEach((shape, i) => {
          const duration = Number(shape.dataset.duration) || 40;
          gsap.to(shape, {
            rotateY: "+=360",
            duration,
            repeat: -1,
            ease: "none",
          });
          gsap.to(shape, {
            y: i % 2 === 0 ? 14 : -14,
            duration: 6 + i,
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
    <div
      ref={scope}
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden perspective-[1400px]"
      style={{ height: BAND_HEIGHT }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: BAND_HEIGHT,
          background:
            "radial-gradient(ellipse 80% 100% at 60% 0%, color-mix(in oklch, var(--primary), transparent 90%), transparent 70%)",
        }}
      />
      {SHAPES.map((shape, i) => (
        <div
          key={i}
          className="admin-bg-shape absolute opacity-[0.16] blur-[1px] dark:opacity-[0.22]"
          data-duration={shape.duration}
          style={{
            width: shape.size,
            height: shape.size,
            top: shape.top,
            left: shape.left,
            transform: `translateZ(${shape.z}px) rotateX(${shape.rx}deg) rotateY(${shape.ry}deg)`,
            transformStyle: "preserve-3d",
            clipPath: OCTAGON_CLIP,
            background:
              "linear-gradient(135deg, var(--primary) 0%, color-mix(in oklch, var(--primary), transparent 60%) 100%)",
          }}
        />
      ))}
    </div>
  );
}
