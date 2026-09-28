"use client";

import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "../components/alert";
import { Button } from "../components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/dialog";
import type { ActionState, ServerAction } from "../lib/action-state";

/**
 * Dialog whose form submits to a Server Action. Success closes the dialog with a toast; failures
 * (including 403 from the IAM API) stay inline so the user sees exactly why they were denied.
 */
export function FormDialog({ trigger, title, description, action, submitLabel = "Save", children, wide = false }: {
  trigger: ReactNode;
  title: string;
  description?: ReactNode;
  action: ServerAction;
  submitLabel?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionState | undefined, FormData>(async (prev, form) => {
    const result = await action(prev, form);
    if (result.ok) {
      toast.success(result.message);
      setOpen(false);
      if (result.redirectTo) router.push(result.redirectTo);
    }
    return result;
  }, undefined);

  // Submitting via onSubmit (not the form `action` prop) keeps the user's input after a denied request;
  // React resets forms automatically after an action.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={wide ? "sm:max-w-2xl" : "sm:max-w-md"}>
        <form onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="grid gap-4">{children}</div>
          {state && !state.ok && (
            <Alert variant="destructive">
              <ShieldAlert />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
