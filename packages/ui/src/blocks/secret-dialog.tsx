"use client";

import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react";
import { Check, Copy, KeyRound, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../components/alert";
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
import { Input } from "../components/input";
import type { ActionState, ServerAction } from "../lib/action-state";

/**
 * Like FormDialog, but on success it stays open and shows the returned secret once, with a copy button.
 * Closing the dialog discards the secret; it cannot be shown again.
 */
export function SecretDialog({ trigger, title, description, action, submitLabel, children }: {
  trigger: ReactNode;
  title: string;
  description?: ReactNode;
  action: ServerAction;
  submitLabel: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState | undefined, FormData>(action, undefined);
  const [shown, setShown] = useState<ActionState | undefined>(undefined);
  const revealed = state?.ok && state.secret && state.at !== shown?.at ? state : undefined;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };

  const onOpenChange = (next: boolean) => {
    if (!next && revealed) setShown(revealed);
    setCopied(false);
    setOpen(next);
  };

  const copy = async (secret: string) => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success("Secret copied");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {revealed?.secret ? (
          <div className="grid gap-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><KeyRound className="size-5" /> Copy the client secret now</DialogTitle>
              <DialogDescription>{revealed.message}</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <Input readOnly value={revealed.secret} className="font-mono text-xs" aria-label="Client secret" />
              <Button type="button" variant="outline" onClick={() => copy(revealed.secret!)}>
                {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Alert>
              <ShieldAlert />
              <AlertTitle>Shown once</AlertTitle>
              <AlertDescription>
                Store it in the service&apos;s secret configuration (e.g. IAM_CLIENT_SECRET). It cannot be shown again; rotate it if lost.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            {children && <div className="grid gap-4">{children}</div>}
            {state && !state.ok && (
              <Alert variant="destructive">
                <ShieldAlert />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={pending}>{pending ? "Working…" : submitLabel}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
