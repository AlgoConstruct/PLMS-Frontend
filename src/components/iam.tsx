import type { ReactNode } from "react";
import { Globe2, MapPin, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import type { Assignment, ScopeMode } from "@/lib/types";

export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Forbidden({ what }: { what: string }) {
  return (
    <Alert variant="destructive">
      <ShieldAlert />
      <AlertTitle>403 · Not permitted</AlertTitle>
      <AlertDescription>
        The IAM service denied access to {what}. Your roles do not grant the required permission in this scope.
      </AlertDescription>
    </Alert>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <Badge variant={active ? "secondary" : "destructive"} className={active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : ""}>
      {status.toLowerCase()}
    </Badge>
  );
}

const scopeLabels: Record<ScopeMode, string> = {
  CURRENT_NODE: "node only",
  DESCENDANTS: "below node",
  CURRENT_AND_DESCENDANTS: "node + subtree",
};

export function ScopeModeBadge({ mode }: { mode: ScopeMode }) {
  return <Badge variant={mode === "CURRENT_AND_DESCENDANTS" ? "secondary" : "outline"}>{scopeLabels[mode]}</Badge>;
}

export function ScopeLabel({ assignment }: { assignment: Pick<Assignment, "scopeType" | "node"> }) {
  return assignment.scopeType === "GLOBAL" ? (
    <span className="inline-flex items-center gap-1.5"><Globe2 className="size-3.5 text-amber-600" /> Global</span>
  ) : (
    <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5 text-primary" /> {assignment.node?.name}</span>
  );
}

export function FormField({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <Field>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
      {hint && <FieldDescription>{hint}</FieldDescription>}
    </Field>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">{children}</p>;
}
