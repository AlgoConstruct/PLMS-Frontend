import { describe, expect, it } from "vitest";
import { applyMove, columns, COLUMN_PREFIX, dropTarget } from "./board";

const t = (id: string, statusId: string, position: number) => ({ id, statusId, position });
const cols = () => columns(["todo", "done"], [t("b", "todo", 2048), t("a", "todo", 1024), t("c", "todo", 3072), t("d", "done", 1024)]);
const ids = (c: ReturnType<typeof cols>) => Object.fromEntries(Object.entries(c).map(([s, ts]) => [s, ts.map((x) => x.id)]));

describe("columns", () => {
  it("groups by status in position order and keeps empty columns", () => {
    expect(ids(columns(["todo", "doing"], [t("b", "todo", 2), t("a", "todo", 1)]))).toEqual({ todo: ["a", "b"], doing: [] });
  });
});

describe("dropTarget", () => {
  it("drops at the end of a column when over the column itself", () => {
    expect(dropTarget(cols(), "a", `${COLUMN_PREFIX}done`)).toEqual({ statusId: "done", beforeId: null });
  });
  it("drops before a card when moving up or across columns", () => {
    expect(dropTarget(cols(), "c", "a")).toEqual({ statusId: "todo", beforeId: "a" });
    expect(dropTarget(cols(), "a", "d")).toEqual({ statusId: "done", beforeId: "d" });
  });
  it("drops after a card when moving down within a column", () => {
    expect(dropTarget(cols(), "a", "b")).toEqual({ statusId: "todo", beforeId: "c" });
    expect(dropTarget(cols(), "a", "c")).toEqual({ statusId: "todo", beforeId: null });
  });
  it("ignores drops on the card itself or on unknown ids", () => {
    expect(dropTarget(cols(), "a", "a")).toBeNull();
    expect(dropTarget(cols(), "a", "zzz")).toBeNull();
  });
});

describe("applyMove", () => {
  it("moves within and across columns", () => {
    expect(ids(applyMove(cols(), "c", "todo", "a"))).toEqual({ todo: ["c", "a", "b"], done: ["d"] });
    expect(ids(applyMove(cols(), "a", "done", null))).toEqual({ todo: ["b", "c"], done: ["d", "a"] });
    expect(applyMove(cols(), "a", "done", null).done[1].statusId).toBe("done");
  });
  it("leaves the board unchanged for unknown ids", () => {
    const before = cols();
    expect(applyMove(before, "zzz", "done", null)).toBe(before);
    expect(applyMove(before, "a", "nowhere", null)).toBe(before);
  });
});
