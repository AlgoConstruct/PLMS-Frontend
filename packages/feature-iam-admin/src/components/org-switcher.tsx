"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@pathwayiq/ui/components/select";

export function OrgSwitcher({ organizations, value, basePath }: {
  organizations: { id: string; name: string; code: string }[];
  value: string;
  basePath: string;
}) {
  const router = useRouter();
  return (
    <Select value={value} onValueChange={(id) => router.push(`${basePath}?org=${id}`)}>
      <SelectTrigger className="w-64">
        {/* Explicit label: Radix renders the selected item's text only after hydration. */}
        <SelectValue>{organizations.find((o) => o.id === value)?.name}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {organizations.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name} <span className="font-mono text-xs text-muted-foreground">{o.code}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
