import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, Forbidden, FormField, PageHeader } from "@/components/iam";
import { SelectField } from "@/components/select-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { flatten, getVisibleHierarchies, getVisibleUsers } from "@/lib/data";
import type { AuditEvent, Page } from "@/lib/types";

export const metadata: Metadata = { title: "Audit log" };

const PAGE_SIZE = 50;
const RESULT_VARIANT = { ALLOWED: "secondary", DENIED: "destructive", FAILED: "outline" } as const;

export default async function AuditPage({ searchParams }: PageProps<"/audit">) {
  const params = await searchParams;
  const str = (k: string) => (typeof params[k] === "string" && params[k] !== "" ? (params[k] as string) : undefined);
  const page = Math.max(0, Number(str("page") ?? 0) || 0);
  const filters = { userId: str("userId"), nodeId: str("nodeId"), result: str("result"), from: str("from"), to: str("to") };

  const query = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
  if (filters.userId && filters.userId !== "ANY") query.set("userId", filters.userId);
  if (filters.nodeId && filters.nodeId !== "ANY") query.set("nodeId", filters.nodeId);
  if (filters.result && filters.result !== "ANY") query.set("result", filters.result);
  if (filters.from) query.set("from", new Date(filters.from).toISOString());
  if (filters.to) query.set("to", new Date(filters.to).toISOString());

  const [result, users, hierarchies] = await Promise.all([
    api<Page<AuditEvent>>(`/api/v1/iam/audit?${query}`),
    getVisibleUsers(),
    getVisibleHierarchies(),
  ]);
  if (!result.ok) {
    return (
      <>
        <PageHeader title="Audit log" />
        <Forbidden what="the audit log (iam.audit.read)" />
      </>
    );
  }
  const userName = new Map(users.map((u) => [u.id, u.username]));
  const nodes = hierarchies.flatMap((h) => flatten(h.roots));
  const nodeName = new Map(nodes.map(({ node }) => [node.id, node.name]));
  const pageLink = (p: number) => {
    const q = new URLSearchParams(Object.entries({ ...filters, page: String(p) }).filter(([, v]) => v) as [string, string][]);
    return `/audit?${q}`;
  };

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Who did what, to which resource, when, from where, and whether it was allowed. Denials and admin changes are always recorded; you see events inside your scope."
      />

      <Card>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-6 md:items-end">
            <FormField label="Actor" htmlFor="f-user">
              <SelectField id="f-user" name="userId" defaultValue={filters.userId ?? "ANY"}
                           options={[{ value: "ANY", label: "Anyone" }, ...users.map((u) => ({ value: u.id, label: u.username }))]} />
            </FormField>
            <FormField label="Node" htmlFor="f-node">
              <SelectField id="f-node" name="nodeId" defaultValue={filters.nodeId ?? "ANY"}
                           options={[{ value: "ANY", label: "Any node" },
                             ...nodes.map(({ node, level }) => ({ value: node.id, label: node.name, hint: node.typeName, indent: level }))]} />
            </FormField>
            <FormField label="Result" htmlFor="f-result">
              <SelectField id="f-result" name="result" defaultValue={filters.result ?? "ANY"}
                           options={[{ value: "ANY", label: "Any" }, { value: "ALLOWED", label: "Allowed" },
                             { value: "DENIED", label: "Denied" }, { value: "FAILED", label: "Failed" }]} />
            </FormField>
            <FormField label="From" htmlFor="f-from"><Input id="f-from" name="from" type="datetime-local" defaultValue={filters.from} /></FormField>
            <FormField label="To" htmlFor="f-to"><Input id="f-to" name="to" type="datetime-local" defaultValue={filters.to} /></FormField>
            <div className="flex gap-2">
              <Button type="submit">Filter</Button>
              <Button variant="outline" asChild><Link href="/audit">Reset</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{result.data.totalItems} events</CardTitle>
          <CardDescription>Newest first · times in your browser&apos;s time zone</CardDescription>
        </CardHeader>
        <CardContent>
          {result.data.items.length === 0 ? (
            <EmptyState>No events match.</EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>From</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.items.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{new Date(e.occurredAt).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">
                      {e.actorUserId ? (userName.get(e.actorUserId) ?? <span className="font-mono text-xs">{e.actorUserId.slice(0, 8)}…</span>) : "-"}
                      {e.actorClientId && <span className="block font-mono text-xs text-muted-foreground">via {e.actorClientId}</span>}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{e.action}</span>
                      <span className="block text-xs text-muted-foreground">{e.kind.toLowerCase()}</span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {e.nodeId ? (nodeName.get(e.nodeId) ?? e.nodeId.slice(0, 8) + "…") : e.targetType ?? "-"}
                      {e.targetId && !e.nodeId && <span className="block font-mono text-muted-foreground">{e.targetId.slice(0, 8)}…</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={RESULT_VARIANT[e.result]}>{e.result.toLowerCase()}</Badge>
                      {e.reason && <span className="block text-[11px] text-muted-foreground">{e.reason}</span>}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {e.clientIp ?? "-"}
                      {e.requestId && <span className="block" title={e.requestId}>{e.requestId.slice(0, 8)}…</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {result.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Page {page + 1} of {result.data.totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild disabled={page === 0}><Link href={pageLink(Math.max(0, page - 1))}>Previous</Link></Button>
                <Button variant="outline" size="sm" asChild disabled={page + 1 >= result.data.totalPages}><Link href={pageLink(page + 1)}>Next</Link></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
