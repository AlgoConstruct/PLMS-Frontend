import "server-only";

import { cache } from "react";
import { api, apiOrNull } from "./iam";
import type { CheckResult, Me, NodeType, Organization, OrgNode, Page, User } from "./iam-types";

export const getMe = cache(async (): Promise<Me> => {
  const result = await api<Me>("/api/v1/auth/me");
  if (!result.ok) throw new Error("Could not load the current user");
  return result.data;
});

/** Whether the caller holds a permission through a GLOBAL assignment (asked of the engine, not guessed). */
export const holdsGlobally = cache(async (permission: string): Promise<boolean> => {
  const result = await apiOrNull<CheckResult>(`/api/v1/auth/me/check?permission=${encodeURIComponent(permission)}&global=true`);
  return result?.allowed ?? false;
});

export interface TreeNode extends OrgNode {
  typeName: string;
  children: TreeNode[];
}

export interface OrgHierarchy {
  organization: Organization;
  nodeTypes: NodeType[];
  roots: TreeNode[];
  byId: Map<string, TreeNode>;
}

/**
 * The parts of every organization the current user may read. The API filters all listings by
 * scope; this merges the subtree of each assignment (whole organizations for GLOBAL ones).
 * Nodes whose parent is not visible become roots.
 */
export const getVisibleHierarchies = cache(async (): Promise<OrgHierarchy[]> => {
  const me = await getMe();
  const effective = me.assignments.filter((a) => a.effective);
  const organizations = (await apiOrNull<Organization[]>("/api/v1/iam/organizations")) ?? [];
  const nodes = new Map<string, OrgNode>();

  const addSubtree = async (nodeId: string) => {
    const [node, descendants] = await Promise.all([
      apiOrNull<OrgNode>(`/api/v1/iam/organization-nodes/${nodeId}`),
      apiOrNull<OrgNode[]>(`/api/v1/iam/organization-nodes/${nodeId}/descendants`),
    ]);
    if (node) nodes.set(node.id, node);
    descendants?.forEach((d) => nodes.set(d.id, d));
  };

  const tasks: Promise<void>[] = [];
  if (effective.some((a) => a.scopeType === "GLOBAL")) {
    await Promise.all(organizations.map(async (org) => {
      const roots = (await apiOrNull<OrgNode[]>(`/api/v1/iam/organization-nodes?organizationId=${org.id}`)) ?? [];
      roots.forEach((r) => tasks.push(addSubtree(r.id)));
    }));
  }
  effective.forEach((a) => a.node && tasks.push(addSubtree(a.node.id)));
  await Promise.all(tasks);

  return Promise.all(organizations.map(async (organization) => {
    const nodeTypes = (await apiOrNull<NodeType[]>(`/api/v1/iam/organization-node-types?organizationId=${organization.id}`)) ?? [];
    const typeNames = new Map(nodeTypes.map((t) => [t.id, t.name]));
    const byId = new Map<string, TreeNode>();
    nodes.forEach((n) => {
      if (n.organizationId === organization.id) {
        byId.set(n.id, { ...n, typeName: typeNames.get(n.nodeTypeId) ?? "Node", children: [] });
      }
    });
    const roots: TreeNode[] = [];
    byId.forEach((n) => {
      const parent = n.parentId ? byId.get(n.parentId) : undefined;
      (parent ? parent.children : roots).push(n);
    });
    const sort = (list: TreeNode[]) => {
      list.sort((a, b) => a.name.localeCompare(b.name));
      list.forEach((n) => sort(n.children));
    };
    sort(roots);
    return { organization, nodeTypes, roots, byId };
  }));
});

/** Flattened tree in display order with depth relative to the visible roots. */
export function flatten(roots: TreeNode[]): { node: TreeNode; level: number }[] {
  const out: { node: TreeNode; level: number }[] = [];
  const walk = (list: TreeNode[], level: number) =>
    list.forEach((n) => {
      out.push({ node: n, level });
      walk(n.children, level + 1);
    });
  walk(roots, 0);
  return out;
}

/** Scope options for assignment forms: GLOBAL plus every visible node across organizations. */
export async function getScopeOptions() {
  const hierarchies = await getVisibleHierarchies();
  const nodes = hierarchies.flatMap((h) =>
    flatten(h.roots).map(({ node, level }) => ({
      value: node.id,
      label: node.name,
      hint: hierarchies.length > 1 ? `${node.typeName} · ${h.organization.code}` : node.typeName,
      indent: level,
    })));
  return [{ value: "GLOBAL", label: "Global (platform-wide)", hint: "requires GLOBAL grants" }, ...nodes];
}

/** Users the caller can see (first 100), for pickers. */
export const getVisibleUsers = cache(async (): Promise<User[]> => {
  const page = await apiOrNull<Page<User>>("/api/v1/iam/users?size=100");
  return page?.items ?? [];
});
