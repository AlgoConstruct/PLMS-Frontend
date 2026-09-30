/**
 * Deals ids round-robin into ceil(n / size) teams, so sizes differ by at most one; uses fewer teams when that
 * would leave a team below min. The server still enforces the template's limits.
 */
export function autoSplit(ids: string[], size: number, min = 1): string[][] {
  if (ids.length === 0 || size < 1) return [];
  let count = Math.ceil(ids.length / size);
  while (count > 1 && Math.floor(ids.length / count) < min) count--;
  const teams = Array.from({ length: count }, () => [] as string[]);
  ids.forEach((id, i) => teams[i % count].push(id));
  return teams;
}
