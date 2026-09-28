import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { ConfirmAction } from "@pathwayiq/ui/blocks/confirm-action";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { EmptyState, FormField, PageHeader, StatusBadge } from "@pathwayiq/ui/blocks/page";
import { OrgSwitcher } from "../../../components/org-switcher";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { Input } from "@pathwayiq/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@pathwayiq/ui/components/table";
import { getVisibleHierarchies, holdsGlobally } from "@pathwayiq/api/data";
import type { NodeType } from "@pathwayiq/api/iam-types";
import { createNodeType, deleteNodeType, setNodeTypeStatus } from "../../_actions/organization";
import { NewOrganizationDialog } from "../organization-dialogs";

export const metadata: Metadata = { title: "Node types" };

/** Orders types as a tree (root types first, children after their parent). */
function ordered(types: NodeType[]): { type: NodeType; level: number }[] {
  const out: { type: NodeType; level: number }[] = [];
  const walk = (parentId: string | null, level: number) =>
    types.filter((t) => t.parentTypeId === parentId).forEach((t) => {
      out.push({ type: t, level });
      walk(t.id, level + 1);
    });
  walk(null, 0);
  return out;
}

export default async function NodeTypesPage({ searchParams }: PageProps<"/app/admin/hierarchy/types">) {
  const params = await searchParams;
  const [hierarchies, canConfigure, canCreateOrg] = await Promise.all([
    getVisibleHierarchies(), holdsGlobally("organization.update"), holdsGlobally("organization.create"),
  ]);
  if (hierarchies.length === 0) {
    return (
      <>
        <PageHeader title="Node types" actions={canCreateOrg && <NewOrganizationDialog />} />
        <EmptyState>No organization is visible to you.</EmptyState>
      </>
    );
  }
  const current = hierarchies.find((h) => h.organization.id === params.org) ?? hierarchies[0];
  const types = ordered(current.nodeTypes);
  const byId = new Map(current.nodeTypes.map((t) => [t.id, t]));

  return (
    <>
      <Link href={`/app/admin/hierarchy?org=${current.organization.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Hierarchy
      </Link>
      <PageHeader
        title="Node types"
        description="Define what the levels of this organization mean and which type may sit under which. IAM never hardcodes College, Department or Program."
        actions={
          <>
            {hierarchies.length > 1 && (
              <OrgSwitcher organizations={hierarchies.map((h) => h.organization)} value={current.organization.id} basePath="/app/admin/hierarchy/types" />
            )}
            {canConfigure && (
              <FormDialog trigger={<Button><Plus /> New node type</Button>} title="New node type" action={createNodeType} submitLabel="Create"
                          description="Requires GLOBAL organization.update.">
                <input type="hidden" name="organizationId" value={current.organization.id} />
                <FormField label="Name" htmlFor="type-name"><Input id="type-name" name="name" placeholder="Faculty" required /></FormField>
                <FormField label="Code" htmlFor="type-code" hint="Uppercase letters, digits, _ or -"><Input id="type-code" name="code" placeholder="FACULTY" required /></FormField>
                <FormField label="Parent type" htmlFor="type-parent" hint="Nodes of this type must sit under a node of the parent type.">
                  <SelectField id="type-parent" name="parentTypeId" defaultValue="ROOT"
                               options={[{ value: "ROOT", label: "(none: root type)" },
                                 ...types.map(({ type, level }) => ({ value: type.id, label: type.name, hint: type.code, indent: level }))]} />
                </FormField>
              </FormDialog>
            )}
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{current.organization.name}</CardTitle>
          <CardDescription>{types.length} node types</CardDescription>
        </CardHeader>
        <CardContent>
          {types.length === 0 ? (
            <EmptyState>No node types yet. Create a root type (e.g. University), then its child types.</EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Parent type</TableHead>
                  <TableHead>Status</TableHead>
                  {canConfigure && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map(({ type, level }) => (
                  <TableRow key={type.id}>
                    <TableCell style={{ paddingLeft: 8 + level * 20 }} className="font-medium">{type.name}</TableCell>
                    <TableCell className="font-mono text-xs">{type.code}</TableCell>
                    <TableCell className="text-muted-foreground">{type.parentTypeId ? byId.get(type.parentTypeId)?.name : "root"}</TableCell>
                    <TableCell><StatusBadge status={type.status} /></TableCell>
                    {canConfigure && (
                      <TableCell className="space-x-2 text-right">
                        <ConfirmAction
                          trigger={<Button variant="outline" size="sm">{type.status === "ACTIVE" ? "Deactivate" : "Activate"}</Button>}
                          title={`${type.status === "ACTIVE" ? "Deactivate" : "Activate"} ${type.name}?`}
                          description={type.status === "ACTIVE" ? "No new nodes of this type can be created. Existing nodes are unaffected." : "Nodes of this type can be created again."}
                          action={setNodeTypeStatus} destructive={false}
                          fields={{ id: type.id, status: type.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }} />
                        <ConfirmAction
                          trigger={<Button variant="ghost" size="icon-sm" title="Delete"><Trash2 /></Button>}
                          title={`Delete ${type.name}?`} description="Only types that no node uses (and no other type uses as parent) can be deleted."
                          action={deleteNodeType} fields={{ id: type.id }} confirmLabel="Delete" />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
