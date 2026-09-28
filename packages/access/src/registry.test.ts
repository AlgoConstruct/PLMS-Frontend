import { describe, expect, it } from "vitest";
import { buildRegistry } from "./registry";

describe("buildRegistry", () => {
  it("resolves global routes as given and context routes under the context page", () => {
    const registry = buildRegistry([{ name: "learning", globalMenus: ["courses"], contextMenus: { classroom: ["classroom-overview", "classroom-members"] } }]);
    const global = registry.resolveGroups([{ key: "learning", label: "Learning", icon: "book", items: [
      { key: "courses", label: "Courses", icon: "book", route: "/app/courses" },
      { key: "unknown", label: "Unknown", icon: "x", route: "/nowhere" },
    ] }]);
    expect(global[0].items).toEqual([{ key: "courses", label: "Courses", icon: "book", href: "/app/courses" }]);
    const context = registry.resolveGroups([{ key: "classroom", label: "Classroom", icon: "school", items: [
      { key: "classroom-overview", label: "Overview", icon: "home", route: "" },
      { key: "classroom-members", label: "Members", icon: "users", route: "members" },
    ] }], { type: "classroom", id: "abc" });
    expect(context[0].items.map((i) => i.href)).toEqual(["/app/c/classroom/abc", "/app/c/classroom/abc/members"]);
  });

  it("drops groups left without items", () => {
    const registry = buildRegistry([{ name: "x" }]);
    expect(registry.resolveGroups([{ key: "g", label: "G", icon: "x", items: [{ key: "nope", label: "N", icon: "x", route: "/n" }] }])).toEqual([]);
  });

  it("fails when two features claim the same key", () => {
    expect(() => buildRegistry([{ name: "a", globalMenus: ["courses"] }, { name: "b", globalMenus: ["courses"] }])).toThrow(/courses.*a.*b/);
    expect(() => buildRegistry([{ name: "a", cards: { c: () => null } }, { name: "b", cards: { c: () => null } }])).toThrow(/card "c"/);
  });
});
