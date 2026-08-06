import { describe, expect, it } from "vitest";

import {
  isAdmin,
  portalForRole,
  roleCanAccessPortal,
} from "@/lib/auth/permissions";

describe("portalForRole", () => {
  it("routes every agency role to the agency portal", () => {
    expect(portalForRole("SUPER_ADMIN")).toBe("agency");
    expect(portalForRole("AGENCY_ADMIN")).toBe("agency");
    expect(portalForRole("AGENCY_MANAGER")).toBe("agency");
    expect(portalForRole("AGENCY_MEMBER")).toBe("agency");
  });

  it("routes client roles to the customer portal", () => {
    expect(portalForRole("CLIENT_ADMIN")).toBe("customer");
    expect(portalForRole("CLIENT_VIEWER")).toBe("customer");
  });

  it("routes influencers to the influencer portal", () => {
    expect(portalForRole("INFLUENCER")).toBe("influencer");
  });
});

describe("roleCanAccessPortal", () => {
  it("denies cross-portal access", () => {
    expect(roleCanAccessPortal("INFLUENCER", "agency")).toBe(false);
    expect(roleCanAccessPortal("CLIENT_VIEWER", "agency")).toBe(false);
    expect(roleCanAccessPortal("AGENCY_MEMBER", "customer")).toBe(false);
  });

  it("allows same-portal access", () => {
    expect(roleCanAccessPortal("AGENCY_MEMBER", "agency")).toBe(true);
    expect(roleCanAccessPortal("CLIENT_ADMIN", "customer")).toBe(true);
    expect(roleCanAccessPortal("INFLUENCER", "influencer")).toBe(true);
  });
});

describe("isAdmin", () => {
  it("is true only for super admin and agency admin", () => {
    expect(isAdmin("SUPER_ADMIN")).toBe(true);
    expect(isAdmin("AGENCY_ADMIN")).toBe(true);
    expect(isAdmin("AGENCY_MANAGER")).toBe(false);
    expect(isAdmin("CLIENT_ADMIN")).toBe(false);
  });
});
