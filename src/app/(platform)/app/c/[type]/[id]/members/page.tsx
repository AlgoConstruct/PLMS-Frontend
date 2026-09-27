import { UserPlus, XCircle } from "lucide-react";
import { Can } from "@/components/capabilities";
import { ConfirmAction } from "@/components/confirm-action";
import { FormDialog } from "@/components/form-dialog";
import { Forbidden, FormField, PageHeader } from "@/components/iam";
import { SelectField } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getVisibleUsers } from "@/lib/data";
import { platformApi } from "@/lib/platform";
import { addMember, removeMember } from "../../../../_actions";

interface Member { id: string; userId: string; role: string; roleName: string; joinedAt: string }

export default async function MembersPage({ params }: PageProps<"/app/c/[type]/[id]/members">) {
  const { type, id } = await params;
  const [members, users] = await Promise.all([
    platformApi<Member[]>(`/api/v1/contexts/${type}/${id}/members`),
    getVisibleUsers(),
  ]);
  if (!members.ok) return <Forbidden what="the member list" />;
  const name = new Map(users.map((u) => [u.id, u.displayName]));
  const manage = `${type}.member.manage`;
  return (
    <>
      <PageHeader title="Members" actions={
        <Can code={manage}>
          <FormDialog trigger={<Button><UserPlus /> Add member</Button>} title="Add member" action={addMember} submitLabel="Add"
                      description="You can only give roles whose capabilities you hold here.">
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="id" value={id} />
            <FormField label="User" htmlFor="m-user">
              <SelectField id="m-user" name="userId" required options={users.map((u) => ({ value: u.id, label: u.displayName, hint: u.username }))} />
            </FormField>
            <FormField label="Role" htmlFor="m-role">
              <SelectField id="m-role" name="role" required defaultValue="MEMBER"
                           options={[{ value: "OWNER", label: "Owner" }, { value: "MEMBER", label: "Member" }, { value: "VIEWER", label: "Viewer" }]} />
            </FormField>
          </FormDialog>
        </Can>
      } />
      <Card>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {members.data.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{name.get(m.userId) ?? m.userId.slice(0, 8)}</TableCell>
                  <TableCell>{m.roleName}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(m.joinedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Can code={manage}>
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
