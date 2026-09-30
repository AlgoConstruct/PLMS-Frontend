// Types of the learning platform API, generated from its OpenAPI document (pnpm api:generate).
import type { components } from "./generated/platform";

type S = components["schemas"];

export type Course = S["CourseResponse"];
export type VersionSummary = S["VersionSummary"];
export type CourseDetail = S["CourseDetailResponse"];
export type Material = S["MaterialView"];
export type Lesson = S["LessonView"];
export type Unit = S["UnitView"];
export type AssignmentTemplate = S["AssignmentTemplateView"];
export type CourseVersion = S["VersionView"];
export type Classroom = S["ClassroomResponse"];
export type ClassroomDetail = S["ClassroomDetailResponse"];
export type Assignment = S["AssignmentResponse"];
export type Announcement = S["AnnouncementResponse"];
export type ClassSession = S["SessionResponse"];
export type SessionOverride = S["OverrideResponse"];
export type Occurrence = S["Occurrence"];
export type ContextRole = S["RoleResponse"];
export type Member = S["MemberResponse"];
export type ProjectTemplate = S["ProjectTemplateView"];
export type Project = S["ProjectResponse"];
export type ProjectTask = S["TaskResponse"];
export type ChecklistItem = S["ChecklistItemResponse"];
export type WorkflowStatus = S["StatusResponse"];
export type Objective = S["ObjectiveResponse"];
export type ProjectProgress = S["ProgressResponse"];
export type Milestone = S["MilestoneResponse"];
export type Deliverable = S["DeliverableResponse"];
export type Review = S["ReviewResponse"];
export type ShowcaseState = S["ShowcaseState"];
export type PublicShowcase = S["PublicShowcase"];
