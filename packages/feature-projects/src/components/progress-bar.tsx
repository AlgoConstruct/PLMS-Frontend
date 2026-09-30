import { percent } from "../lib/status";

export function ProgressBar({ done, total, label }: { done: number; total: number; label?: string }) {
  const value = percent(done, total);
  return (
    <div className="grid gap-1" aria-label={label ?? "Progress"}>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{done} of {total} done · {value}%</span>
    </div>
  );
}
