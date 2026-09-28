import { notFound } from "next/navigation";
import { changeContentVersion } from "@/app/(platform)/app/_classroom-actions";
import { Can } from "@/components/capabilities";
import { CourseOutline } from "@/components/course-outline";
import { FormDialog } from "@/components/form-dialog";
import { EmptyState, Forbidden, FormField, PageHeader } from "@/components/iam";
import { SelectField } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { platformApi } from "@/lib/platform";
import type { ClassroomDetail, CourseDetail, CourseVersion } from "@/lib/platform-types";

export default async function ContentPage({ params }: PageProps<"/app/c/[type]/[id]/content">) {
  const { type, id } = await params;
  if (type !== "classroom") notFound();
  const [detail, content] = await Promise.all([
    platformApi<ClassroomDetail>(`/api/v1/classrooms/${id}`),
    platformApi<CourseVersion>(`/api/v1/classrooms/${id}/content`),
  ]);
  if (!detail.ok) return <Forbidden what="this classroom" />;
  const { classroom, courseTitle } = detail.data;
  const course = classroom.courseId ? await platformApi<CourseDetail>(`/api/v1/courses/${classroom.courseId}`) : null;
  const published = course?.ok ? course.data.versions.filter((v) => v.status === "PUBLISHED") : [];
  return (
    <>
      <PageHeader
        title="Course content"
        description={content.ok ? `${courseTitle} · version ${content.data.version}` : undefined}
        actions={published.length > 1 && (
          <Can code="classroom.update">
            <FormDialog trigger={<Button variant="outline">Change version</Button>} title="Use another version"
                        action={changeContentVersion} submitLabel="Switch" description="Existing assignments keep their dates.">
              <input type="hidden" name="classroomId" value={id} />
              <FormField label="Version" htmlFor="cv">
                <SelectField id="cv" name="versionId" defaultValue={classroom.courseVersionId ?? undefined}
                             options={published.map((v) => ({ value: v.id, label: `Version ${v.version}`, hint: v.changelog ?? undefined }))} />
              </FormField>
            </FormDialog>
          </Can>
        )}
      />
      {content.ok ? <CourseOutline version={content.data} /> : <EmptyState>This classroom has no course content.</EmptyState>}
    </>
  );
}
