import type { ReactNode } from "react";
import { Building2, FolderPlus, Pencil } from "lucide-react";
import { FormField } from "@/components/iam";
import { FormDialog } from "@/components/form-dialog";
import { SelectField } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NodeType, Organization } from "@/lib/types";
import { createNode, createOrganization, updateOrganization } from "../_actions/organization";

export function NewOrganizationDialog() {
  return (
    <FormDialog
      trigger={<Button variant="outline"><Building2 /> New organization</Button>}
      title="New organization"
      description="An independent hierarchy (e.g. another university). Requires GLOBAL organization.create."
      action={createOrganization}
      submitLabel="Create"
    >
      <FormField label="Code" htmlFor="org-code" hint="Uppercase letters, digits, _ or -">
        <Input id="org-code" name="code" placeholder="UNI_A" required />
      </FormField>
      <FormField label="Name" htmlFor="org-name">
        <Input id="org-name" name="name" placeholder="University A" required />
      </FormField>
    </FormDialog>
  );
}

export function EditOrganizationDialog({ organization }: { organization: Organization }) {
  return (
    <FormDialog
      trigger={<Button variant="ghost" size="icon" title="Edit organization"><Pencil /></Button>}
      title="Edit organization"
      description="Requires GLOBAL organization.update. Deactivating an organization suspends every node-scoped role inside it."
      action={updateOrganization}
    >
      <input type="hidden" name="id" value={organization.id} />
      <FormField label="Name" htmlFor="org-edit-name">
        <Input id="org-edit-name" name="name" defaultValue={organization.name} required />
      </FormField>
      <FormField label="Status" htmlFor="org-edit-status">
        <SelectField id="org-edit-status" name="status" defaultValue={organization.status}
                     options={[{ value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }]} />
      </FormField>
    </FormDialog>
  );
}

/** Create a node; the type list is limited to types allowed under the chosen parent. */
export function NewNodeDialog({ organizationId, parent, nodeTypes, trigger }: {
  organizationId: string;
  parent: { id: string; name: string; nodeTypeId: string } | null;
  nodeTypes: NodeType[];
  trigger?: ReactNode;
}) {
  const allowed = nodeTypes.filter((t) => t.status === "ACTIVE" && (parent ? t.parentTypeId === parent.nodeTypeId : t.parentTypeId === null));
  return (
    <FormDialog
      trigger={trigger ?? <Button><FolderPlus /> {parent ? "Add child" : "Add root node"}</Button>}
      title={parent ? `Add a node under ${parent.name}` : "Add a root node"}
      description={parent
        ? "Requires organization.create at this node. Only node types configured as children of this node's type are offered."
        : "Root nodes require GLOBAL organization.create."}
      action={createNode}
      submitLabel="Create node"
    >
      <input type="hidden" name="organizationId" value={organizationId} />
      {parent && <input type="hidden" name="parentId" value={parent.id} />}
      {allowed.length === 0 ? (
        <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          No node type is configured {parent ? "as a child of this node's type" : "as a root type"}. Add one under Node types first.
        </p>
      ) : (
        <FormField label="Node type" htmlFor="node-type">
          <SelectField id="node-type" name="nodeTypeId" required defaultValue={allowed[0].id}
                       options={allowed.map((t) => ({ value: t.id, label: t.name, hint: t.code }))} />
        </FormField>
      )}
      <FormField label="Name" htmlFor="node-name">
        <Input id="node-name" name="name" placeholder="e.g. Computer Science" required />
      </FormField>
      <FormField label="Code" htmlFor="node-code" hint="Unique among siblings. Uppercase letters, digits, _ or -">
        <Input id="node-code" name="code" placeholder="CS" required />
      </FormField>
    </FormDialog>
  );
}
