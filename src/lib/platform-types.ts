// DTOs returned by the Pathway IQ learning platform (:8082).

export interface Course {
  id: string;
  nodeId: string;
  code: string;
  title: string;
  description: string | null;
  credits: number | null;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
}

export interface VersionSummary {
  id: string;
  version: number;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  changelog: string | null;
}

export interface CourseDetail {
  course: Course;
  versions: VersionSummary[];
  capabilities: string[];
}

export interface Material { id: string; position: number; kind: "LINK" | "FILE" | "VIDEO"; title: string; ref: string }
export interface Lesson { id: string; position: number; title: string; body: string | null; durationMin: number | null; materials: Material[] }
export interface Unit { id: string; position: number; title: string; summary: string | null; lessons: Lesson[] }

export interface AssignmentTemplate {
  id: string;
  versionId: string;
  unitId: string | null;
  title: string;
  instructions: string | null;
  points: number | null;
  relativeDueDays: number | null;
}

export interface CourseVersion {
  id: string;
  courseId: string;
  version: number;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  changelog: string | null;
  units: Unit[];
  assignmentTemplates: AssignmentTemplate[];
}

export interface Classroom {
  id: string;
  nodeId: string;
  courseId: string | null;
  courseVersionId: string | null;
  termId: string | null;
  code: string;
  title: string;
  section: string | null;
  startsOn: string | null;
  endsOn: string | null;
  timezone: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
}

export interface ClassroomDetail {
  classroom: Classroom;
  courseTitle: string | null;
  courseVersion: number | null;
  capabilities: string[];
  roles: string[];
}

export interface Assignment {
  id: string;
  templateId: string | null;
  title: string;
  instructions: string | null;
  dueAt: string | null;
  points: number | null;
  published: boolean;
  createdAt: string;
}

export interface Announcement { id: string; authorId: string; body: string; pinned: boolean; createdAt: string }
export interface ClassSession { id: string; weekday: number; startTime: string; endTime: string; location: string | null }
export interface SessionOverride { id: string; date: string; kind: "EXTRA" | "CANCELLED"; startTime: string | null; endTime: string | null; note: string | null }
export interface Occurrence { date: string; startTime: string; endTime: string; location: string | null; kind: "REGULAR" | "EXTRA"; note: string | null }
export interface ContextRole { code: string; name: string; system: boolean; capabilities: string[] }
export interface Member { id: string; userId: string; role: string; roleName: string; joinedAt: string }
