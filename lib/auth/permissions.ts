import type { Role } from "@prisma/client";

export const AGENCY_ROLES: Role[] = [
  "SUPER_ADMIN",
  "AGENCY_ADMIN",
  "AGENCY_MANAGER",
  "AGENCY_MEMBER",
];

export const CLIENT_ROLES: Role[] = ["CLIENT_ADMIN", "CLIENT_VIEWER"];

export const INFLUENCER_ROLES: Role[] = ["INFLUENCER"];

export type Portal = "agency" | "customer" | "influencer";

export function portalForRole(role: Role): Portal {
  if (AGENCY_ROLES.includes(role)) return "agency";
  if (CLIENT_ROLES.includes(role)) return "customer";
  return "influencer";
}

export function roleCanAccessPortal(role: Role, portal: Portal): boolean {
  return portalForRole(role) === portal;
}

/**
 * Roles that may administer users, teams, brands, and platform settings.
 * Distinct from portal access — an AGENCY_MEMBER is in the agency portal
 * but is not an admin.
 */
export const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "AGENCY_ADMIN"];

export function isAdmin(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}

/** Roles allowed to create/manage campaigns, assignments, and approvals. */
export const CAMPAIGN_MANAGER_ROLES: Role[] = [
  "SUPER_ADMIN",
  "AGENCY_ADMIN",
  "AGENCY_MANAGER",
];
