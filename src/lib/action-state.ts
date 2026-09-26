/** Result of a Server Action, rendered by FormDialog / ConfirmAction. `at` makes repeated results distinct. */
export interface ActionState {
  ok: boolean;
  message: string;
  at: number;
  /** Optional path to navigate to after success (e.g. a newly created record). */
  redirectTo?: string;
}

export type ServerAction = (state: ActionState | undefined, form: FormData) => Promise<ActionState>;

export const success = (message: string, redirectTo?: string): ActionState => ({ ok: true, message, at: Date.now(), redirectTo });
export const failure = (message: string): ActionState => ({ ok: false, message, at: Date.now() });
