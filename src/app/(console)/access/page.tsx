import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { FormField, PageHeader } from "@/components/iam";
import { SelectField } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiOrNull } from "@/lib/api";
import { getMe, getScopeOptions } from "@/lib/data";
import type { CheckResult, Permission } from "@/lib/types";

export const metadata: Metadata = { title: "Access check" };

const REASONS: Record<CheckResult["reason"], string> = {
  GRANTED: "One of your active assignments grants this permission and its scope covers the target.",
  NO_MATCHING_GRANT: "No active assignment of yours grants this permission with a scope that covers the target.",
  UNKNOWN_PERMISSION: "The backend does not declare this permission, so it is denied for everyone.",
  RESOURCE_UNRESOLVED: "The target could not be resolved to an organization node, so access is denied.",
  NOT_AUTHENTICATED: "No authenticated user.",
};

export default async function AccessPage({ searchParams }: PageProps<"/access">) {
  const params = await searchParams;
  const permission = typeof params.permission === "string" ? params.permission : "";
  const target = typeof params.target === "string" ? params.target : "ANY";
  const customNode = typeof params.nodeId === "string" ? params.nodeId.trim() : "";

  const [me, scopeOptions, catalog] = await Promise.all([getMe(), getScopeOptions(), apiOrNull<Permission[]>("/api/v1/iam/permissions")]);
  const codes = catalog?.filter((p) => p.status === "ACTIVE").map((p) => p.code)
    ?? [...new Set([...me.permissions, "organization.read", "organization.update", "iam.user.read", "iam.role.create"])].sort();
  const nodeOptions = scopeOptions.filter((o) => o.value !== "GLOBAL");

  let query = "";
  let targetLabel = "any scope";
  if (target === "GLOBAL") {
    query = "&global=true";
    targetLabel = "GLOBAL";
  } else if (target === "CUSTOM" && customNode) {
    query = `&nodeId=${encodeURIComponent(customNode)}`;
    targetLabel = `node ${customNode}`;
  } else if (target !== "ANY" && target !== "CUSTOM") {
    query = `&nodeId=${encodeURIComponent(target)}`;
    targetLabel = nodeOptions.find((o) => o.value === target)?.label ?? target;
  }
  const result = permission
    ? await apiOrNull<CheckResult>(`/api/v1/auth/me/check?permission=${encodeURIComponent(permission)}${query}`)
    : null;

  return (
    <>
      <PageHeader
        title="Access check"
        description="Ask the authorization engine about your own access. Try a node outside your scope, or a permission your roles do not include."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Question</CardTitle>
            <CardDescription>May I do WHAT, WHERE?</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <FormField label="Permission" htmlFor="q-permission">
                <SelectField id="q-permission" name="permission" defaultValue={permission || codes[0]}
                             options={codes.map((c) => ({ value: c, label: c }))} />
              </FormField>
              <FormField label="Target" htmlFor="q-target">
                <SelectField id="q-target" name="target" defaultValue={target}
                             options={[
                               { value: "ANY", label: "Any scope (held somewhere)" },
                               { value: "GLOBAL", label: "GLOBAL (platform-wide)" },
                               ...nodeOptions,
                               { value: "CUSTOM", label: "Other node id…" },
                             ]} />
              </FormField>
              <FormField label="Node id" htmlFor="q-node" hint="Used with “Other node id”, e.g. a node outside your scope.">
                <Input id="q-node" name="nodeId" defaultValue={customNode} className="font-mono" />
              </FormField>
              <Button type="submit" className="justify-self-start">Evaluate</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decision</CardTitle>
            <CardDescription>GET /api/v1/auth/me/check</CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <p className="text-sm text-muted-foreground">Pick a permission and a target, then evaluate.</p>
            ) : (
              <>
                <div className={`flex items-center gap-4 rounded-xl border p-5 ${result.allowed ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40" : "border-red-200 bg-red-50 dark:bg-red-950/40"}`}>
                  <span className={`grid size-12 place-items-center rounded-full ${result.allowed ? "bg-emerald-100 text-allow" : "bg-red-100 text-deny"}`}>
                    {result.allowed ? <Check className="size-6" /> : <X className="size-6" />}
                  </span>
                  <div>
                    <p className={`text-2xl font-semibold ${result.allowed ? "text-allow" : "text-deny"}`}>{result.allowed ? "ALLOW" : "DENY"}</p>
                    <p className="font-mono text-xs text-muted-foreground">{result.reason}</p>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-[6rem_1fr] gap-y-3 text-sm">
                  <dt className="text-muted-foreground">Who</dt><dd>{me.user.username}</dd>
                  <dt className="text-muted-foreground">What</dt><dd className="font-mono">{result.permission}</dd>
                  <dt className="text-muted-foreground">Where</dt><dd>{targetLabel}</dd>
                  <dt className="text-muted-foreground">Why</dt><dd>{REASONS[result.reason]}</dd>
                </dl>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
