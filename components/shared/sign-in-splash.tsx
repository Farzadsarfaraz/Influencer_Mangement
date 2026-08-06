"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";

import { FloatingOrbs } from "@/components/shared/floating-orbs";
import { octagonPoints } from "@/components/shared/morphing-wordmark";

gsap.registerPlugin(MorphSVGPlugin, SplitText);

/**
 * Full-screen intro shown for a beat right after a successful sign-in,
 * before handing off to the destination portal:
 *
 *   glow pulses in -> badge pops in (back-ease) -> circle morphs to the
 *   octagon mark -> "OCTAGON" reveals letter by letter -> hold -> the
 *   whole screen fades/scales out and `onFinished` fires so the caller
 *   can navigate.
 *
 * Reuses FloatingOrbs (same drifting background as the sign-in panel) and
 * the exact octagon geometry from the corner wordmark, so the splash, the
 * panel logo, and the ambient background all read as one consistent mark.
 */
export function SignInSplash({ onFinished }: { onFinished: () => void }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const split = new SplitText("#splash-word", { type: "chars" });

      gsap.set("#splash-target-octagon", { opacity: 0 });
      gsap.set("#splash-badge-wrap", { opacity: 0, scale: 0.5, rotate: -18 });
      gsap.set("#splash-glow", { opacity: 0, scale: 0.7 });
      gsap.set(split.chars, { opacity: 0, y: 26, scale: 0.6, rotate: -6 });

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          animate: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const conditions = context.conditions as { reduce: boolean };

          MorphSVGPlugin.convertToPath("#splash-shape, #splash-target-octagon");

          if (conditions.reduce) {
            gsap.set("#splash-badge-wrap", { opacity: 1, scale: 1, rotate: 0 });
            gsap.set("#splash-glow", { opacity: 0.4, scale: 1 });
            gsap.set("#splash-shape", { morphSVG: "#splash-target-octagon" });
            gsap.set(split.chars, { opacity: 1, y: 0, scale: 1, rotate: 0 });
            gsap.delayedCall(0.5, onFinished);
            return () => split.revert();
          }

          const tl = gsap.timeline({
            defaults: { ease: "power3.inOut" },
            onComplete: onFinished,
          });

          tl.to("#splash-glow", {
            opacity: 0.5,
            scale: 1.15,
            duration: 0.6,
            ease: "power2.out",
          })
            .to(
              "#splash-badge-wrap",
              {
                opacity: 1,
                scale: 1,
                rotate: 0,
                duration: 0.65,
                ease: "back.out(1.8)",
              },
              "<0.1",
            )
            .to(
              "#splash-shape",
              { morphSVG: "#splash-target-octagon", duration: 0.55 },
              "-=0.25",
            )
            .to(
              split.chars,
              {
                opacity: 1,
                y: 0,
                scale: 1,
                rotate: 0,
                duration: 0.5,
                stagger: 0.035,
                ease: "back.out(2.4)",
              },
              "-=0.2",
            )
            .to(
              "#splash-glow",
              { opacity: 0.2, scale: 1.4, duration: 1.1, ease: "sine.out" },
              "<",
            )
            .to(
              scope.current,
              { opacity: 0, scale: 1.04, duration: 0.5, ease: "power2.in" },
              "+=0.6",
            );

          return () => split.revert();
        },
      );

      return () => mm.revert();
    },
    { scope, dependencies: [onFinished] },
  );

  return (
    <div
      ref={scope}
      className="bg-primary fixed inset-0 z-50 flex flex-col items-center justify-center gap-7"
      role="status"
      aria-label="Signing in"
    >
      <FloatingOrbs />

      <div className="relative flex items-center justify-center">
        <div
          id="splash-glow"
          className="bg-primary-foreground/40 absolute size-40 rounded-full blur-3xl"
        />
        <div id="splash-badge-wrap" className="relative">
          <svg viewBox="0 0 90 90" className="w-20 sm:w-24">
            <defs>
              <linearGradient
                id="splash-grad"
                x1="0"
                y1="0"
                x2="90"
                y2="90"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#c7d2fe" />
                <stop offset="1" stopColor="#ffffff" />
              </linearGradient>
            </defs>
            <circle
              id="splash-shape"
              cx="45"
              cy="45"
              r="36"
              fill="url(#splash-grad)"
            />
            <polygon
              id="splash-target-octagon"
              points={octagonPoints(9, 9, 72, 21)}
              fill="url(#splash-grad)"
              opacity="0"
            />
          </svg>
        </div>
      </div>

      <span
        id="splash-word"
        className="text-primary-foreground relative text-4xl font-semibold tracking-tight sm:text-5xl"
      >
        OCTAGON
      </span>
    </div>
  );
}
