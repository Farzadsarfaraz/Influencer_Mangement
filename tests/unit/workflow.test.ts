import { describe, expect, it } from "vitest";

import { canTransitionAssignment } from "@/lib/workflow/assignment";
import { canTransitionCampaign } from "@/lib/workflow/campaign";

describe("canTransitionCampaign", () => {
  it("allows the documented lifecycle path", () => {
    expect(canTransitionCampaign("DRAFT", "PENDING_APPROVAL")).toBe(true);
    expect(canTransitionCampaign("PENDING_APPROVAL", "ACTIVE")).toBe(true);
    expect(canTransitionCampaign("ACTIVE", "PAUSED")).toBe(true);
    expect(canTransitionCampaign("PAUSED", "ACTIVE")).toBe(true);
    expect(canTransitionCampaign("ACTIVE", "COMPLETED")).toBe(true);
    expect(canTransitionCampaign("COMPLETED", "ARCHIVED")).toBe(true);
  });

  it("rejects illegal jumps", () => {
    expect(canTransitionCampaign("DRAFT", "ACTIVE")).toBe(false);
    expect(canTransitionCampaign("ARCHIVED", "ACTIVE")).toBe(false);
    expect(canTransitionCampaign("COMPLETED", "ACTIVE")).toBe(false);
  });

  it("treats ARCHIVED and DECLINED-equivalents as terminal", () => {
    expect(canTransitionCampaign("ARCHIVED", "DRAFT")).toBe(false);
  });
});

describe("canTransitionAssignment", () => {
  it("allows the documented lifecycle path", () => {
    expect(canTransitionAssignment("INVITED", "ACCEPTED")).toBe(true);
    expect(canTransitionAssignment("ACCEPTED", "IN_PROGRESS")).toBe(true);
    expect(canTransitionAssignment("IN_PROGRESS", "SUBMITTED")).toBe(true);
    expect(canTransitionAssignment("SUBMITTED", "IN_REVIEW")).toBe(true);
    expect(canTransitionAssignment("IN_REVIEW", "APPROVED")).toBe(true);
    expect(canTransitionAssignment("APPROVED", "COMPLETED")).toBe(true);
  });

  it("allows revision loop back into progress", () => {
    expect(canTransitionAssignment("IN_REVIEW", "REVISION_REQUESTED")).toBe(true);
    expect(canTransitionAssignment("REVISION_REQUESTED", "IN_PROGRESS")).toBe(true);
  });

  it("rejects illegal jumps and terminal states", () => {
    expect(canTransitionAssignment("INVITED", "APPROVED")).toBe(false);
    expect(canTransitionAssignment("DECLINED", "ACCEPTED")).toBe(false);
    expect(canTransitionAssignment("COMPLETED", "IN_PROGRESS")).toBe(false);
  });
});
