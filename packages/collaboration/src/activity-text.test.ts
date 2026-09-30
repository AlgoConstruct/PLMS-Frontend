import { describe, expect, it } from "vitest";
import { activitySentence } from "./activity-text";

const nameOf = (id: string | null) => (id === "u1" ? "Asha" : id === "u2" ? "Ben" : "Someone");
const e = (verb: string, data: Record<string, unknown> = {}, actorId: string | null = "u1") =>
  ({ id: "x", actorId, verb, targetType: "task", targetId: "t", data, occurredAt: "2026-09-30T10:00:00Z" });

describe("activitySentence", () => {
  it("describes task events with their key", () => {
    expect(activitySentence(e("task.moved", { key: "RA-2", from: "To do", to: "Done" }), nameOf))
      .toBe("Asha moved RA-2 from To do to Done");
    expect(activitySentence(e("task.created", { key: "RA-2", title: "Wire" }), nameOf)).toBe("Asha created RA-2 · Wire");
    expect(activitySentence(e("task.assigned", { key: "RA-2", added: ["u2"], removed: [] }), nameOf))
      .toBe("Asha assigned RA-2 to Ben");
  });
  it("describes collaboration and membership events", () => {
    expect(activitySentence(e("comment.created"), nameOf)).toBe("Asha commented");
    expect(activitySentence(e("file.uploaded", { name: "a.pdf" }), nameOf)).toBe("Asha uploaded a.pdf");
    expect(activitySentence(e("member.added", { userId: "u2", role: "MEMBER" }), nameOf)).toBe("Asha added Ben as member");
    expect(activitySentence(e("project.status_changed", { from: "DRAFT", to: "ACTIVE" }), nameOf))
      .toBe("Asha changed the status from draft to active");
  });
  it("falls back for unknown verbs and system actors", () => {
    expect(activitySentence(e("something.else", {}, null), nameOf)).toBe("Someone: something.else");
  });
});
