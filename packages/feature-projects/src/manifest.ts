import type { FeatureManifest } from "@pathwayiq/access/registry";
import { MyProjectsCard } from "./cards/my-projects";

export const projectsManifest: FeatureManifest = {
  name: "feature-projects",
  globalMenus: ["projects"],
  contextMenus: {
    project: ["project-overview", "project-board", "project-list", "project-my-tasks", "project-milestones", "project-deliverables", "project-files", "project-members", "project-settings"],
    classroom: ["classroom-projects"],
  },
  cards: { "my-projects": MyProjectsCard },
};
