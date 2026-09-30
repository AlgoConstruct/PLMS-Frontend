import { describe, expect, it } from "vitest";
import { deliverableLabel, milestoneState, scoreText } from "./milestones";

describe("milestones", () => {
  it("derives the state from status and due date", () => {
    expect(milestoneState({ status: "DONE", dueOn: "2026-01-01" }, "2026-09-30")).toBe("done");
    expect(milestoneState({ status: "OPEN", dueOn: "2026-09-29" }, "2026-09-30")).toBe("overdue");
    expect(milestoneState({ status: "OPEN", dueOn: "2026-09-30" }, "2026-09-30")).toBe("open");
    expect(milestoneState({ status: "OPEN", dueOn: null }, "2026-09-30")).toBe("open");
  });
  it("labels deliverables and scores", () => {
    expect(deliverableLabel("CHANGES_REQUESTED")).toBe("Changes requested");
    expect(deliverableLabel("SUBMITTED")).toBe("Submitted");
    expect(scoreText(9, 10)).toBe("9 / 10");
    expect(scoreText(null, 10)).toBeNull();
    expect(scoreText(null, null)).toBeNull();
  });
});
