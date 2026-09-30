import { Can } from "@pathwayiq/access/capabilities";
import { getVisibleUsers } from "@pathwayiq/api/data";
import { platformApi } from "@pathwayiq/api/platform";
import type { CourseVersion, Member, Project } from "@pathwayiq/api/platform-types";
import { PageHeader } from "@pathwayiq/ui/blocks/page";
import { Card, CardContent } from "@pathwayiq/ui/components/card";
import { ProjectList } from "../../../../../components/project-list";
import { StartProjectDialog } from "../../../../../components/start-project-dialog";

export default async function ClassroomProjectsPage({ params }: PageProps<"/app/c/[type]/[id]/projects">) {
  const { id } = await params;
  const [projects, content, members, users] = await Promise.all([
    platformApi<Project[]>(`/api/v1/projects?classroomId=${id}`),
    platformApi<CourseVersion>(`/api/v1/classrooms/${id}/content`),
    platformApi<Member[]>(`/api/v1/contexts/classroom/${id}/members`),
    getVisibleUsers(),
  ]);
  const names = new Map(users.map((u) => [u.id, u.displayName]));
  const templates = content.ok ? content.data.projectTemplates : [];
  const students = (members.ok ? members.data : []).filter((m) => m.role === "STUDENT")
    .map((m) => ({ id: m.userId, name: names.get(m.userId) ?? m.userId.slice(0, 8) }));
  return (
    <>
      <PageHeader title="Projects" description="Projects started in this classroom."
                  actions={templates.length > 0 && students.length > 0 && (
                    <Can code="classroom.assignment.manage">
                      <StartProjectDialog classroomId={id} templates={templates} students={students} />
                    </Can>
                  )} />
      <Can code="classroom.assignment.manage">
        {templates.length === 0 && <p className="text-sm text-muted-foreground">Add a project template to the course to start projects here.</p>}
        {templates.length > 0 && students.length === 0 && <p className="text-sm text-muted-foreground">Enroll students to start projects.</p>}
      </Can>
      <Card>
        <CardContent className="pt-6">
          <ProjectList items={projects.ok ? projects.data : []} empty="No projects in this classroom yet." />
        </CardContent>
      </Card>
    </>
  );
}
