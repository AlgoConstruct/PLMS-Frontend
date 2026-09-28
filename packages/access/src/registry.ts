import type { ReactNode } from "react";
import type { RawGroup } from "./merge";

export type CardComponent = () => ReactNode | Promise<ReactNode>;

/** What a feature package has pages and cards for; the backend decides what is visible. */
export interface FeatureManifest {
  name: string;
  globalMenus?: readonly string[];
  contextMenus?: Readonly<Record<string, readonly string[]>>;
  cards?: Readonly<Record<string, CardComponent>>;
}

export interface ResolvedItem { key: string; label: string; icon: string; href: string }
export interface ResolvedGroup { key: string; label: string; icon: string; items: ResolvedItem[] }

export interface Registry {
  resolveGroups(groups: RawGroup[], context?: { type: string; id: string }): ResolvedGroup[];
  card(key: string): CardComponent | undefined;
}

function claim<T>(map: Map<string, { owner: string; value: T }>, what: string, key: string, owner: string, value: T) {
  const existing = map.get(key);
  if (existing) throw new Error(`${what} "${key}" is claimed by both ${existing.owner} and ${owner}`);
  map.set(key, { owner, value });
}

export function buildRegistry(manifests: readonly FeatureManifest[]): Registry {
  const global = new Map<string, { owner: string; value: true }>();
  const contexts = new Map<string, { owner: string; value: true }>();
  const cards = new Map<string, { owner: string; value: CardComponent }>();
  for (const m of manifests) {
    m.globalMenus?.forEach((k) => claim(global, "Menu key", k, m.name, true));
    Object.entries(m.contextMenus ?? {}).forEach(([type, keys]) => keys.forEach((k) => claim(contexts, "Menu key", `${type}|${k}`, m.name, true)));
    Object.entries(m.cards ?? {}).forEach(([k, c]) => claim(cards, "Dashboard card", k, m.name, c));
  }
  return {
    resolveGroups(groups, context) {
      return groups
        .map((g) => ({
          key: g.key,
          label: g.label,
          icon: g.icon,
          items: g.items.flatMap((i) => {
            const known = context ? contexts.has(`${context.type}|${i.key}`) : global.has(i.key);
            if (!known) {
              console.warn(`[nav] no page registered for menu key "${i.key}"`);
              return [];
            }
            const base = context ? `/app/c/${context.type}/${context.id}` : "";
            const href = context ? (i.route ? `${base}/${i.route}` : base) : i.route;
            return [{ key: i.key, label: i.label, icon: i.icon, href }];
          }),
        }))
        .filter((g) => g.items.length > 0);
    },
    card: (key) => cards.get(key)?.value,
  };
}
