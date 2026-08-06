// @vitest-environment node
//
// This suite exercises lib/data/* directly, which is marked "server-only" —
// see vitest.config.mts for why that resolves cleanly here (it needs an
// alias; the package throws unconditionally without it, regardless of
// environment). Node rather than the project's default jsdom just because
// this is a pure data-layer test with no DOM involved.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { getBrandsForUser } from "@/lib/data/brands";
import { getCampaignForBrands } from "@/lib/data/campaigns";
import { getApprovedFilesForBrands } from "@/lib/data/content";

// Stubs only the auth *boundary* (there's no HTTP request/cookies in a test
// run) — getCurrentUser()'s real DB status/tokenVersion check, and the
// action's real ownership check, both still run against the real database.
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
const { auth } = await import("@/lib/auth");
const { respondToInvitationAction } = await import("@/lib/actions/assignments");

function mockSessionFor(user: { id: string; tokenVersion: number }) {
  vi.mocked(auth).mockResolvedValue({
    user: { id: user.id, tokenVersion: user.tokenVersion },
  } as never);
}

/**
 * These need a reachable Postgres to mean anything — they exercise the
 * real data-access layer, not mocks, because the thing being verified is
 * "does the SQL `where` clause actually exclude the other tenant's rows,"
 * which a mock can't tell you. Skipped (not failed) when DATABASE_URL is
 * unset or unreachable, e.g. this sandbox's network only allows outbound
 * HTTPS, not raw Postgres — see docs/ARCHITECTURE.md's testing note. Run
 * with a real DATABASE_URL (docker-compose or your dev DB) to execute.
 */
async function isDatabaseReachable(client: PrismaClient): Promise<boolean> {
  try {
    await Promise.race([
      client.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000)),
    ]);
    return true;
  } catch {
    return false;
  }
}

const databaseUrl = process.env.DATABASE_URL;
const db = databaseUrl
  ? new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })
  : null;
const reachable = db ? await isDatabaseReachable(db) : false;

describe.skipIf(!reachable)("RBAC scoping: customer portal brand isolation", () => {
  const suffix = `rbac-${Date.now()}`;
  let brandA: { id: string };
  let brandB: { id: string };
  let clientAUser: { id: string };
  let campaignB: { id: string };
  let agencyUser: { id: string };

  beforeAll(async () => {
    if (!db) return;

    agencyUser = await db.user.create({
      data: {
        name: "Test Agency Owner",
        email: `agency-${suffix}@test.local`,
        role: "AGENCY_MANAGER",
        status: "ACTIVE",
      },
    });

    clientAUser = await db.user.create({
      data: {
        name: "Test Client A",
        email: `client-a-${suffix}@test.local`,
        role: "CLIENT_VIEWER",
        status: "ACTIVE",
      },
    });

    brandA = await db.brand.create({
      data: {
        name: `Brand A ${suffix}`,
        slug: `brand-a-${suffix}`,
        members: { create: { userId: clientAUser.id, role: "VIEWER" } },
      },
    });

    brandB = await db.brand.create({
      data: { name: `Brand B ${suffix}`, slug: `brand-b-${suffix}` },
    });

    campaignB = await db.campaign.create({
      data: {
        brandId: brandB.id,
        ownerId: agencyUser.id,
        createdById: agencyUser.id,
        name: `Brand B Campaign ${suffix}`,
        slug: `brand-b-campaign-${suffix}`,
        status: "ACTIVE",
      },
    });
  });

  afterAll(async () => {
    if (!db) return;
    await db.campaign.deleteMany({ where: { brandId: { in: [brandA.id, brandB.id] } } });
    await db.brandMember.deleteMany({ where: { brandId: { in: [brandA.id, brandB.id] } } });
    await db.brand.deleteMany({ where: { id: { in: [brandA.id, brandB.id] } } });
    await db.user.deleteMany({ where: { id: { in: [agencyUser.id, clientAUser.id] } } });
    await db.$disconnect();
  });

  it("only returns brands the user is a member of", async () => {
    const brands = await getBrandsForUser(clientAUser.id);
    expect(brands.map((b) => b.id)).toEqual([brandA.id]);
    expect(brands.map((b) => b.id)).not.toContain(brandB.id);
  });

  it("returns null for a campaign belonging to a brand the user can't access — even with a valid campaign ID", async () => {
    const brands = await getBrandsForUser(clientAUser.id);
    const brandIds = brands.map((b) => b.id);

    // Client A explicitly requests Brand B's campaign by ID (e.g. guessed
    // or leaked from another tab). The scoping must reject it, not just
    // hide the link in the UI.
    const result = await getCampaignForBrands(campaignB.id, brandIds);
    expect(result).toBeNull();
  });

  it("excludes another brand's files from the approved-files list", async () => {
    const brands = await getBrandsForUser(clientAUser.id);
    const entries = await getApprovedFilesForBrands(brands.map((b) => b.id));
    const campaignIds = entries.map((e) => e.submission.deliverable.assignment.campaign.id);
    expect(campaignIds).not.toContain(campaignB.id);
  });
});

