// DTOs returned by the Pathway IQ IAM API (see /v3/api-docs).

export type UserStatus = "ACTIVE" | "DISABLED";
export type RecordStatus = "ACTIVE" | "INACTIVE";
export type ScopeType = "GLOBAL" | "NODE";
export type ScopeMode = "CURRENT_NODE" | "DESCENDANTS" | "CURRENT_AND_DESCENDANTS";

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  userId: string;
  user: { id: string; username: string; displayName: string };
  role: { id: string; code: string; name: string };
  scopeType: ScopeType;
  node: { id: string; organizationId: string; code: string; name: string } | null;
  status: "ACTIVE" | "REVOKED";
  effective: boolean;
  startsAt: string;
  expiresAt: string | null;
  grantedBy: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface Me {
  user: User;
  assignments: Assignment[];
  permissions: string[];
}

export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  systemRole: boolean;
  status: RecordStatus;
}

export interface RolePermission {
  permissionCode: string;
  description: string;
  scopeMode: ScopeMode;
  permissionActive: boolean;
}

export interface Permission {
  code: string;
  module: string;
  description: string;
  status: "ACTIVE" | "DEPRECATED";
}

export interface Organization {
  id: string;
  code: string;
  name: string;
  status: RecordStatus;
}

export interface NodeType {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  parentTypeId: string | null;
  status: RecordStatus;
}

export interface OrgNode {
  id: string;
  organizationId: string;
  nodeTypeId: string;
  parentId: string | null;
  code: string;
  name: string;
  depth: number;
  status: RecordStatus;
}

export interface CheckResult {
  permission: string;
  target: string;
  allowed: boolean;
  reason: "GRANTED" | "NO_MATCHING_GRANT" | "UNKNOWN_PERMISSION" | "RESOURCE_UNRESOLVED" | "NOT_AUTHENTICATED";
}

export interface Problem {
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string>;
}
export interface ServiceClient {
  id: string;
  clientId: string;
  name: string;
  prefixes: string[];
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  updatedAt: string;
}

export interface CreatedServiceClient {
  client: ServiceClient;
  clientSecret: string;
}

export interface AuditEvent {
  id: string;
  occurredAt: string;
  kind: "DECISION" | "ADMIN";
  actorUserId: string | null;
  actorClientId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  nodeId: string | null;
  result: "ALLOWED" | "DENIED" | "FAILED";
  reason: string | null;
  clientIp: string | null;
  requestId: string | null;
}
