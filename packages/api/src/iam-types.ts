// Types of the IAM API, generated from its OpenAPI document (pnpm api:generate). Do not hand-edit shapes here.
import type { components } from "./generated/iam";

type S = components["schemas"];

export type User = S["UserResponse"];
export type UserStatus = User["status"];
export type Assignment = S["AssignmentResponse"];
export type ScopeType = Assignment["scopeType"];
export type Me = S["MeResponse"];
export type Role = S["RoleResponse"];
export type RecordStatus = Role["status"];
export type RolePermission = S["RolePermissionResponse"];
export type ScopeMode = RolePermission["scopeMode"];
export type Permission = S["PermissionResponse"];
export type Organization = S["OrganizationResponse"];
export type NodeType = S["NodeTypeResponse"];
export type OrgNode = S["NodeResponse"];
export type CheckResult = S["SelfCheckResponse"];
export type ServiceClient = S["ServiceClientResponse"];
export type CreatedServiceClient = S["CreatedServiceClient"];
export type AuditEvent = S["AuditEventResponse"];

/** Paged list wrapper (generic, so not a named schema). */
export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

/** RFC 9457 problem details returned on errors. */
export interface Problem {
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string>;
}
