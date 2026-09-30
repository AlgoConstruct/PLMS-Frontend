import { describe, expect, it } from "vitest";
import { autoSplit } from "./teams";

const ids = (n: number) => Array.from({ length: n }, (_, i) => String.fromCharCode(97 + i));

describe("autoSplit", () => {
  it("deals students into teams whose sizes differ by at most one", () => {
    expect(autoSplit(ids(7), 3)).toEqual([["a", "d", "g"], ["b", "e"], ["c", "f"]]);
    expect(autoSplit(ids(6), 3)).toEqual([["a", "c", "e"], ["b", "d", "f"]]);
  });
  it("uses fewer teams rather than leave a team below the minimum", () => {
    expect(autoSplit(ids(4), 3, 2)).toEqual([["a", "c"], ["b", "d"]]);
    expect(autoSplit(ids(5), 3, 3)).toEqual([["a", "b", "c", "d", "e"]]);
  });
  it("handles empty input and nonsense sizes", () => {
    expect(autoSplit([], 3)).toEqual([]);
    expect(autoSplit(ids(3), 0)).toEqual([]);
  });
});
