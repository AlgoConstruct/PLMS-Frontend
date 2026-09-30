import { TaskListPage } from "../../../../../components/task-list-page";

export default async function MyTasksPage({ params, searchParams }: PageProps<"/app/c/[type]/[id]/my-tasks">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  return <TaskListPage id={id} searchParams={sp} mine />;
}
