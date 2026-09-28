import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightLeft, Check, ChevronRight, ListTree, Pencil, Trash2, X } from "lucide-react";
import { ConfirmAction } from "@pathwayiq/ui/blocks/confirm-action";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { EmptyState, FormField, PageHeader, StatusBadge } from "@pathwayiq/ui/blocks/page";
import { OrgSwitcher } from "../../components/org-switcher";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { Input } from "@pathwayiq/ui/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@pathwayiq/ui/components/tabs";
import { apiOrNull } from "@pathwayiq/api/iam";
import { flatten, getVisibleHierarchies, holdsGlobally, type TreeNode } from "@pathwayiq/api/data";
import type { CheckResult, OrgNode } from "@pathwayiq/api/iam-types";
import { deleteNode, moveNode, updateNode } from "../_actions/organization";
import { EditOrganizationDialog, NewNodeDialog, NewOrganizationDialog } from "./organization-dialogs";

export const metadata: Metadata = { title: "Hierarchy" };

/** IAM-owned permissions always exist; service permissions are checked with the Access check page. */
const PROBES = [
  "organization.read",
  "organization.create",
  "organization.update",
  "organization.delete",
  "iam.user.read",
  "iam.assignment.read",
  "iam.assignment.create",
  "iam.assignment.revoke",
];

