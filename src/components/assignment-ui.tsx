import type { ReactNode } from "react";
import Link from "next/link";
import { UserPlus, XCircle } from "lucide-react";
import { revokeAssignment, assignRole } from "@/app/(console)/_actions/access";
import { ConfirmAction } from "@/components/confirm-action";
import { FormDialog } from "@/components/form-dialog";
import { EmptyState, FormField, ScopeLabel } from "@/components/iam";
import { SelectField, type SelectOption } from "@/components/select-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Assignment } from "@/lib/types";

/**
 * Assign a role to a user at a scope. Either the user or the role is fixed by the page; the other
 * is picked. The backend rejects anything wider than the caller's own reach.
 */
export function AssignRoleDialog({ fixedUser, fixedRole, userOptions, roleOptions, scopeOptions, trigger }: {
  fixedUser?: { id: string; label: string };
  fixedRole?: { id: string; label: string };
  userOptions?: SelectOption[];
  roleOptions?: SelectOption[];
  scopeOptions: SelectOption[];
  trigger?: ReactNode;
}) {
  return (
    <FormDialog
      trigger={trigger ?? <Button><UserPlus /> Assign role</Button>}
      title={fixedRole ? `Assign ${fixedRole.label}` : `Assign a role to ${fixedUser?.label}`}
      description="Requires iam.assignment.create at the chosen scope and every permission of the role with at least the same reach. You cannot grant more than you hold."
      action={assignRole}
      submitLabel="Assign"
    >
      {fixedUser ? <input type="hidden" name="userId" value={fixedUser.id} /> : (
        <FormField label="User" htmlFor="assign-user">
          <SelectField id="assign-user" name="userId" required options={userOptions ?? []} placeholder="Choose a user" />
        </FormField>
      )}
      {fixedRole ? <input type="hidden" name="roleId" value={fixedRole.id} /> : (
        <FormField label="Role" htmlFor="assign-role">
          <SelectField id="assign-role" name="roleId" required options={roleOptions ?? []} placeholder="Choose a role" />
        </FormField>
      )}
      <FormField label="Scope (where)" htmlFor="assign-scope" hint="The role applies at this node and, depending on each permission's scope mode, below it.">
        <SelectField id="assign-scope" name="scope" required options={scopeOptions} placeholder="Choose a node" />
      </FormField>
      <FormField label="Expires (optional)" htmlFor="assign-expires" hint="Temporary assignments stop granting access automatically.">
        <Input id="assign-expires" name="expiresAt" type="datetime-local" />
      </FormField>
    </FormDialog>
  );
}

export function AssignmentsTable({ assignments, show, canRevoke }: {
  assignments: Assignment[];
  show: "user" | "role";
  canRevoke: boolean;
}) {
  if (assignments.length === 0) return <EmptyState>No assignments visible in your scope.</EmptyState>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{show === "user" ? "User" : "Role"}</TableHead>
          <TableHead>Scope</TableHead>
          <TableHead>Window</TableHead>
          <TableHead>State</TableHead>
          {canRevoke && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((a) => (
          <TableRow key={a.id} className={a.status === "REVOKED" ? "opacity-60" : ""}>
            <TableCell>
              {show === "user" ? (
                <Link href={`/users/${a.user.id}`} className="hover:underline">
                  <span className="font-medium">{a.user.displayName}</span>
                  <span className="block text-xs text-muted-foreground">{a.user.username}</span>
                </Link>
              ) : (
                <Link href={`/roles/${a.role.id}`} className="hover:underline">
                  <span className="font-medium">{a.role.name}</span>
                  <span className="block font-mono text-xs text-muted-foreground">{a.role.code}</span>
                </Link>
              )}
            </TableCell>
            <TableCell><ScopeLabel assignment={a} /></TableCell>
            <TableCell className="text-xs text-muted-foreground">
              from {new Date(a.startsAt).toLocaleDateString()}
              <br />
              {a.expiresAt ? `until ${new Date(a.expiresAt).toLocaleString()}` : "no expiry"}
            </TableCell>
            <TableCell>
              <Badge variant={a.effective ? "secondary" : "outline"}>{a.effective ? "effective" : a.status.toLowerCase()}</Badge>
            </TableCell>
            {canRevoke && (
              <TableCell className="text-right">
                {a.status === "ACTIVE" && (
                  <ConfirmAction
                    trigger={<Button variant="ghost" size="sm" className="text-destructive"><XCircle /> Revoke</Button>}
                    title={`Revoke ${a.role.code} from ${a.user.username}?`}
                    description="Access granted by this assignment stops on the next request. The record is kept for audit."
                    action={revokeAssignment} fields={{ id: a.id }} confirmLabel="Revoke" />
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
