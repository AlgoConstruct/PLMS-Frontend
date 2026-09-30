import type { ActivityView } from "./types";

const lower = (v: unknown) => String(v ?? "").toLowerCase();
const list = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);

/** One readable sentence per activity entry; unknown verbs fall back to "<actor>: <verb>". */
export function activitySentence(entry: ActivityView, nameOf: (id: string | null) => string): string {
  const who = nameOf(entry.actorId);
  const d = entry.data;
  switch (entry.verb) {
    case "task.created": return `${who} created ${d.key} · ${d.title}`;
    case "task.moved": return `${who} moved ${d.key} from ${d.from} to ${d.to}`;
    case "task.assigned": {
      const added = list(d.added).map(nameOf);
      const removed = list(d.removed).map(nameOf);
      const parts = [added.length ? `assigned ${d.key} to ${added.join(", ")}` : "",
        removed.length ? `unassigned ${removed.join(", ")} from ${d.key}` : ""].filter(Boolean);
      return `${who} ${parts.join(" and ") || `changed the assignees of ${d.key}`}`;
    }
    case "task.deleted": return `${who} deleted ${d.key} · ${d.title}`;
    case "project.created": return `${who} created the project`;
    case "project.status_changed": return `${who} changed the status from ${lower(d.from)} to ${lower(d.to)}`;
    case "comment.created": return `${who} commented`;
    case "file.uploaded": return `${who} uploaded ${d.name}`;
    case "file.deleted": return `${who} deleted ${d.name}`;
    case "member.added": return `${who} added ${nameOf(String(d.userId))} as ${lower(d.role)}`;
    case "member.removed": return `${who} removed ${nameOf(String(d.userId))}`;
    default: return `${who}: ${entry.verb}`;
  }
}
