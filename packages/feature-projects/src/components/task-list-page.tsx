import Link from "next/link";
import { Forbidden, EmptyState, PageHeader } from "@pathwayiq/ui/blocks/page";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Card, CardContent } from "@pathwayiq/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@pathwayiq/ui/components/table";
import type { ProjectTask } from "@pathwayiq/api/platform-types";
import { filtersFrom, loadWorkspaceData } from "../lib/load";
import { isWritable, PRIORITIES, priorityLabel } from "../lib/status";
import { Avatars } from "./avatars";
import { TaskDialogHost } from "./task-dialog-host";
import { TaskFilters } from "./task-filters";

type Search = Record<string, string | string[] | undefined>;
const SORTS = ["board", "key", "title", "status", "priority", "due"] as const;

export async function TaskListPage({ id, searchParams, mine }: { id: string; searchParams: Search; mine: boolean }) {
  const filters = { ...filtersFrom(searchParams), ...(mine ? { assignee: "me" } : {}) };
  const data = await loadWorkspaceData(id, filters);
  if (!data.project) return <Forbidden what="this project" />;
  const statusIndex = new Map(data.statuses.map((s, i) => [s.id, i]));
  const statusName = new Map(data.statuses.map((s) => [s.id, s.name]));
  const sort = SORTS.find((s) => s === searchParams.sort) ?? "board";
  const compare: Record<(typeof SORTS)[number], (a: ProjectTask, b: ProjectTask) => number> = {
    board: () => 0,
    key: (a, b) => a.number - b.number,
    title: (a, b) => a.title.localeCompare(b.title),
    status: (a, b) => (statusIndex.get(a.statusId) ?? 0) - (statusIndex.get(b.statusId) ?? 0),
    priority: (a, b) => PRIORITIES.indexOf(b.priority as never) - PRIORITIES.indexOf(a.priority as never),
    due: (a, b) => (a.dueOn ?? "9999").localeCompare(b.dueOn ?? "9999"),
  };
  const rows = [...data.tasks].sort(compare[sort]);
  const sortHref = (key: string) => {
    const next = new URLSearchParams(Object.entries(searchParams).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : [])));
    next.set("sort", key);
    next.delete("task");
    return `?${next}`;
  };
  const head = (key: (typeof SORTS)[number], label: string) => (
    <TableHead><Link href={sortHref(key)} className={sort === key ? "font-semibold" : ""}>{label}</Link></TableHead>
  );
  const taskHref = (n: number) => {
    const next = new URLSearchParams(Object.entries(searchParams).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : [])));
    next.set("task", String(n));
    return `?${next}`;
  };
  return (
    <>
      <PageHeader title={mine ? "My tasks" : "List"} description={`${data.project.key} · ${rows.length} tasks`} />
      <TaskFilters members={data.members} showAssignee={!mine} />
      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? <div className="p-4"><EmptyState>No tasks match.</EmptyState></div> : (
            <Table>
              <TableHeader>
                <TableRow>{head("key", "Key")}{head("title", "Title")}{head("status", "Status")}{head("priority", "Priority")}<TableHead>Assignees</TableHead>{head("due", "Due")}</TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((t) => (
                  <TableRow key={t.id} data-task-key={t.key}>
                    <TableCell className="text-muted-foreground">{t.key}</TableCell>
                    <TableCell><Link href={taskHref(t.number)} scroll={false} className="font-medium hover:underline">{t.title}</Link></TableCell>
                    <TableCell><Badge variant="outline">{statusName.get(t.statusId)}</Badge></TableCell>
                    <TableCell>{priorityLabel(t.priority)}</TableCell>
                    <TableCell><Avatars ids={t.assigneeIds} people={data.members} /></TableCell>
                    <TableCell>{t.dueOn ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <TaskDialogHost projectId={id} tasks={data.tasks} statuses={data.statuses} members={data.members}
                      editable={isWritable(data.project.status)} />
    </>
  );
}
