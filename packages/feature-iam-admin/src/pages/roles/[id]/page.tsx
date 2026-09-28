import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock, Pencil, Trash2 } from "lucide-react";
import { AssignRoleDialog, AssignmentsTable } from "../../../components/assignment-ui";
import { ConfirmAction } from "@pathwayiq/ui/blocks/confirm-action";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { Forbidden, FormField, PageHeader, StatusBadge } from "@pathwayiq/ui/blocks/page";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { Input } from "@pathwayiq/ui/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@pathwayiq/ui/components/tabs";
import { Textarea } from "@pathwayiq/ui/components/textarea";
import { api, apiOrNull } from "@pathwayiq/api/iam";
import { getMe, getScopeOptions, getVisibleUsers, holdsGlobally } from "@pathwayiq/api/data";
import type { Assignment, Permission, Role, RolePermission } from "@pathwayiq/api/iam-types";
import { deleteRole, saveRolePermissions, updateRole } from "../../_actions/access";
import { PermissionEditor } from "./permission-editor";

export const metadata: Metadata = { title: "Role" };

export default async function RolePage({ params }: PageProps<"/app/admin/roles/[id]">) {
  const { id } = await params;
  const role = await api<Role>(`/api/v1/iam/roles/${id}`);
  if (!role.ok) {
    return (
      <>
        <BackLink />
        <Forbidden what="this role" />
      </>
    );
  }
  const me = await getMe();
  const has = (code: string) => me.permissions.includes(code);
  const [current, catalog, members, canEdit, canDelete, users, scopeOptions] = await Promise.all([
    apiOrNull<RolePermission[]>(`/api/v1/iam/roles/${id}/permissions`),
    apiOrNull<Permission[]>("/api/v1/iam/permissions"),
    has("iam.assignment.read") ? apiOrNull<Assignment[]>(`/api/v1/iam/user-role-assignments?roleId=${id}`) : null,
    holdsGlobally("iam.role.update"),
    holdsGlobally("iam.role.delete"),
    getVisibleUsers(),
    getScopeOptions(),
  ]);
  const r = role.data;
  // Without the catalog (iam.permission.read) show the role's own permissions read-only.
  const editorCatalog: Permission[] = catalog ?? (current ?? []).map((p) => ({
    code: p.permissionCode, module: p.permissionCode.split(".")[0], description: p.description, status: "ACTIVE" as const,
  }));
  const activeMembers = members?.filter((m) => m.status === "ACTIVE").length ?? 0;

  return (
    <>
      <BackLink />
      <PageHeader
        title={<span className="flex items-center gap-2">{r.name} <StatusBadge status={r.status} /> {r.systemRole && <Badge variant="outline"><Lock /> system</Badge>}</span>}
        description={<><span className="font-mono">{r.code}</span>{r.description && ` · ${r.description}`}</>}
        actions={
          <>
            {canEdit && (
              <FormDialog trigger={<Button variant="outline"><Pencil /> Edit</Button>} title={`Edit ${r.code}`} action={updateRole}
                          description="The code is permanent. System roles cannot be deactivated.">
                <input type="hidden" name="id" value={r.id} />
                <FormField label="Name" htmlFor="role-name"><Input id="role-name" name="name" defaultValue={r.name} required /></FormField>
                <FormField label="Description" htmlFor="role-desc"><Textarea id="role-desc" name="description" defaultValue={r.description ?? ""} /></FormField>
                <FormField label="Status" htmlFor="role-status" hint="An inactive role grants nothing to anyone who holds it.">
                  <SelectField id="role-status" name="status" defaultValue={r.status}
                               options={[{ value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive", disabled: r.systemRole }]} />
                </FormField>
              </FormDialog>
            )}
            {canDelete && !r.systemRole && (
              <ConfirmAction trigger={<Button variant="destructive"><Trash2 /> Delete</Button>} title={`Delete ${r.code}?`}
                             description="Roles that have ever been assigned cannot be deleted; deactivate them instead."
                             action={deleteRole} fields={{ id: r.id }} confirmLabel="Delete role" />
            )}
          </>
        }
      />

      <Tabs defaultValue="permissions">
        <TabsList>
          <TabsTrigger value="permissions">Permissions ({current?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="members">Members ({activeMembers})</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>What this role can do</CardTitle>
              <CardDescription>Pick permissions from the backend catalog and how far each reaches below the node where the role is assigned.</CardDescription>
            </CardHeader>
            <CardContent>
              {current ? (
                <PermissionEditor roleId={r.id} catalog={editorCatalog} current={current} editable={canEdit} action={saveRolePermissions} />
              ) : (
                <Forbidden what="this role's permissions" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Who holds this role, and where</CardTitle>
              <CardDescription>Only assignments inside your scope are listed.</CardDescription>
              {has("iam.assignment.create") && (
                <CardAction>
                  <AssignRoleDialog
                    fixedRole={{ id: r.id, label: r.code }}
                    userOptions={users.filter((u) => u.status === "ACTIVE").map((u) => ({ value: u.id, label: u.displayName, hint: u.username }))}
                    scopeOptions={scopeOptions}
                  />
                </CardAction>
              )}
            </CardHeader>
            <CardContent>
              {members ? (
                <AssignmentsTable assignments={members} show="user" canRevoke={has("iam.assignment.revoke")} />
              ) : (
                <Forbidden what="role assignments (iam.assignment.read)" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function BackLink() {
  return (
    <Link href="/app/admin/roles" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> Roles
    </Link>
  );
}
