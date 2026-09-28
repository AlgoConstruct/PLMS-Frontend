import { buildRegistry } from "@pathwayiq/access/registry";
import { iamAdminManifest } from "@pathwayiq/feature-iam-admin/manifest";
import { learningManifest } from "@pathwayiq/feature-learning/manifest";

export const registry = buildRegistry([iamAdminManifest, learningManifest]);
