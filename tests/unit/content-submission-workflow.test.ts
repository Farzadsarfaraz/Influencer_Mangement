import { describe, expect, it } from "vitest";

import {
  nextContentSubmissionStatus,
  nextDeliverableStatus,
} from "@/lib/workflow/content-submission";

describe("nextContentSubmissionStatus", () => {
  it("hands an internal approval to the client stage rather than finishing it", () => {
    expect(nextContentSubmissionStatus("INTERNAL", "APPROVED")).toBe("IN_REVIEW");
  });

  it("finishes the submission on client approval", () => {
    expect(nextContentSubmissionStatus("CLIENT", "APPROVED")).toBe("APPROVED");
  });

  it("routes changes-requested/rejected the same way at either stage", () => {
    expect(nextContentSubmissionStatus("INTERNAL", "CHANGES_REQUESTED")).toBe(
      "CHANGES_REQUESTED",
    );
    expect(nextContentSubmissionStatus("CLIENT", "CHANGES_REQUESTED")).toBe(
      "CHANGES_REQUESTED",
    );
    expect(nextContentSubmissionStatus("INTERNAL", "REJECTED")).toBe("REJECTED");
    expect(nextContentSubmissionStatus("CLIENT", "REJECTED")).toBe("REJECTED");
  });
});

describe("nextDeliverableStatus", () => {
  it("sends the deliverable back to in-progress when changes are requested", () => {
    expect(nextDeliverableStatus("INTERNAL", "CHANGES_REQUESTED")).toBe("IN_PROGRESS");
    expect(nextDeliverableStatus("CLIENT", "CHANGES_REQUESTED")).toBe("IN_PROGRESS");
  });

  it("only marks the deliverable APPROVED once the client signs off", () => {
    expect(nextDeliverableStatus("INTERNAL", "APPROVED")).toBe("SUBMITTED");
    expect(nextDeliverableStatus("CLIENT", "APPROVED")).toBe("APPROVED");
  });
});
