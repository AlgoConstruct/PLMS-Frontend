import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { AssignRoleDialog, AssignmentsTable } from "../../../components/assignment-ui";
import { ConfirmAction } from "@pathwayiq/ui/blocks/confirm-action";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { Forbidden, FormField, PageHeader, StatusBadge } from "@pathwayiq/ui/blocks/page";
import { Avatar, AvatarFallback } from "@pathwayiq/ui/components/avatar";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { Input } from "@pathwayiq/ui/components/input";
import { api, apiOrNull } from "@pathwayiq/api/iam";
import { getMe, getScopeOptions } from "@pathwayiq/api/data";
import type { Assignment, Role, User } from "@pathwayiq/api/iam-types";
import { setUserStatus, updateUser } from "../../_actions/access";

export const metadata: Metadata = { title: "User" };

export default async function UserPage({ params }: PageProps<"/app/admin/users/[id]">) {
  const { id } = await params;
  const me = await getMe();
  const has = (code: string) => me.permissions.includes(code);
  const result = await api<User>(`/api/v1/iam/users/${id}`);
  if (!result.ok) {
    return (
      <>
        <BackLink />
        <Forbidden what="this user: none of their assignments is inside your scope" />
      </>
    );
  }
  const user = result.data;
  const isSelf = user.id === me.user.id;
  const [assignments, roles, scopeOptions] = await Promise.all([
    has("iam.assignment.read") ? apiOrNull<Assignment[]>(`/api/v1/iam/user-role-assignments?userId=${id}`) : null,
    has("iam.role.read") ? apiOrNull<Role[]>("/api/v1/iam/roles") : null,
    getScopeOptions(),
  ]);

  return (
    <>
      <BackLink />
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <Avatar className="size-10"><AvatarFallback>{user.displayName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
            {user.displayName}
            <StatusBadge status={user.status} />
          </span>
        }
        description={<><span className="font-mono">{user.username}</span> · {user.email}</>}
        actions={has("iam.user.update") && (
          <>
            <FormDialog trigger={<Button variant="outline"><Pencil /> Edit profile</Button>} title={`Edit ${user.username}`} action={updateUser}
                        description="Allowed only if all of this user's assignments are inside your scope.">
              <input type="hidden" name="id" value={user.id} />
              <FormField label="Display name" htmlFor="e-name"><Input id="e-name" name="displayName" defaultValue={user.displayName} required /></FormField>
              <FormField label="Email" htmlFor="e-email"><Input id="e-email" name="email" type="email" defaultValue={user.email} required /></FormField>
              <FormField label="New password" htmlFor="e-password" hint="Leave empty to keep the current password. At least 10 characters.">
                <Input id="e-password" name="password" type="password" minLength={10} autoComplete="new-password" />
              </FormField>
            </FormDialog>
            {!isSelf && (
              <ConfirmAction
                trigger={<Button variant={user.status === "ACTIVE" ? "destructive" : "default"}>{user.status === "ACTIVE" ? "Disable" : "Enable"}</Button>}
                title={`${user.status === "ACTIVE" ? "Disable" : "Enable"} ${user.username}?`}
                description={user.status === "ACTIVE"
                  ? "The user cannot sign in and their current session stops working on the next request. Assignments are kept."
                  : "The user can sign in again and their assignments take effect."}
                action={setUserStatus} destructive={user.status === "ACTIVE"}
                fields={{ id: user.id, status: user.status === "ACTIVE" ? "DISABLED" : "ACTIVE" }} />
            )}
          </>
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle>Role assignments</CardTitle>
          <CardDescription>Only assignments inside your scope are listed.</CardDescription>
          {has("iam.assignment.create") && roles && user.status === "ACTIVE" && (
            <CardAction>
              <AssignRoleDialog
                fixedUser={{ id: user.id, label: user.displayName }}
                roleOptions={roles.filter((r) => r.status === "ACTIVE").map((r) => ({ value: r.id, label: r.name, hint: r.code }))}
                scopeOptions={scopeOptions}
              />
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          {assignments ? (
            <AssignmentsTable assignments={assignments} show="role" canRevoke={has("iam.assignment.revoke")} />
          ) : (
            <Forbidden what="role assignments (iam.assignment.read)" />
          )}
        </CardContent>
      </Card>
    </>
  );
}

function BackLink() {
  return (
    <Link href="/app/admin/users" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> Users
    </Link>
  );
}
