/**
 * Menu keys the frontend has pages for. The backend decides WHAT is visible; this registry decides WHERE a
 * key leads. Unknown keys are skipped so a backend menu can never produce a broken link.
 */
const GLOBAL_PAGES = new Set(["home", "workspaces"]);
const CONTEXT_PAGES: Record<string, Set<string>> = {
  workspace: new Set(["workspace-overview", "workspace-members"]),
};

export function resolveRoute(key: string, route: string, context?: { type: string; id: string }): string | null {
  if (!context) {
    if (!GLOBAL_PAGES.has(key)) {
      console.warn(`[nav] no page registered for menu key "${key}"`);
      return null;
    }
    return route;
  }
  if (!CONTEXT_PAGES[context.type]?.has(key)) {
    console.warn(`[nav] no page registered for ${context.type} menu key "${key}"`);
    return null;
  }
  const base = `/app/c/${context.type}/${context.id}`;
  return route ? `${base}/${route}` : base;
}
