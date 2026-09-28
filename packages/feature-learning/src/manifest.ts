import type { FeatureManifest } from "@pathwayiq/access/registry";
import { CoursesCard } from "./cards/courses";
import { MyClassroomsCard } from "./cards/my-classrooms";
import { UpcomingAssignmentsCard } from "./cards/upcoming-assignments";

export const learningManifest: FeatureManifest = {
  name: "feature-learning",
  globalMenus: ["home", "courses", "classrooms", "workspaces"],
  contextMenus: {
    classroom: ["classroom-overview", "classroom-content", "classroom-schedule", "classroom-assignments", "classroom-announcements", "classroom-members"],
    workspace: ["workspace-overview", "workspace-members"],
  },
  cards: {
    "my-classrooms": MyClassroomsCard,
    "upcoming-assignments": UpcomingAssignmentsCard,
    courses: CoursesCard,
  },
};
