import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
});

const SEED_PASSWORD = "password123";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const passwordHash = await argon2.hash(SEED_PASSWORD);

  // ── Agency staff ──────────────────────────────────────────────────────
  const [ava, marco, priya, noah] = await Promise.all([
    db.user.upsert({
      where: { email: "farzad@octagon.dev" },
      update: {},
      create: {
        name: "Ava Admin",
        email: "farzad@octagon.dev",
        passwordHash,
        role: "AGENCY_ADMIN",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    }),
    db.user.upsert({
      where: { email: "manager@octagon.dev" },
      update: {},
      create: {
        name: "Marco Manager",
        email: "manager@octagon.dev",
        passwordHash,
        role: "AGENCY_MANAGER",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    }),
    db.user.upsert({
      where: { email: "priya@octagon.dev" },
      update: {},
      create: {
        name: "Priya Patel",
        email: "priya@octagon.dev",
        passwordHash,
        role: "AGENCY_MANAGER",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    }),
    db.user.upsert({
      where: { email: "noah@octagon.dev" },
      update: {},
      create: {
        name: "Noah Kim",
        email: "noah@octagon.dev",
        passwordHash,
        role: "AGENCY_MEMBER",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    }),
  ]);

  await db.team.upsert({
    where: { id: "seed-team-partnerships" },
    update: {},
    create: {
      id: "seed-team-partnerships",
      name: "Brand Partnerships",
      members: {
        create: [
          { userId: marco.id, role: "LEAD" },
          { userId: noah.id, role: "MEMBER" },
        ],
      },
    },
  });

  await db.team.upsert({
    where: { id: "seed-team-client-services" },
    update: {},
    create: {
      id: "seed-team-client-services",
      name: "Client Services",
      members: {
        create: [
          { userId: priya.id, role: "LEAD" },
          { userId: ava.id, role: "MEMBER" },
        ],
      },
    },
  });

  // ── Client contacts ───────────────────────────────────────────────────
  const [cara, derek, naomi, owen, sasha] = await Promise.all([
    db.user.upsert({
      where: { email: "client@brightpeak.dev" },
      update: {},
      create: {
        name: "Cara Client",
        email: "client@brightpeak.dev",
        passwordHash,
        role: "CLIENT_ADMIN",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    }),
    db.user.upsert({
      where: { email: "derek@brightpeak.dev" },
      update: {},
      create: {
        name: "Derek Diaz",
        email: "derek@brightpeak.dev",
        passwordHash,
        role: "CLIENT_VIEWER",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    }),
    db.user.upsert({
      where: { email: "naomi@lumenbeauty.dev" },
      update: {},
      create: {
        name: "Naomi Lang",
        email: "naomi@lumenbeauty.dev",
        passwordHash,
        role: "CLIENT_ADMIN",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    }),
    db.user.upsert({
      where: { email: "owen@fizzsports.dev" },
      update: {},
      create: {
        name: "Owen Baxter",
        email: "owen@fizzsports.dev",
        passwordHash,
        role: "CLIENT_ADMIN",
        status: "INVITED",
      },
    }),
    db.user.upsert({
      where: { email: "sasha@novahome.dev" },
      update: {},
      create: {
        name: "Sasha Romero",
        email: "sasha@novahome.dev",
        passwordHash,
        role: "CLIENT_ADMIN",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    }),
  ]);

  // ── Brands ─────────────────────────────────────────────────────────────
  const brightpeak = await db.brand.upsert({
    where: { slug: "brightpeak" },
    update: {},
    create: {
      name: "BrightPeak Outdoor",
      slug: "brightpeak",
      industry: "Outdoor & Apparel",
      website: "https://brightpeak.example.com",
      status: "ACTIVE",
      primaryContactName: cara.name,
      primaryContactEmail: cara.email,
      members: {
        create: [
          { userId: cara.id, role: "ADMIN" },
          { userId: derek.id, role: "VIEWER" },
        ],
      },
    },
  });

  const lumen = await db.brand.upsert({
    where: { slug: "lumen-beauty" },
    update: {},
    create: {
      name: "Lumen Beauty Co.",
      slug: "lumen-beauty",
      industry: "Beauty & Cosmetics",
      website: "https://lumenbeauty.example.com",
      status: "ACTIVE",
      primaryContactName: naomi.name,
      primaryContactEmail: naomi.email,
      members: { create: [{ userId: naomi.id, role: "ADMIN" }] },
    },
  });

  const fizz = await db.brand.upsert({
    where: { slug: "fizz-sports" },
    update: {},
    create: {
      name: "Fizz Sports Nutrition",
      slug: "fizz-sports",
      industry: "Food & Beverage",
      status: "ACTIVE",
      primaryContactName: owen.name,
      primaryContactEmail: owen.email,
      members: { create: [{ userId: owen.id, role: "ADMIN" }] },
    },
  });

  const nova = await db.brand.upsert({
    where: { slug: "nova-home" },
    update: {},
    create: {
      name: "Nova Home Tech",
      slug: "nova-home",
      industry: "Consumer Electronics",
      status: "INACTIVE",
      primaryContactName: sasha.name,
      primaryContactEmail: sasha.email,
      members: { create: [{ userId: sasha.id, role: "ADMIN" }] },
    },
  });

  // ── Tags ───────────────────────────────────────────────────────────────
  const tagNames = ["Sustainability", "Fitness", "Beauty", "Gaming", "Parenting", "Travel"];
  const tags = Object.fromEntries(
    await Promise.all(
      tagNames.map(async (name) => [
        name,
        await db.tag.upsert({ where: { name }, update: {}, create: { name } }),
      ]),
    ),
  );

  // ── Influencers ────────────────────────────────────────────────────────
  const [irisUser, zaraUser] = await Promise.all([
    db.user.upsert({
      where: { email: "influencer@octagon.dev" },
      update: {},
      create: {
        name: "Iris Influencer",
        email: "influencer@octagon.dev",
        passwordHash,
        role: "INFLUENCER",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    }),
    db.user.upsert({
      where: { email: "zara@octagon.dev" },
      update: {},
      create: {
        name: "Zara Osei",
        email: "zara@octagon.dev",
        passwordHash,
        role: "INFLUENCER",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    }),
  ]);

  const iris = await db.influencer.upsert({
    where: { userId: irisUser.id },
    update: {},
    create: {
      userId: irisUser.id,
      createdById: ava.id,
      displayName: "Iris Influencer",
      email: irisUser.email,
      location: "Denver, CO",
      bio: "Trail runner and gear reviewer sharing weekend adventures.",
      tier: "MICRO",
      status: "ACTIVE",
      tags: { connect: [{ id: tags.Sustainability.id }, { id: tags.Travel.id }] },
      socialAccounts: {
        create: [
          {
            platform: "INSTAGRAM",
            handle: "@iris.explores",
            followerCount: 42000,
            engagementRate: 3.8,
          },
        ],
      },
    },
  });

  const zara = await db.influencer.upsert({
    where: { userId: zaraUser.id },
    update: {},
    create: {
      userId: zaraUser.id,
      createdById: ava.id,
      displayName: "Zara Osei",
      email: zaraUser.email,
      location: "London, UK",
      bio: "Beauty and lifestyle creator with a focus on clean skincare.",
      tier: "MACRO",
      status: "ACTIVE",
      tags: { connect: [{ id: tags.Beauty.id }] },
      socialAccounts: {
        create: [
          {
            platform: "INSTAGRAM",
            handle: "@zara.osei",
            followerCount: 310000,
            engagementRate: 2.4,
          },
          {
            platform: "YOUTUBE",
            handle: "ZaraOsei",
            followerCount: 88000,
            engagementRate: 4.1,
          },
        ],
      },
    },
  });

  const otherInfluencerSpecs = [
    {
      key: "leo",
      displayName: "Leo Martins",
      email: "leo.martins@example.com",
      location: "Lisbon, Portugal",
      tier: "NANO" as const,
      status: "PROSPECT" as const,
      tags: ["Fitness"],
      socials: [{ platform: "TIKTOK" as const, handle: "@leo.moves", followerCount: 8200, engagementRate: 6.1 }],
    },
    {
      key: "kenji",
      displayName: "Kenji Watanabe",
      email: "kenji.w@example.com",
      location: "Osaka, Japan",
      tier: "MID" as const,
      status: "ACTIVE" as const,
      tags: ["Fitness", "Gaming"],
      socials: [{ platform: "YOUTUBE" as const, handle: "KenjiFit", followerCount: 156000, engagementRate: 3.2 }],
    },
    {
      key: "meera",
      displayName: "Meera Kapoor",
      email: "meera.kapoor@example.com",
      location: "Mumbai, India",
      tier: "MID" as const,
      status: "ACTIVE" as const,
      tags: ["Beauty", "Parenting"],
      socials: [{ platform: "INSTAGRAM" as const, handle: "@meera.k", followerCount: 121000, engagementRate: 3.6 }],
    },
    {
      key: "diego",
      displayName: "Diego Fernandez",
      email: "diego.f@example.com",
      location: "Mexico City, Mexico",
      tier: "MICRO" as const,
      status: "ACTIVE" as const,
      tags: ["Travel"],
      socials: [{ platform: "TIKTOK" as const, handle: "@diego.travels", followerCount: 61000, engagementRate: 5.4 }],
    },
    {
      key: "amara",
      displayName: "Amara Okafor",
      email: "amara.o@example.com",
      location: "Lagos, Nigeria",
      tier: "MACRO" as const,
      status: "DO_NOT_USE" as const,
      tags: ["Beauty"],
      socials: [{ platform: "INSTAGRAM" as const, handle: "@amara.okafor", followerCount: 275000, engagementRate: 1.9 }],
    },
    {
      key: "ben",
      displayName: "Ben Sullivan",
      email: "ben.sullivan@example.com",
      location: "Austin, TX",
      tier: "NANO" as const,
      status: "PROSPECT" as const,
      tags: ["Gaming"],
      socials: [{ platform: "TWITCH" as const, handle: "bensullivan", followerCount: 4300, engagementRate: 7.2 }],
    },
    {
      key: "ling",
      displayName: "Ling Zhao",
      email: "ling.zhao@example.com",
      location: "Singapore",
      tier: "MEGA" as const,
      status: "ACTIVE" as const,
      tags: ["Sustainability", "Travel"],
      socials: [
        { platform: "YOUTUBE" as const, handle: "LingZhaoTravels", followerCount: 1200000, engagementRate: 2.1 },
        { platform: "INSTAGRAM" as const, handle: "@ling.zhao", followerCount: 540000, engagementRate: 1.8 },
      ],
    },
  ];

  const influencers: Record<string, Awaited<ReturnType<typeof db.influencer.create>>> = {
    iris,
    zara,
  };

  for (const spec of otherInfluencerSpecs) {
    const existing = await db.influencer.findFirst({ where: { email: spec.email } });
    const influencer =
      existing ??
      (await db.influencer.create({
        data: {
          createdById: ava.id,
          displayName: spec.displayName,
          email: spec.email,
          location: spec.location,
          tier: spec.tier,
          status: spec.status,
          tags: { connect: spec.tags.map((name) => ({ id: tags[name].id })) },
          socialAccounts: { create: spec.socials },
        },
      }));
    influencers[spec.key] = influencer;
  }

  await db.influencerNote.createMany({
    data: [
      {
        influencerId: iris.id,
        authorId: marco.id,
        body: "Great to work with, always delivers a day early.",
      },
      {
        influencerId: influencers.amara.id,
        authorId: ava.id,
        body: "Missed two deadlines on the Q1 campaign without notice. Do not rebook.",
      },
    ],
    skipDuplicates: true,
  });

  // ── Campaigns ──────────────────────────────────────────────────────────
  async function upsertCampaign(spec: {
    slug: string;
    brandId: string;
    ownerId: string;
    name: string;
    objective: string;
    description?: string;
    status:
      | "DRAFT"
      | "PENDING_APPROVAL"
      | "ACTIVE"
      | "PAUSED"
      | "COMPLETED"
      | "CANCELLED"
      | "ARCHIVED";
    budget: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    return db.campaign.upsert({
      where: { slug: spec.slug },
      update: {},
      create: {
        brandId: spec.brandId,
        ownerId: spec.ownerId,
        createdById: spec.ownerId,
        name: spec.name,
        slug: spec.slug,
        objective: spec.objective,
        description: spec.description,
        status: spec.status,
        budget: spec.budget,
        startDate: spec.startDate,
        endDate: spec.endDate,
      },
    });
  }

  const summerLaunch = await upsertCampaign({
    slug: "brightpeak-summer-launch",
    brandId: brightpeak.id,
    ownerId: marco.id,
    name: "BrightPeak Summer Launch",
    objective: "Drive awareness for the new trail collection.",
    description:
      "Showcase the new trail running line across Instagram and TikTok ahead of peak hiking season.",
    status: "ACTIVE",
    budget: 25000,
    startDate: daysAgo(20),
    endDate: daysFromNow(25),
  });

  const holidayGear = await upsertCampaign({
    slug: "brightpeak-holiday-gear-guide",
    brandId: brightpeak.id,
    ownerId: priya.id,
    name: "BrightPeak Holiday Gear Guide",
    objective: "Gift-guide placements for the holiday shopping season.",
    status: "DRAFT",
    budget: 18000,
  });

  const glowUp = await upsertCampaign({
    slug: "lumen-glow-up-challenge",
    brandId: lumen.id,
    ownerId: priya.id,
    name: "Lumen Glow Up Challenge",
    objective: "30-day skincare challenge with before/after content.",
    description: "Creators document a 30-day routine using the new Lumen Glow serum line.",
    status: "ACTIVE",
    budget: 40000,
    startDate: daysAgo(15),
    endDate: daysFromNow(15),
  });

  const springCollection = await upsertCampaign({
    slug: "lumen-spring-collection",
    brandId: lumen.id,
    ownerId: marco.id,
    name: "Lumen Spring Collection",
    objective: "Launch the spring limited-edition palette.",
    status: "COMPLETED",
    budget: 22000,
    startDate: daysAgo(120),
    endDate: daysAgo(60),
  });

  const preWorkoutLaunch = await upsertCampaign({
    slug: "fizz-pre-workout-launch",
    brandId: fizz.id,
    ownerId: marco.id,
    name: "Fizz Pre-Workout Launch",
    objective: "Introduce the new pre-workout line to fitness creators.",
    status: "PENDING_APPROVAL",
    budget: 15000,
  });

  const ambassadorProgram = await upsertCampaign({
    slug: "fizz-ambassador-program-q3",
    brandId: fizz.id,
    ownerId: priya.id,
    name: "Fizz Ambassador Program Q3",
    objective: "Ongoing ambassador content through Q3.",
    status: "PAUSED",
    budget: 30000,
    startDate: daysAgo(45),
  });

  await upsertCampaign({
    slug: "nova-smart-home-bundle",
    brandId: nova.id,
    ownerId: marco.id,
    name: "Nova Smart Home Bundle",
    objective: "Promote the smart home starter bundle.",
    status: "CANCELLED",
    budget: 12000,
  });

  await upsertCampaign({
    slug: "nova-ces-teaser",
    brandId: nova.id,
    ownerId: marco.id,
    name: "Nova CES Teaser",
    objective: "Teaser content ahead of the CES announcement.",
    status: "ARCHIVED",
    budget: 9000,
    startDate: daysAgo(200),
    endDate: daysAgo(180),
  });

  // ── Flights ────────────────────────────────────────────────────────────
  async function upsertFlight(
    id: string,
    campaignId: string,
    name: string,
    startDate: Date,
    endDate: Date,
    budget: number,
    status: "PLANNED" | "ACTIVE" | "COMPLETED",
  ) {
    return db.campaignFlight.upsert({
      where: { id },
      update: {},
      create: { id, campaignId, name, startDate, endDate, budget, status },
    });
  }

  const teaserWave = await upsertFlight(
    "seed-flight-teaser",
    summerLaunch.id,
    "Teaser Wave",
    daysAgo(20),
    daysAgo(10),
    8000,
    "COMPLETED",
  );
  const launchWeek = await upsertFlight(
    "seed-flight-launch-week",
    summerLaunch.id,
    "Launch Week",
    daysAgo(9),
    daysFromNow(5),
    12000,
    "ACTIVE",
  );
  await upsertFlight(
    "seed-flight-glowup-phase1",
    glowUp.id,
    "Phase 1: Awareness",
    daysAgo(15),
    daysAgo(1),
    15000,
    "COMPLETED",
  );

  // ── Assignments ────────────────────────────────────────────────────────
  async function upsertAssignment(
    id: string,
    spec: {
      campaignId: string;
      flightId?: string;
      influencerId: string;
      createdById: string;
      fee: number;
      status:
        | "INVITED"
        | "ACCEPTED"
        | "DECLINED"
        | "IN_PROGRESS"
        | "SUBMITTED"
        | "IN_REVIEW"
        | "APPROVED"
        | "REVISION_REQUESTED"
        | "COMPLETED"
        | "CANCELLED";
      dueDate?: Date;
      respondedAt?: Date;
      notes?: string;
    },
  ) {
    return db.assignment.upsert({
      where: { id },
      update: {},
      create: { id, ...spec },
    });
  }

  const irisSummerAssignment = await upsertAssignment("seed-assign-iris-summer", {
    campaignId: summerLaunch.id,
    flightId: launchWeek.id,
    influencerId: iris.id,
    createdById: marco.id,
    fee: 1800,
    status: "IN_REVIEW",
    dueDate: daysFromNow(3),
    respondedAt: daysAgo(9),
  });

  const zaraGlowUpAssignment = await upsertAssignment("seed-assign-zara-glowup", {
    campaignId: glowUp.id,
    influencerId: zara.id,
    createdById: priya.id,
    fee: 6500,
    status: "APPROVED",
    dueDate: daysAgo(2),
  });

  const meeraGlowUpAssignment = await upsertAssignment("seed-assign-meera-glowup", {
    campaignId: glowUp.id,
    influencerId: influencers.meera.id,
    createdById: priya.id,
    fee: 3200,
    status: "REVISION_REQUESTED",
    dueDate: daysFromNow(1),
  });

  const kenjiFizzAssignment = await upsertAssignment("seed-assign-kenji-fizz", {
    campaignId: ambassadorProgram.id,
    influencerId: influencers.kenji.id,
    createdById: priya.id,
    fee: 4000,
    status: "ACCEPTED",
    dueDate: daysFromNow(10),
  });

  await upsertAssignment("seed-assign-leo-fizz", {
    campaignId: preWorkoutLaunch.id,
    influencerId: influencers.leo.id,
    createdById: marco.id,
    fee: 900,
    status: "INVITED",
    dueDate: daysFromNow(14),
  });

  await upsertAssignment("seed-assign-diego-summer", {
    campaignId: summerLaunch.id,
    flightId: teaserWave.id,
    influencerId: influencers.diego.id,
    createdById: marco.id,
    fee: 1500,
    status: "COMPLETED",
    dueDate: daysAgo(11),
  });

  await upsertAssignment("seed-assign-ling-spring", {
    campaignId: springCollection.id,
    influencerId: influencers.ling.id,
    createdById: marco.id,
    fee: 15000,
    status: "COMPLETED",
    dueDate: daysAgo(65),
  });

  await upsertAssignment("seed-assign-ben-declined", {
    campaignId: ambassadorProgram.id,
    influencerId: influencers.ben.id,
    createdById: priya.id,
    fee: 700,
    status: "DECLINED",
    dueDate: daysAgo(30),
  });

  // ── Deliverables, submissions, approvals, comments, files ─────────────

  async function upsertDeliverable(
    id: string,
    spec: {
      assignmentId: string;
      title: string;
      description?: string;
      platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE";
      contentType: "POST" | "REEL" | "STORY" | "VIDEO";
      dueDate: Date;
      status: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "PUBLISHED" | "REJECTED";
    },
  ) {
    return db.deliverable.upsert({ where: { id }, update: {}, create: { id, ...spec } });
  }

  // Iris / BrightPeak: awaiting client-side approval.
  const irisReel = await upsertDeliverable("seed-deliverable-iris-reel", {
    assignmentId: irisSummerAssignment.id,
    title: "Launch Day Trail Reel",
    description: "60s Reel featuring the new trail running shoes on a sunrise hike.",
    platform: "INSTAGRAM",
    contentType: "REEL",
    dueDate: daysFromNow(3),
    status: "SUBMITTED",
  });

  const irisSubmission = await db.contentSubmission.upsert({
    where: { deliverableId_version: { deliverableId: irisReel.id, version: 1 } },
    update: {},
    create: {
      deliverableId: irisReel.id,
      submittedById: irisUser.id,
      version: 1,
      caption: "Sunrise miles in the new BrightPeak trail line 🏔️ #ad",
      status: "IN_REVIEW",
    },
  });

  await db.fileAsset.createMany({
    data: [
      {
        entityType: "CONTENT_SUBMISSION",
        entityId: irisSubmission.id,
        uploadedById: irisUser.id,
        fileName: "launch-day-reel.mp4",
        mimeType: "video/mp4",
        sizeBytes: 24_500_000,
        storageKey: `seed/content-submissions/${irisSubmission.id}/launch-day-reel.mp4`,
        url: "https://picsum.photos/seed/brightpeak-reel/800/450",
      },
    ],
    skipDuplicates: true,
  });

  await db.approvalRequest.upsert({
    where: { id: "seed-approval-iris-internal" },
    update: {},
    create: {
      id: "seed-approval-iris-internal",
      contentSubmissionId: irisSubmission.id,
      stage: "INTERNAL",
      reviewerId: marco.id,
      decision: "APPROVED",
      comment: "Looks great, on-brand and hits the key messaging.",
      decidedAt: daysAgo(1),
    },
  });
  await db.approvalRequest.upsert({
    where: { id: "seed-approval-iris-client" },
    update: {},
    create: {
      id: "seed-approval-iris-client",
      contentSubmissionId: irisSubmission.id,
      stage: "CLIENT",
      decision: "PENDING",
    },
  });

  await db.comment.createMany({
    data: [
      {
        contentSubmissionId: irisSubmission.id,
        authorId: marco.id,
        body: "Approved on our end — over to BrightPeak for final sign-off.",
      },
      {
        contentSubmissionId: irisSubmission.id,
        authorId: irisUser.id,
        body: "Thank you! Let me know if you need a horizontal cut too.",
      },
    ],
    skipDuplicates: true,
  });

  // Zara / Lumen: fully approved, published.
  const zaraPost = await upsertDeliverable("seed-deliverable-zara-post", {
    assignmentId: zaraGlowUpAssignment.id,
    title: "Day 30 Glow Up Reveal",
    description: "Before/after carousel post for the final day of the challenge.",
    platform: "INSTAGRAM",
    contentType: "POST",
    dueDate: daysAgo(2),
    status: "APPROVED",
  });

  const zaraSubmission = await db.contentSubmission.upsert({
    where: { deliverableId_version: { deliverableId: zaraPost.id, version: 1 } },
    update: {},
    create: {
      deliverableId: zaraPost.id,
      submittedById: zaraUser.id,
      version: 1,
      caption: "30 days later ✨ my honest Lumen Glow results",
      status: "APPROVED",
    },
  });

  await db.fileAsset.createMany({
    data: [
      {
        entityType: "CONTENT_SUBMISSION",
        entityId: zaraSubmission.id,
        uploadedById: zaraUser.id,
        fileName: "day-30-reveal.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 3_200_000,
        storageKey: `seed/content-submissions/${zaraSubmission.id}/day-30-reveal.jpg`,
        url: "https://picsum.photos/seed/lumen-glowup/800/800",
      },
    ],
    skipDuplicates: true,
  });

  await Promise.all([
    db.approvalRequest.upsert({
      where: { id: "seed-approval-zara-internal" },
      update: {},
      create: {
        id: "seed-approval-zara-internal",
        contentSubmissionId: zaraSubmission.id,
        stage: "INTERNAL",
        reviewerId: priya.id,
        decision: "APPROVED",
        decidedAt: daysAgo(4),
      },
    }),
    db.approvalRequest.upsert({
      where: { id: "seed-approval-zara-client" },
      update: {},
      create: {
        id: "seed-approval-zara-client",
        contentSubmissionId: zaraSubmission.id,
        stage: "CLIENT",
        reviewerId: naomi.id,
        decision: "APPROVED",
        comment: "Beautiful results, approved for posting!",
        decidedAt: daysAgo(2),
      },
    }),
  ]);

  // Meera / Lumen: changes requested, influencer resubmitted a v2 (pending).
  const meeraStory = await upsertDeliverable("seed-deliverable-meera-story", {
    assignmentId: meeraGlowUpAssignment.id,
    title: "Week 2 Routine Story Series",
    description: "5-part Story series walking through the AM/PM routine.",
    platform: "INSTAGRAM",
    contentType: "STORY",
    dueDate: daysFromNow(1),
    status: "IN_PROGRESS",
  });

  const meeraV1 = await db.contentSubmission.upsert({
    where: { deliverableId_version: { deliverableId: meeraStory.id, version: 1 } },
    update: {},
    create: {
      deliverableId: meeraStory.id,
      submittedById: priya.id,
      version: 1,
      caption: "Week 2 routine, sharing my skin diary",
      status: "CHANGES_REQUESTED",
    },
  });
  await db.approvalRequest.upsert({
    where: { id: "seed-approval-meera-v1-internal" },
    update: {},
    create: {
      id: "seed-approval-meera-v1-internal",
      contentSubmissionId: meeraV1.id,
      stage: "INTERNAL",
      reviewerId: priya.id,
      decision: "CHANGES_REQUESTED",
      comment: "Please swap the product close-up for one that shows the new packaging.",
      decidedAt: daysAgo(1),
    },
  });
  await db.comment.create({
    data: {
      contentSubmissionId: meeraV1.id,
      authorId: priya.id,
      body: "Please swap the product close-up for one that shows the new packaging.",
    },
  });

  const meeraV2 = await db.contentSubmission.upsert({
    where: { deliverableId_version: { deliverableId: meeraStory.id, version: 2 } },
    update: {},
    create: {
      deliverableId: meeraStory.id,
      submittedById: priya.id,
      version: 2,
      caption: "Updated with the new packaging shot!",
      status: "SUBMITTED",
    },
  });
  await db.approvalRequest.upsert({
    where: { id: "seed-approval-meera-v2-internal" },
    update: {},
    create: {
      id: "seed-approval-meera-v2-internal",
      contentSubmissionId: meeraV2.id,
      stage: "INTERNAL",
      decision: "PENDING",
    },
  });

  // ── Payments ───────────────────────────────────────────────────────────
  await db.payment.createMany({
    data: [
      {
        assignmentId: irisSummerAssignment.id,
        amount: 1800,
        status: "SCHEDULED",
        method: "Wire",
        dueDate: daysFromNow(10),
      },
      {
        assignmentId: zaraGlowUpAssignment.id,
        amount: 6500,
        status: "PAID",
        method: "PayPal",
        dueDate: daysAgo(5),
        paidAt: daysAgo(3),
      },
      {
        assignmentId: kenjiFizzAssignment.id,
        amount: 2000,
        status: "PENDING",
        dueDate: daysFromNow(20),
      },
    ],
    skipDuplicates: true,
  });

  // ── KPI metric snapshots (last 14 days, two active campaigns) ─────────
  //
  // Postgres treats NULL as distinct from every other NULL, so these
  // campaign-total rows (influencerId/platform both null) can't be
  // deduped via the compound-unique `upsert` shorthand — same issue as
  // lib/actions/metrics.ts. Explicit find-then-write instead, so re-running
  // the seed updates today's numbers rather than piling up duplicates.
  for (const campaign of [summerLaunch, glowUp]) {
    let reachBase = randomInt(8000, 12000);
    for (let i = 13; i >= 0; i--) {
      reachBase += randomInt(200, 1500);
      const impressions = Math.round(reachBase * (1.4 + Math.random() * 0.3));
      const engagements = Math.round(impressions * (0.03 + Math.random() * 0.02));
      const views = Math.round(impressions * (0.5 + Math.random() * 0.2));
      const clicks = Math.round(engagements * (0.1 + Math.random() * 0.1));
      const date = daysAgo(i);

      const existing = await db.campaignMetricSnapshot.findFirst({
        where: { campaignId: campaign.id, influencerId: null, platform: null, date },
        select: { id: true },
      });
      if (existing) continue;

      await db.campaignMetricSnapshot.create({
        data: {
          campaignId: campaign.id,
          date,
          reach: reachBase,
          impressions,
          engagements,
          views,
          clicks,
          source: "IMPORT",
        },
      });
    }
  }

  // Per-influencer snapshots for the performance breakdown table.
  await db.campaignMetricSnapshot.createMany({
    data: [
      {
        campaignId: summerLaunch.id,
        influencerId: iris.id,
        date: daysAgo(1),
        reach: 18400,
        impressions: 26200,
        engagements: 1350,
        views: 15800,
        clicks: 210,
        source: "MANUAL",
      },
      {
        campaignId: glowUp.id,
        influencerId: zara.id,
        date: daysAgo(1),
        reach: 92000,
        impressions: 134000,
        engagements: 4800,
        views: 71000,
        clicks: 960,
        source: "MANUAL",
      },
      {
        campaignId: glowUp.id,
        influencerId: influencers.meera.id,
        date: daysAgo(1),
        reach: 41000,
        impressions: 58000,
        engagements: 2100,
        views: 30000,
        clicks: 340,
        source: "MANUAL",
      },
    ],
    skipDuplicates: true,
  });

  // ── Messaging ──────────────────────────────────────────────────────────
  const irisConversation = await db.conversation.upsert({
    where: {
      campaignId_influencerId: { campaignId: summerLaunch.id, influencerId: iris.id },
    },
    update: {},
    create: { campaignId: summerLaunch.id, influencerId: iris.id },
  });

  await db.message.createMany({
    data: [
      {
        conversationId: irisConversation.id,
        senderId: marco.id,
        body: "Hey Iris! Excited to see the launch day reel — sunrise shots look incredible.",
      },
      {
        conversationId: irisConversation.id,
        senderId: irisUser.id,
        body: "Thank you! Let me know once BrightPeak signs off and I'll get it live.",
      },
    ],
    skipDuplicates: true,
  });

  // ── Notifications ──────────────────────────────────────────────────────
  await db.notification.createMany({
    data: [
      {
        userId: irisUser.id,
        type: "CONTENT_APPROVED",
        title: 'Internal review passed for "Launch Day Trail Reel"',
        link: `/influencer/assignments/${irisSummerAssignment.id}`,
      },
      {
        userId: marco.id,
        type: "CONTENT_SUBMITTED",
        title: "Meera resubmitted the Week 2 Routine Story Series",
        link: `/agency/campaigns/${glowUp.id}/approvals`,
      },
    ],
    skipDuplicates: true,
  });

  // ── Feature flags ──────────────────────────────────────────────────────
  await db.featureFlag.createMany({
    data: [
      {
        key: "new-approvals-ui",
        name: "New approvals UI",
        description: "Side-by-side content review layout.",
        enabled: true,
      },
      {
        key: "ai-caption-suggestions",
        name: "AI caption suggestions",
        description: "Suggest captions for influencer submissions.",
        enabled: false,
      },
      {
        key: "beta-reporting",
        name: "Beta reporting engine",
        description: "Early access to the redesigned KPI dashboards.",
        enabled: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete. All demo users share the password:", SEED_PASSWORD);
  console.log({
    agency: [ava.email, marco.email, priya.email, noah.email],
    clients: [cara.email, derek.email, naomi.email, owen.email, sasha.email],
    influencersWithPortalAccess: [irisUser.email, zaraUser.email],
    brands: [brightpeak.slug, lumen.slug, fizz.slug, nova.slug],
    campaigns: [
      summerLaunch.slug,
      holidayGear.slug,
      glowUp.slug,
      springCollection.slug,
      preWorkoutLaunch.slug,
      ambassadorProgram.slug,
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
