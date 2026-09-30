import LearningOverview from "@pathwayiq/feature-learning/pages/c/[type]/[id]/page";
import { ProjectOverview } from "@pathwayiq/feature-projects/components/project-overview";

export default async function ContextOverview(props: PageProps<"/app/c/[type]/[id]">) {
  const { type, id } = await props.params;
  if (type === "project") return <ProjectOverview id={id} />;
  return <LearningOverview {...props} />;
}
