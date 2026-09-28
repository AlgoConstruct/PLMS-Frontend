import { describe, expect, it } from "vitest";
import { mergeNavigation, type RawNavigation } from "./merge";

const iam: RawNavigation = {
  context: "global",
  groups: [{ key: "administration", label: "Administration", icon: "shield", items: [{ key: "iam-users", label: "Users", icon: "users", route: "/app/admin/users" }] }],
  capabilities: ["iam.user.read"],
  cards: [{ key: "admin-shortcuts", title: "Administration", size: "small" }],
};
const platform: RawNavigation = {
  context: "global",
  groups: [
    { key: "main", label: "Home", icon: "home", items: [{ key: "home", label: "Home", icon: "home", route: "/app" }] },
    { key: "administration", label: "Admin", icon: "x", items: [{ key: "extra", label: "Extra", icon: "x", route: "/app/extra" }] },
  ],
  capabilities: ["course.read", "iam.user.read"],
  cards: [{ key: "my-classrooms", title: "My classrooms", size: "medium" }],
};

describe("mergeNavigation", () => {
  it("merges groups with the same key, keeping the first label and all items", () => {
    const nav = mergeNavigation("global", [{ backend: "iam", nav: iam }, { backend: "platform", nav: platform }]);
    expect(nav.groups.map((g) => g.key)).toEqual(["administration", "main"]);
    expect(nav.groups[0].label).toBe("Administration");
    expect(nav.groups[0].items.map((i) => i.key)).toEqual(["iam-users", "extra"]);
  });

  it("unions capabilities and keeps cards in backend order", () => {
    const nav = mergeNavigation("global", [{ backend: "iam", nav: iam }, { backend: "platform", nav: platform }]);
    expect(nav.capabilities).toEqual(["course.read", "iam.user.read"]);
    expect(nav.cards.map((c) => c.key)).toEqual(["admin-shortcuts", "my-classrooms"]);
  });

  it("drops only the menus of a backend that failed", () => {
    const nav = mergeNavigation("global", [{ backend: "iam", nav: null }, { backend: "platform", nav: platform }]);
    expect(nav.unavailable).toEqual(["iam"]);
    expect(nav.groups.map((g) => g.key)).toEqual(["main", "administration"]);
  });
});
