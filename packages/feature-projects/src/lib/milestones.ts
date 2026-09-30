/** Overdue = open and due before today (dates as YYYY-MM-DD, compared as strings). */
export function milestoneState(m: { status: string; dueOn?: string | null }, today: string): "done" | "overdue" | "open" {
  if (m.status === "DONE") return "done";
  return m.dueOn && m.dueOn < today ? "overdue" : "open";
}

const LABELS: Record<string, string> = {
  PENDING: "Not submitted", SUBMITTED: "Submitted", CHANGES_REQUESTED: "Changes requested", ACCEPTED: "Accepted",
};
export const deliverableLabel = (status: string) => LABELS[status] ?? status;

export const scoreText = (score?: number | null, max?: number | null) =>
  score == null || max == null ? null : `${score} / ${max}`;

export const today = () => new Date().toISOString().slice(0, 10);
