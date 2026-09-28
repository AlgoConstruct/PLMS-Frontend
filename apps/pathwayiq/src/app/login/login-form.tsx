"use client";

import { useActionState, useRef } from "react";
import { LogIn, ShieldAlert } from "lucide-react";
import { login } from "@pathwayiq/auth/actions";
import { Alert, AlertDescription } from "@pathwayiq/ui/components/alert";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Button } from "@pathwayiq/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@pathwayiq/ui/components/field";
import { Input } from "@pathwayiq/ui/components/input";

interface DemoUser {
  username: string;
  role: string;
  scope: string;
}

export function LoginForm({ next, demoUsers }: { next: string; demoUsers: DemoUser[] }) {
  const [state, action, pending] = useActionState(login, undefined);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const signInAs = (username: string) => {
    if (!usernameRef.current || !passwordRef.current) return;
    usernameRef.current.value = username;
    passwordRef.current.value = "Password123!";
    passwordRef.current.form?.requestSubmit();
  };

  return (
    <>
      <form action={action} className="mt-6">
        <input type="hidden" name="next" value={next} />
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input ref={usernameRef} id="username" name="username" autoComplete="username" required defaultValue={state?.username} autoFocus />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input ref={passwordRef} id="password" name="password" type="password" autoComplete="current-password" required />
          </Field>
          {state?.error && (
            <Alert variant="destructive">
              <ShieldAlert />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={pending} size="lg" className="w-full">
            <LogIn /> {pending ? "Signing in…" : "Sign in"}
          </Button>
        </FieldGroup>
      </form>

      {demoUsers.length > 0 && (
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demo accounts · dev profile</p>
          <ul className="mt-3 divide-y overflow-hidden rounded-xl border bg-card">
            {demoUsers.map((u) => (
              <li key={u.username}>
                <button type="button" onClick={() => signInAs(u.username)} disabled={pending}
                        className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition hover:bg-muted">
                  <span className="font-medium">{u.username}</span>
                  <span className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                    {u.scope} <Badge variant="outline" className="font-mono">{u.role}</Badge>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">Click to sign in with the demo password.</p>
        </div>
      )}
    </>
  );
}
