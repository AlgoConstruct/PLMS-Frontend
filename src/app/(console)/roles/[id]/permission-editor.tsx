"use client";

import { useActionState, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ActionState, ServerAction } from "@/lib/action-state";
import type { Permission, RolePermission, ScopeMode } from "@/lib/types";

const MODES: { value: ScopeMode; label: string; hint: string }[] = [
  { value: "CURRENT_AND_DESCENDANTS", label: "Node + subtree", hint: "the assigned node and everything below" },
  { value: "DESCENDANTS", label: "Below node only", hint: "not the assigned node itself" },
  { value: "CURRENT_NODE", label: "Node only", hint: "only the assigned node" },
];

/**
 * Checkbox matrix of the backend permission catalog. Each granted permission has its own scope
 * mode. Saving replaces the role's permission set (PUT /roles/{id}/permissions).
 */
export function PermissionEditor({ roleId, catalog, current, editable, action }: {
  roleId: string;
  catalog: Permission[];
  current: RolePermission[];
  editable: boolean;
  action: ServerAction;
}) {
  const initial = useMemo(() => new Map(current.map((p) => [p.permissionCode, p.scopeMode])), [current]);
  const [selection, setSelection] = useState<Map<string, ScopeMode>>(initial);
  const [filter, setFilter] = useState("");
  const [, formAction, pending] = useActionState<ActionState | undefined, FormData>(async (prev, form) => {
    const result = await action(prev, form);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
    return result;
  }, undefined);

  const active = catalog.filter((p) => p.status === "ACTIVE" && p.code.includes(filter.trim().toLowerCase()));
  const modules = active.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.module] ??= []).push(p);
    return acc;
  }, {});
  const dirty = selection.size !== initial.size || [...selection].some(([code, mode]) => initial.get(code) !== mode);

  const toggle = (code: string, on: boolean) => setSelection((prev) => {
    const next = new Map(prev);
    if (on) next.set(code, prev.get(code) ?? "CURRENT_AND_DESCENDANTS");
    else next.delete(code);
    return next;
  });
  const setMode = (code: string, mode: ScopeMode) => setSelection((prev) => new Map(prev).set(code, mode));
  const toggleModule = (perms: Permission[], on: boolean) => setSelection((prev) => {
    const next = new Map(prev);
    perms.forEach((p) => (on ? next.set(p.code, prev.get(p.code) ?? "CURRENT_AND_DESCENDANTS") : next.delete(p.code)));
    return next;
  });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={roleId} />
      <input type="hidden" name="permissions"
             value={JSON.stringify([...selection].map(([permissionCode, scopeMode]) => ({ permissionCode, scopeMode })))} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter permissions…" className="w-64 pl-8" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{selection.size} selected</span>
          {editable && (
            <>
              <Button type="button" variant="outline" disabled={!dirty || pending} onClick={() => setSelection(new Map(initial))}>Reset</Button>
              <Button type="submit" disabled={!dirty || pending}>{pending ? "Saving…" : "Save permissions"}</Button>
            </>
          )}
        </div>
      </div>
      {!editable && (
        <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          Read-only: changing a role affects every scope, so it requires GLOBAL iam.role.update.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(modules).map(([mod, perms]) => {
          const selectedInModule = perms.filter((p) => selection.has(p.code)).length;
          return (
            <div key={mod} className="rounded-lg border">
              <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Checkbox disabled={!editable}
                            checked={selectedInModule === perms.length}
                            aria-label={`Select all ${mod} permissions`}
                            onCheckedChange={(v) => toggleModule(perms, v === true)} />
                  {mod}
                </label>
                <Badge variant="outline">{selectedInModule}/{perms.length}</Badge>
              </div>
              <ul className="divide-y">
                {perms.map((p) => {
                  const mode = selection.get(p.code);
                  return (
                    <li key={p.code} className="flex items-center justify-between gap-3 px-3 py-2">
                      <label className="flex min-w-0 items-start gap-2">
                        <Checkbox className="mt-0.5" disabled={!editable} checked={mode !== undefined}
                                  onCheckedChange={(v) => toggle(p.code, v === true)} />
                        <span className="min-w-0">
                          <span className="block font-mono text-sm">{p.code}</span>
                          <span className="block truncate text-xs text-muted-foreground">{p.description}</span>
                        </span>
                      </label>
                      {mode && (
                        <Select value={mode} onValueChange={(v) => setMode(p.code, v as ScopeMode)} disabled={!editable}>
                          <SelectTrigger size="sm" className="w-40 shrink-0"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {MODES.map((m) => (
                              <SelectItem key={m.value} value={m.value}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Scope modes: {MODES.map((m) => `${m.label} = ${m.hint}`).join(" · ")}. Global reach only comes from a GLOBAL assignment.
      </p>
    </form>
  );
}
