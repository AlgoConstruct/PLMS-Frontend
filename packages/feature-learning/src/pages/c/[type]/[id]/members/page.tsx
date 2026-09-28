import { UserPlus, XCircle } from "lucide-react";
import { Can } from "@pathwayiq/access/capabilities";
import { ConfirmAction } from "@pathwayiq/ui/blocks/confirm-action";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { Forbidden, FormField, PageHeader } from "@pathwayiq/ui/blocks/page";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent } from "@pathwayiq/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@pathwayiq/ui/components/table";
import { getVisibleUsers } from "@pathwayiq/api/data";
import { platformApi } from "@pathwayiq/api/platform";
import type { ContextRole, Member } from "@pathwayiq/api/platform-types";
import { bulkAddMembers, removeMember } from "../../../../_actions";

export default async function MembersPage({ params }: PageProps<"/app/c/[type]/[id]/members">) {
  const { type, id } = await params;
  const [members, users, roles] = await Promise.all([
    platformApi<Member[]>(`/api/v1/contexts/${type}/${id}/members`),
    getVisibleUsers(),
    platformApi<ContextRole[]>(`/api/v1/contexts/${type}/${id}/assignable-roles`),
  ]);
  if (!members.ok) return <Forbidden what="the member list" />;
  const names = new Map(users.map((u) => [u.id, u.displayName]));
  const memberIds = new Set(members.data.map((m) => m.userId));
  const candidates = users.filter((u) => !memberIds.has(u.id));
  const assignable = roles.ok ? roles.data : [];
  // Least-privileged assignable role first: no role codes are hardcoded here.
  const leastPrivileged = [...assignable].sort((a, b) => a.capabilities.length - b.capabilities.length)[0];
  return (
    <>
      <PageHeader title="Members" actions={assignable.length > 0 && (
        <FormDialog trigger={<Button><UserPlus /> Add members</Button>} title="Add members" action={bulkAddMembers} submitLabel="Add" wide
                    description="You can only give roles whose capabilities you hold here. People who already have the role are skipped.">
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="id" value={id} />
          <FormField label="Role" htmlFor="m-role">
            <SelectField id="m-role" name="role" required defaultValue={leastPrivileged?.code}
                         options={assignable.map((r) => ({ value: r.code, label: r.name }))} />
          </FormField>
          <fieldset className="grid max-h-72 gap-1 overflow-y-auto rounded-md border p-2">
            <legend className="px-1 text-sm font-medium">People</legend>
            {candidates.length === 0 && <p className="px-2 text-sm text-muted-foreground">No one else visible to you.</p>}
            {candidates.map((u) => (
              <label key={u.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted">
                <input type="checkbox" name="userIds" value={u.id} className="size-4" />
                {u.displayName}
                <span className="text-xs text-muted-foreground">{u.username}</span>
              </label>
            ))}
          </fieldset>
        </FormDialog>
      )} />
      <Card>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {members.data.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{names.get(m.userId) ?? m.userId.slice(0, 8)}</TableCell>
                  <TableCell>{m.roleName}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(m.joinedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Can code={`${type}.member.manage`}>
                      <ConfirmAction trigger={<Button variant="ghost" size="sm" className="text-destructive"><XCircle /> Remove</Button>}
                                     title="Remove member?" description="They lose access on their next request."
                                     action={removeMember} fields={{ type, id, membershipId: m.id }} confirmLabel="Remove" />
                    </Can>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
