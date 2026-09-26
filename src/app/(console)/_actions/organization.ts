"use server";

import type { ActionState } from "@/lib/action-state";
import { field, mutate } from "@/lib/mutate";
import type { NodeType, Organization, OrgNode } from "@/lib/types";

const PATHS = ["/hierarchy", "/"];

export async function createOrganization(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return mutate<Organization>("/api/v1/iam/organizations", "POST",
    { code: field(form, "code")?.toUpperCase(), name: field(form, "name") },
    (o) => ({ message: `Organization ${o.name} created. Define its node types next.`, redirectTo: `/hierarchy/types?org=${o.id}` }),
    PATHS);
}

export async function updateOrganization(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return mutate<Organization>(`/api/v1/iam/organizations/${field(form, "id")}`, "PATCH",
    { name: field(form, "name"), status: field(form, "status") },
    (o) => `Organization ${o.name} updated`, PATHS);
}

export async function createNodeType(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const parent = field(form, "parentTypeId");
  return mutate<NodeType>("/api/v1/iam/organization-node-types", "POST",
    {
      organizationId: field(form, "organizationId"),
      code: field(form, "code")?.toUpperCase(),
      name: field(form, "name"),
      parentTypeId: parent === "ROOT" ? null : parent,
    },
    (t) => `Node type ${t.name} created`, PATHS);
}

export async function setNodeTypeStatus(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return mutate<NodeType>(`/api/v1/iam/organization-node-types/${field(form, "id")}`, "PATCH",
    { status: field(form, "status") }, (t) => `${t.name} is now ${t.status.toLowerCase()}`, PATHS);
}

export async function deleteNodeType(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return mutate(`/api/v1/iam/organization-node-types/${field(form, "id")}`, "DELETE", undefined, () => "Node type deleted", PATHS);
}

export async function createNode(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const parent = field(form, "parentId");
  return mutate<OrgNode>("/api/v1/iam/organization-nodes", "POST",
    {
      organizationId: field(form, "organizationId"),
      nodeTypeId: field(form, "nodeTypeId"),
      parentId: parent,
      code: field(form, "code")?.toUpperCase(),
      name: field(form, "name"),
    },
    (n) => ({ message: `${n.name} created`, redirectTo: `/hierarchy?org=${n.organizationId}&node=${n.id}` }),
    PATHS);
}

export async function updateNode(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return mutate<OrgNode>(`/api/v1/iam/organization-nodes/${field(form, "id")}`, "PATCH",
    { name: field(form, "name"), code: field(form, "code")?.toUpperCase(), status: field(form, "status") },
    (n) => `${n.name} updated`, PATHS);
}

export async function moveNode(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const parent = field(form, "newParentId");
  return mutate<OrgNode>(`/api/v1/iam/organization-nodes/${field(form, "id")}/move`, "POST",
    { newParentId: parent === "ROOT" ? null : parent },
    (n) => `${n.name} moved`, PATHS);
}

export async function deleteNode(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return mutate(`/api/v1/iam/organization-nodes/${field(form, "id")}`, "DELETE", undefined,
    () => ({ message: "Node deleted", redirectTo: `/hierarchy?org=${field(form, "organizationId")}` }), PATHS);
}
