import { TaskListPage } from "../../../../../components/task-list-page";

export default async function ListPage({ params, searchParams }: PageProps<"/app/c/[type]/[id]/list">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  return <TaskListPage id={id} searchParams={sp} mine={false} />;
}
