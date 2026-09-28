"use server";

import { failure, type ActionState } from "@pathwayiq/ui/lib/action-state";
import { field, mutate } from "@pathwayiq/api/mutate";
import type { Assignment, Role, RolePermission, ScopeMode, User } from "@pathwayiq/api/iam-types";

// ---- roles -------------------------------------------------------------------------------------

export async function createRole(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return mutate<Role>("/api/v1/iam/roles", "POST",
    { code: field(form, "code")?.toUpperCase().replace(/[^A-Z0-9_]/g, "_"), name: field(form, "name"), description: field(form, "description") },
    (r) => ({ message: `Role ${r.code} created. Now choose its permissions.`, redirectTo: `/app/admin/roles/${r.id}` }),
    ["/app/admin/roles"]);
}

export async function updateRole(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return mutate<Role>(`/api/v1/iam/roles/${field(form, "id")}`, "PATCH",
    { name: field(form, "name"), description: field(form, "description") ?? "", status: field(form, "status") },
    (r) => `${r.code} updated`, ["/app/admin/roles"]);
}

export async function deleteRole(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return mutate(`/api/v1/iam/roles/${field(form, "id")}`, "DELETE", undefined,
    () => ({ message: "Role deleted", redirectTo: "/app/admin/roles" }), ["/app/admin/roles"]);
}

export async function saveRolePermissions(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  let permissions: { permissionCode: string; scopeMode: ScopeMode }[];
  try {
    permissions = JSON.parse(String(form.get("permissions") ?? "[]"));
  } catch {
    return failure("Invalid permission selection");
  }
  return mutate<RolePermission[]>(`/api/v1/iam/roles/${field(form, "id")}/permissions`, "PUT", { permissions },
    (saved) => `Saved ${saved.length} permissions`, ["/app/admin/roles"]);
}

// ---- users -------------------------------------------------------------------------------------

export async function createUser(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return mutate<User>("/api/v1/iam/users", "POST",
    { username: field(form, "username"), email: field(form, "email"), displayName: field(form, "displayName"), password: form.get("password") },
    (u) => ({ message: `${u.username} created. Assign a role to give it access.`, redirectTo: `/app/admin/users/${u.id}` }),
    ["/app/admin/users"]);
}

export async function updateUser(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const password = form.get("password");
  return mutate<User>(`/api/v1/iam/users/${field(form, "id")}`, "PATCH",
    {
      displayName: field(form, "displayName"),
      email: field(form, "email"),
      password: typeof password === "string" && password.length > 0 ? password : null,
    },
    (u) => `${u.username} updated`, ["/app/admin/users"]);
}

export async function setUserStatus(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return mutate<User>(`/api/v1/iam/users/${field(form, "id")}`, "PATCH", { status: field(form, "status") },
    (u) => `${u.username} is now ${u.status.toLowerCase()}`, ["/app/admin/users"]);
}

// ---- assignments -------------------------------------------------------------------------------

export async function assignRole(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const scope = field(form, "scope");
  const expiresAt = field(form, "expiresAt");
  if (!field(form, "userId") || !field(form, "roleId") || !scope) return failure("Choose a user, a role and a scope");
  return mutate<Assignment>("/api/v1/iam/user-role-assignments", "POST",
    {
      userId: field(form, "userId"),
      roleId: field(form, "roleId"),
      scopeType: scope === "GLOBAL" ? "GLOBAL" : "NODE",
      organizationNodeId: scope === "GLOBAL" ? null : scope,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    },
    (a) => `${a.user.username} is now ${a.role.code} ${a.scopeType === "GLOBAL" ? "globally" : `at ${a.node?.name}`}`,
    ["/app/admin/users", "/app/admin/roles"]);
}

export async function revokeAssignment(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return mutate<Assignment>(`/api/v1/iam/user-role-assignments/${field(form, "id")}`, "DELETE", undefined,
    (a) => `Revoked ${a.role.code} from ${a.user.username}`, ["/app/admin/users", "/app/admin/roles"]);
}
