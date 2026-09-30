import type { Person } from "../lib/types";

const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export function Avatars({ ids, people }: { ids: string[]; people: Person[] }) {
  const byId = new Map(people.map((p) => [p.id, p.name]));
  return (
    <span className="flex -space-x-1">
      {ids.map((id) => {
        const name = byId.get(id) ?? "?";
        return (
          <span key={id} title={name}
                className="inline-flex size-6 items-center justify-center rounded-full border bg-muted text-[10px] font-medium">
            {initials(name)}
          </span>
        );
      })}
    </span>
  );
}
