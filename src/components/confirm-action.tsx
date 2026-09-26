"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ActionState, ServerAction } from "@/lib/action-state";

/** Confirmation step for destructive or high-impact actions; the outcome is reported as a toast. */
export function ConfirmAction({ trigger, title, description, action, fields, confirmLabel = "Confirm", destructive = true }: {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  action: ServerAction;
  fields: Record<string, string>;
  confirmLabel?: string;
  destructive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [, formAction, pending] = useActionState<ActionState | undefined, FormData>(async (prev, form) => {
    const result = await action(prev, form);
    if (result.ok) {
      toast.success(result.message);
      setOpen(false);
      if (result.redirectTo) router.push(result.redirectTo);
    } else {
      toast.error(result.message);
    }
    return result;
  }, undefined);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction}>
          {Object.entries(fields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <Button type="submit" variant={destructive ? "destructive" : "default"} disabled={pending}>
              {pending ? "Working…" : confirmLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
