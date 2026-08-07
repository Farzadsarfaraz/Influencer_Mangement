"use client";

import dynamic from "next/dynamic";

// Three.js is a substantial chunk (~1.5MB unminified) that has zero value
// before hydration — it's a decorative background behind a solid bg-primary
// panel, so skipping SSR and fetching it only after the page is interactive
// keeps it off the sign-in page's critical path entirely. `ssr: false`
// requires the dynamic() call to live in a client component, hence this
// thin wrapper around the real (server-agnostic) WovenBackground.
const WovenBackgroundInner = dynamic(
  () =>
    import("@/components/shared/woven-background").then(
      (mod) => mod.WovenBackground,
    ),
  { ssr: false },
);

export function WovenBackgroundLazy() {
  return <WovenBackgroundInner />;
}
