import Link from "next/link";
import { KeyRound, Network, UserCog, Users } from "lucide-react";
import { EmptyState, PageHeader, ScopeLabel } from "@/components/iam";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiOrNull } from "@/lib/api";
import { getMe, getVisibleHierarchies } from "@/lib/data";
import type { Page, Role, User } from "@/lib/types";

export default async function DashboardPage() {
  const me = await getMe();
  const has = (code: string) => me.permissions.includes(code);
  const [hierarchies, users, roles] = await Promise.all([
    getVisibleHierarchies(),
    has("iam.user.read") ? apiOrNull<Page<User>>("/api/v1/iam/users?size=1") : null,
    has("iam.role.read") ? apiOrNull<Role[]>("/api/v1/iam/roles") : null,
  ]);
  const visibleNodes = hierarchies.reduce((sum, h) => sum + h.byId.size, 0);

  const grouped = me.permissions.reduce<Record<string, string[]>>((acc, code) => {
    const mod = code.split(".")[0];
    (acc[mod] ??= []).push(code);
    return acc;
  }, {});

  const stats = [
    { label: "Visible nodes", value: visibleNodes, href: "/hierarchy", icon: Network, hint: `${hierarchies.length} organizations` },
    { label: "Users in reach", value: users?.totalItems, href: "/users", icon: Users, hint: "filtered by your scope" },
    { label: "Roles", value: roles?.length, href: "/roles", icon: UserCog, hint: `${roles?.filter((r) => !r.systemRole).length ?? 0} custom` },
    { label: "Effective permissions", value: me.permissions.length, href: "/access", icon: KeyRound, hint: "held in at least one scope" },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${me.user.displayName}`}
        description="Everything here is resolved by the IAM service from your role assignments. Your access token only says who you are."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="h-full transition hover:border-primary/40 hover:shadow-sm">
              <CardHeader>
                <CardDescription className="flex items-center justify-between">
                  {s.label}
                  <s.icon className="size-4" />
                </CardDescription>
                <CardTitle className="text-3xl tabular-nums">
                  {s.value ?? <span className="text-base font-normal text-muted-foreground">no access</span>}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Your role assignments</CardTitle>
            <CardDescription>Who gets which role, where</CardDescription>
          </CardHeader>
          <CardContent>
            {me.assignments.length === 0 ? (
              <EmptyState>No roles assigned. An account without assignments can sign in but do nothing.</EmptyState>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">State</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {me.assignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <p className="font-medium">{a.role.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{a.role.code}</p>
                      </TableCell>
                      <TableCell><ScopeLabel assignment={a} /></TableCell>
                      <TableCell className="text-muted-foreground">{a.expiresAt ? new Date(a.expiresAt).toLocaleDateString() : "never"}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={a.effective ? "secondary" : "outline"}>{a.effective ? "effective" : a.status.toLowerCase()}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Effective permissions</CardTitle>
            <CardDescription>Union of all your roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {me.permissions.length === 0 && <EmptyState>No permissions.</EmptyState>}
            {Object.entries(grouped).map(([mod, codes]) => (
              <div key={mod}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{mod}</p>
                <div className="flex flex-wrap gap-1.5">
                  {codes.map((c) => <Badge key={c} variant="outline" className="font-mono">{c.slice(mod.length + 1)}</Badge>)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