describe.skipIf(!reachable)("RBAC scoping: influencer assignment ownership", () => {
  const suffix = `rbac-inf-${Date.now()}`;
  let agencyUser: { id: string };
  let ownerUser: { id: string };
  let otherUser: { id: string };
  let influencer: { id: string };
  let brand: { id: string };
  let campaign: { id: string };
  let assignment: { id: string };

  beforeAll(async () => {
    if (!db) return;

    agencyUser = await db.user.create({
      data: {
        name: "Test Agency",
        email: `agency-inf-${suffix}@test.local`,
        role: "AGENCY_MANAGER",
        status: "ACTIVE",
      },
    });
    ownerUser = await db.user.create({
      data: {
        name: "Assignment Owner",
        email: `owner-${suffix}@test.local`,
        role: "INFLUENCER",
        status: "ACTIVE",
      },
    });
    otherUser = await db.user.create({
      data: {
        name: "Different Influencer",
        email: `other-${suffix}@test.local`,
        role: "INFLUENCER",
        status: "ACTIVE",
      },
    });

    influencer = await db.influencer.create({
      data: {
        userId: ownerUser.id,
        createdById: agencyUser.id,
        displayName: "Owner Influencer",
        status: "ACTIVE",
      },
    });

    brand = await db.brand.create({
      data: { name: `Brand ${suffix}`, slug: `brand-${suffix}` },
    });
    campaign = await db.campaign.create({
      data: {
        brandId: brand.id,
        ownerId: agencyUser.id,
        createdById: agencyUser.id,
        name: `Campaign ${suffix}`,
        slug: `campaign-${suffix}`,
        status: "ACTIVE",
      },
    });
    assignment = await db.assignment.create({
      data: {
        campaignId: campaign.id,
        influencerId: influencer.id,
        createdById: agencyUser.id,
        status: "INVITED",
      },
    });
  });

  afterAll(async () => {
    if (!db) return;
    await db.assignment.deleteMany({ where: { id: assignment.id } });
    await db.campaign.deleteMany({ where: { id: campaign.id } });
    await db.brand.deleteMany({ where: { id: brand.id } });
    await db.influencer.deleteMany({ where: { id: influencer.id } });
    await db.user.deleteMany({
      where: { id: { in: [agencyUser.id, ownerUser.id, otherUser.id] } },
    });
    await db.$disconnect();
  });

  it("rejects an invitation response from a user who doesn't own the assignment", async () => {
    mockSessionFor({ id: otherUser.id, tokenVersion: 0 });

    const result = await respondToInvitationAction(assignment.id, "ACCEPTED");

    expect(result.ok).toBe(false);
    const unchanged = await db!.assignment.findUniqueOrThrow({
      where: { id: assignment.id },
    });
    expect(unchanged.status).toBe("INVITED");
  });

  it("accepts an invitation response from the influencer who actually owns it", async () => {
    mockSessionFor({ id: ownerUser.id, tokenVersion: 0 });

    const result = await respondToInvitationAction(assignment.id, "ACCEPTED");

    expect(result.ok).toBe(true);
    const updated = await db!.assignment.findUniqueOrThrow({
      where: { id: assignment.id },
    });
    expect(updated.status).toBe("ACCEPTED");
  });
});
