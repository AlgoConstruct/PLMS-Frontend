import type { FeatureManifest } from "@pathwayiq/access/registry";
import { AdminShortcutsCard } from "./cards/admin-shortcuts";

export const iamAdminManifest: FeatureManifest = {
  name: "feature-iam-admin",
  globalMenus: ["iam-users", "iam-roles", "iam-permissions", "iam-hierarchy", "iam-node-types", "iam-access", "iam-service-clients", "iam-audit"],
  cards: { "admin-shortcuts": AdminShortcutsCard },
};
