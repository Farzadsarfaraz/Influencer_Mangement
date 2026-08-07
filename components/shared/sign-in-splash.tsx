"use client";

import { useEffect } from "react";

import { FloatingOrbs } from "@/components/shared/floating-orbs";
import { WelcomeHelloEffect } from "@/components/shared/welcome-hello-effect";

const HOLD_MS = 700;

/**
 * Full-screen intro shown for a beat right after a successful sign-in,
 * before handing off to the destination portal: the real Pacifico glyph
 * outline for "Welcome to Octagon" (first-time) or "Welcome back"
 * (returning) draws itself in, then holds and hands off to `onFinished`.
 *
 * Stays fully opaque the entire time it's mounted (no fade-out) — Next.js
 * keeps this overlay on screen until the destination route's content is
 * ready, then swaps the whole tree in one go. Fading the overlay to
 * transparent before that swap briefly exposed the sign-in page underneath,
 * which is what this avoids.
 *
 * Reuses FloatingOrbs (same drifting background as the sign-in panel) so
 * the splash and the panel read as one consistent scene.
 */
export function SignInSplash({
  isReturning,
  onFinished,
}: {
  isReturning: boolean;
  onFinished: () => void;
}) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const timer = setTimeout(onFinished, HOLD_MS);
      return () => clearTimeout(timer);
    }
  }, [onFinished]);

  return (
    <div
      className="bg-primary fixed inset-0 z-50 flex flex-col items-center justify-center gap-7"
      role="status"
      aria-label="Signing in"
    >
      <FloatingOrbs />

      <WelcomeHelloEffect
        variant={isReturning ? "back" : "new"}
        className="text-primary-foreground relative w-[min(90vw,32rem)]"
        onAnimationComplete={() => {
          setTimeout(onFinished, HOLD_MS);
        }}
      />
    </div>
  );
}
