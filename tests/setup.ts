import "@testing-library/jest-dom/vitest";

import { vi } from "vitest";

// next/server's after() needs the request-scoped AsyncLocalStorage context
// that only exists while Next is actually handling a request — calling a
// Server Action directly in a test throws "after was called outside a
// request scope". Deferred-after-response has no meaning in a test anyway,
// so just run the callback immediately; everything else from the module
// stays real.
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    after: (callback: () => void | Promise<void>) => {
      void callback();
    },
  };
});

// Same story as after() above — revalidatePath/revalidateTag need the
// request-scoped static-generation store Next sets up per request. There's
// no cache to invalidate in a test, so no-op them.
vi.mock("next/cache", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/cache")>();
  return {
    ...actual,
    revalidatePath: () => {},
    revalidateTag: () => {},
  };
});
