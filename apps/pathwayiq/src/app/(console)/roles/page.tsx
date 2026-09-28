import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Plus } from "lucide-react";
import { FormDialog } from "@/components/form-dialog";
import { Forbidden, FormField, PageHeader, StatusBadge } from "@/components/iam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { holdsGlobally } from "@/lib/data";
import type { Role } from "@/lib/types";
import { createRole } from "../_actions/access";

export const metadata: Metadata = { title: "Roles" };

export default async function RolesPage() {
  const [result, canCreate] = await Promise.all([api<Role[]>("/api/v1/iam/roles"), holdsGlobally("iam.role.create")]);

  return (
    <>
      <PageHeader
        title="Roles"
        description="A role is a named set of permissions. It carries no scope: the same role can be assigned to different users at different nodes."
        actions={canCreate && (
          <FormDialog trigger={<Button><Plus /> New role</Button>} title="New role" action={createRole} submitLabel="Create role"
                      description="Roles are shared by every scope, so creating one requires GLOBAL iam.role.create. You choose its permissions next.">
            <FormField label="Code" htmlFor="role-code" hint="UPPER_SNAKE_CASE, e.g. EXAM_COORDINATOR">
              <Input id="role-code" name="code" placeholder="EXAM_COORDINATOR" required pattern="[A-Za-z][A-Za-z0-9_ ]*" />
            </FormField>
            <FormField label="Name" htmlFor="role-name"><Input id="role-name" name="name" placeholder="Exam coordinator" required /></FormField>
            <FormField label="Description" htmlFor="role-description">
              <Textarea id="role-description" name="description" placeholder="What this role is for" />
            </FormField>
          </FormDialog>
        )}
      />
      {!result.ok ? (
        <Forbidden what="role definitions (iam.role.read)" />
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer">
                    <TableCell>
                      <Link href={`/roles/${r.id}`} className="block">
                        <span className="font-medium hover:underline">{r.name}</span>
                        <span className="block font-mono text-xs text-muted-foreground">{r.code}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground">{r.description}</TableCell>
                    <TableCell>
                      {r.systemRole ? <Badge variant="outline"><Lock /> system</Badge> : <Badge variant="secondary">custom</Badge>}
                    </TableCell>
                    <TableCell className="text-right"><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
