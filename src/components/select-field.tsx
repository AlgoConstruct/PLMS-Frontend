"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
  indent?: number;
  disabled?: boolean;
}

/** Radix Select that participates in native form submission via `name`. */
export function SelectField({ id, name, options, defaultValue, placeholder, required, groupLabel }: {
  id?: string;
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  groupLabel?: string;
}) {
  return (
    <Select name={name} defaultValue={defaultValue} required={required}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder ?? "Select…"} />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        <SelectGroup>
          {groupLabel && <SelectLabel>{groupLabel}</SelectLabel>}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
              <span style={{ paddingLeft: (o.indent ?? 0) * 12 }}>{o.label}</span>
              {o.hint && <span className="ml-2 text-xs text-muted-foreground">{o.hint}</span>}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
