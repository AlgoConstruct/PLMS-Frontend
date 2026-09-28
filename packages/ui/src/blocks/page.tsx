import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/alert";
import { Badge } from "../components/badge";
import { Field, FieldDescription, FieldLabel } from "../components/field";

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
        The server denied access to {what}. Your roles do not grant the required permission in this scope.
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
