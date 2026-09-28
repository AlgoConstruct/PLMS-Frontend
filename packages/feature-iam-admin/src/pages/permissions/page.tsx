import type { Metadata } from "next";
import { Forbidden, PageHeader } from "@pathwayiq/ui/blocks/page";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@pathwayiq/ui/components/table";
import { api } from "@pathwayiq/api/iam";
import { getMe } from "@pathwayiq/api/data";
import type { Permission } from "@pathwayiq/api/iam-types";

export const metadata: Metadata = { title: "Permissions" };

export default async function PermissionsPage() {
  const [result, me] = await Promise.all([api<Permission[]>("/api/v1/iam/permissions"), getMe()]);
  if (!result.ok) {
    return (
      <>
        <PageHeader title="Permissions" />
        <Forbidden what="the permission catalog (iam.permission.read)" />
      </>
    );
  }
  const modules = result.data.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.module] ??= []).push(p);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Permissions"
        description="Declared in backend code by each module and synchronized at startup. Administrators attach them to roles but cannot invent new ones."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {Object.entries(modules).map(([mod, permissions]) => (
          <Card key={mod}>
            <CardHeader>
              <CardTitle className="capitalize">{mod}</CardTitle>
              <CardDescription>{permissions.length} permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((p) => (
                    <TableRow key={p.code}>
                      <TableCell>
                        <span className="font-mono">{p.code}</span>
                        <span className="block text-xs text-muted-foreground">{p.description}</span>
                      </TableCell>
                      <TableCell className="space-x-1 text-right">
                        {p.status === "DEPRECATED" && <Badge variant="destructive">deprecated</Badge>}
                        {me.permissions.includes(p.code) && <Badge variant="secondary">you hold</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
