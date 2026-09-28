/** Pure merge of several backends' GET /api/v1/navigation responses (no Next.js imports, unit-tested). */
export interface Backend { name: string; url: string }
export interface RawItem { key: string; label: string; icon: string; route: string }
export interface RawGroup { key: string; label: string; icon: string; items: RawItem[] }
export interface RawCard { key: string; title: string; size: "small" | "medium" | "wide" }
export interface RawNavigation { context: string; groups: RawGroup[]; capabilities: string[]; cards?: RawCard[] }
export interface Navigation { context: string; groups: RawGroup[]; capabilities: string[]; cards: RawCard[]; unavailable: string[] }

export function mergeNavigation(context: string, results: { backend: string; nav: RawNavigation | null }[]): Navigation {
  const groups = new Map<string, RawGroup>();
  const capabilities = new Set<string>();
  const cards: RawCard[] = [];
  const unavailable: string[] = [];
  for (const { backend, nav } of results) {
    if (!nav) {
      unavailable.push(backend);
      continue;
    }
    for (const group of nav.groups) {
      const existing = groups.get(group.key);
      if (existing) existing.items.push(...group.items);
      else groups.set(group.key, { ...group, items: [...group.items] });
    }
    nav.capabilities.forEach((c) => capabilities.add(c));
    cards.push(...(nav.cards ?? []));
  }
  return { context, groups: [...groups.values()], capabilities: [...capabilities].sort(), cards, unavailable };
}