export default async function HierarchyPage({ searchParams }: PageProps<"/app/admin/hierarchy">) {
  const params = await searchParams;
  const [hierarchies, globalCreate] = await Promise.all([getVisibleHierarchies(), holdsGlobally("organization.create")]);

  if (hierarchies.length === 0) {
    return (
      <>
        <PageHeader title="Hierarchy" actions={globalCreate && <NewOrganizationDialog />} />
        <EmptyState>No organization is visible to you. Organizations appear here when you hold organization.read inside them.</EmptyState>
      </>
    );
  }

  const current = hierarchies.find((h) => h.organization.id === params.org)
    ?? hierarchies.find((h) => h.byId.size > 0) ?? hierarchies[0];
  const rows = flatten(current.roots);
  const selected = (typeof params.node === "string" && current.byId.get(params.node)) || rows[0]?.node;
  const base = `/app/admin/hierarchy?org=${current.organization.id}`;

  return (
    <>
      <PageHeader
        title="Hierarchy"
        description="Node types (Country, Region, College…) are configuration data. You only see nodes your scope covers."
        actions={
          <>
            {hierarchies.length > 1 && (
              <OrgSwitcher organizations={hierarchies.map((h) => h.organization)} value={current.organization.id} basePath="/app/admin/hierarchy" />
            )}
            <Button variant="outline" asChild>
              <Link href={`/app/admin/hierarchy/types?org=${current.organization.id}`}><ListTree /> Node types</Link>
            </Button>
            {globalCreate && <NewOrganizationDialog />}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {current.organization.name}
              <StatusBadge status={current.organization.status} />
            </CardTitle>
            <CardDescription>{rows.length} visible nodes · {current.nodeTypes.length} node types</CardDescription>
            <CardAction className="flex gap-1">
              {globalCreate && <EditOrganizationDialog organization={current.organization} />}
            </CardAction>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <div className="space-y-4">
                <EmptyState>This organization has no nodes you can see yet.</EmptyState>
                {globalCreate && (
                  <NewNodeDialog organizationId={current.organization.id} parent={null} nodeTypes={current.nodeTypes} />
                )}
              </div>
            ) : (
              <>
                <ul className="-mx-2">
                  {rows.map(({ node, level }) => (
                    <li key={node.id}>
                      <Link href={`${base}&node=${node.id}`} scroll={false}
                            className={`flex items-center gap-2 rounded-md py-1.5 pr-2 text-sm transition ${
                              node.id === selected?.id ? "bg-accent font-medium" : "hover:bg-muted"
                            }`}
                            style={{ paddingLeft: 8 + level * 18 }}>
                        <ChevronRight className={`size-3.5 shrink-0 ${node.children.length ? "text-muted-foreground" : "text-transparent"}`} />
                        <span className={`truncate ${node.status !== "ACTIVE" ? "text-muted-foreground line-through" : ""}`}>{node.name}</span>
                        <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{node.typeName}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {globalCreate && (
                  <div className="mt-4 border-t pt-4">
                    <NewNodeDialog organizationId={current.organization.id} parent={null} nodeTypes={current.nodeTypes}
                                   trigger={<Button variant="outline" size="sm">Add root node</Button>} />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {selected ? <NodeDetail node={selected} hierarchy={current} base={base} /> : <div />}
      </div>
    </>
  );
}

async function NodeDetail({ node, hierarchy, base }: {
  node: TreeNode;
  hierarchy: Awaited<ReturnType<typeof getVisibleHierarchies>>[number];
  base: string;
}) {
  const [ancestors, checks] = await Promise.all([
    apiOrNull<OrgNode[]>(`/api/v1/iam/organization-nodes/${node.id}/ancestors`),
    Promise.all(PROBES.map((p) => apiOrNull<CheckResult>(`/api/v1/auth/me/check?permission=${p}&nodeId=${node.id}`))),
  ]);
  const allowed = Object.fromEntries(PROBES.map((p, i) => [p, checks[i]?.allowed ?? false]));
  const subtree = new Set(flatten([node]).map(({ node: n }) => n.id));
  const moveTargets = flatten(hierarchy.roots).filter(({ node: n }) => !subtree.has(n.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {node.name}
          <StatusBadge status={node.status} />
        </CardTitle>
        <CardDescription>
          <Badge variant="outline">{node.typeName}</Badge> <span className="ml-1 font-mono">{node.code}</span>
        </CardDescription>
        <CardAction className="flex gap-2">
          <NewNodeDialog organizationId={node.organizationId} parent={node} nodeTypes={hierarchy.nodeTypes}
                         trigger={<Button size="sm" disabled={!allowed["organization.create"]}>Add child</Button>} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {(ancestors ?? []).map((a) => (
            <span key={a.id} className="flex items-center gap-1">
              {hierarchy.byId.has(a.id) ? <Link href={`${base}&node=${a.id}`} className="hover:text-foreground">{a.name}</Link> : a.name}
              <ChevronRight className="size-3.5" />
            </span>
          ))}
          {ancestors?.length === 0 && node.parentId && (
            <span className="flex items-center gap-1 italic">ancestors outside your scope <ChevronRight className="size-3.5" /></span>
          )}
          <span className="font-medium text-foreground">{node.name}</span>
        </nav>

        <Tabs defaultValue="access">
          <TabsList>
            <TabsTrigger value="access">Your access</TabsTrigger>
            <TabsTrigger value="children">Children ({node.children.length})</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          <TabsContent value="access" className="pt-2">
            <p className="mb-2 text-xs text-muted-foreground">Live decisions from GET /api/v1/auth/me/check at this node.</p>
            <ul className="divide-y rounded-lg border">
              {PROBES.map((p) => (
                <li key={p} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="font-mono">{p}</span>
                  <span className={`flex items-center gap-1 text-xs font-semibold ${allowed[p] ? "text-allow" : "text-deny"}`}>
                    {allowed[p] ? <Check className="size-4" /> : <X className="size-4" />} {allowed[p] ? "ALLOW" : "DENY"}
                  </span>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="children" className="pt-2">
            {node.children.length === 0 ? (
              <EmptyState>No child nodes.</EmptyState>
            ) : (
              <ul className="divide-y rounded-lg border">
                {node.children.map((c) => (
                  <li key={c.id}>
                    <Link href={`${base}&node=${c.id}`} className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted">
                      <span>{c.name} <span className="font-mono text-xs text-muted-foreground">{c.code}</span></span>
                      <Badge variant="outline">{c.typeName}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="manage" className="space-y-3 pt-2">
            <ManageRow title="Edit details" description="Rename, change code or deactivate. Requires organization.update at this node."
                       enabled={allowed["organization.update"]}>
              <FormDialog trigger={<Button variant="outline" size="sm" disabled={!allowed["organization.update"]}><Pencil /> Edit</Button>}
                          title={`Edit ${node.name}`} action={updateNode}
                          description="Deactivating a node suspends role assignments made on it.">
                <input type="hidden" name="id" value={node.id} />
                <FormField label="Name" htmlFor="edit-name"><Input id="edit-name" name="name" defaultValue={node.name} required /></FormField>
                <FormField label="Code" htmlFor="edit-code"><Input id="edit-code" name="code" defaultValue={node.code} required /></FormField>
                <FormField label="Status" htmlFor="edit-status">
                  <SelectField id="edit-status" name="status" defaultValue={node.status}
                               options={[{ value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }]} />
                </FormField>
              </FormDialog>
            </ManageRow>

            <ManageRow title="Move subtree" description="Requires organization.update here and organization.create at the new parent. The new parent must have the right node type."
                       enabled={allowed["organization.update"]}>
              <FormDialog trigger={<Button variant="outline" size="sm" disabled={!allowed["organization.update"]}><ArrowRightLeft /> Move</Button>}
                          title={`Move ${node.name}`} action={moveNode} submitLabel="Move"
                          description="All descendants move with it; their paths are rewritten in one transaction.">
                <input type="hidden" name="id" value={node.id} />
                <FormField label="New parent" htmlFor="move-parent">
                  <SelectField id="move-parent" name="newParentId" required
                               options={[{ value: "ROOT", label: "(Organization root)" },
                                 ...moveTargets.map(({ node: n, level }) => ({ value: n.id, label: n.name, hint: n.typeName, indent: level }))]} />
                </FormField>
              </FormDialog>
            </ManageRow>

            <ManageRow title="Delete node" description="Only leaves never used in a role assignment can be deleted. Otherwise deactivate the node."
                       enabled={allowed["organization.delete"]}>
              <ConfirmAction trigger={<Button variant="destructive" size="sm" disabled={!allowed["organization.delete"]}><Trash2 /> Delete</Button>}
                             title={`Delete ${node.name}?`} description="This permanently removes the node. It cannot be undone."
                             action={deleteNode} fields={{ id: node.id, organizationId: node.organizationId }} confirmLabel="Delete" />
            </ManageRow>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ManageRow({ title, description, enabled, children }: { title: string; description: string; enabled: boolean; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">{title} {!enabled && <Badge variant="outline" className="ml-1">not permitted here</Badge>}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
