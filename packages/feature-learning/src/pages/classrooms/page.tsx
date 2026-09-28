import Link from "next/link";
import { Plus } from "lucide-react";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { EmptyState, FormField, PageHeader } from "@pathwayiq/ui/blocks/page";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { Input } from "@pathwayiq/ui/components/input";
import { getScopeOptions } from "@pathwayiq/api/data";
import { getNavigation, platformApi } from "@pathwayiq/api/platform";
import type { Classroom, Course } from "@pathwayiq/api/platform-types";
import { createClassroom } from "../_classroom-actions";

function ClassroomList({ items, empty }: { items: Classroom[]; empty: string }) {
  if (items.length === 0) return <EmptyState>{empty}</EmptyState>;
  return (
    <div className="grid gap-2">
      {items.map((c) => (
        <Link key={c.id} href={`/app/c/classroom/${c.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted">
          <span>
            <span className="font-medium">{c.title}</span>
            <span className="block text-xs text-muted-foreground">
              {[c.code, c.section, c.startsOn && `${c.startsOn} – ${c.endsOn ?? ""}`].filter(Boolean).join(" · ")}
            </span>
          </span>
          <Badge variant="outline">{c.status.toLowerCase()}</Badge>
        </Link>
      ))}
    </div>
  );
}

export default async function ClassroomsPage() {
  const [mine, supervised, courses, scopes, nav] = await Promise.all([
    platformApi<Classroom[]>("/api/v1/classrooms"),
    platformApi<Classroom[]>("/api/v1/classrooms?mine=false"),
    platformApi<Course[]>("/api/v1/courses"),
    getScopeOptions(),
    getNavigation("global"),
  ]);
  const my = mine.ok ? mine.data : [];
  const myIds = new Set(my.map((c) => c.id));
  const others = supervised.ok ? supervised.data.filter((c) => !myIds.has(c.id)) : [];
  const courseOptions = [{ value: "none", label: "No course" },
    ...(courses.ok ? courses.data.map((c) => ({ value: c.id, label: c.title, hint: c.code })) : [])];
  return (
    <>
      <PageHeader title="Classrooms" description="Classrooms you belong to, and those you supervise."
                  actions={nav.capabilities.includes("classroom.create") && (
                    <FormDialog trigger={<Button><Plus /> New classroom</Button>} title="New classroom" action={createClassroom}
                                submitLabel="Create" description="You become its teacher. A course uses its latest published version." wide>
                      <FormField label="Organization unit" htmlFor="k-node">
                        <SelectField id="k-node" name="nodeId" required options={scopes.filter((o) => o.value !== "GLOBAL")} />
                      </FormField>
                      <FormField label="Course" htmlFor="k-course">
                        <SelectField id="k-course" name="courseId" defaultValue="none" options={courseOptions} />
                      </FormField>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Code" htmlFor="k-code"><Input id="k-code" name="code" required placeholder="CS201-A" /></FormField>
                        <FormField label="Section" htmlFor="k-section"><Input id="k-section" name="section" placeholder="A" /></FormField>
                      </div>
                      <FormField label="Title" htmlFor="k-title"><Input id="k-title" name="title" required /></FormField>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Starts on" htmlFor="k-start"><Input id="k-start" name="startsOn" type="date" /></FormField>
                        <FormField label="Ends on" htmlFor="k-end"><Input id="k-end" name="endsOn" type="date" /></FormField>
                      </div>
                      <FormField label="Timezone" htmlFor="k-tz" hint="IANA name, e.g. Asia/Kathmandu">
                        <Input id="k-tz" name="timezone" defaultValue="UTC" />
                      </FormField>
                    </FormDialog>
                  )} />
      <Card>
        <CardHeader><CardTitle>My classrooms</CardTitle></CardHeader>
        <CardContent><ClassroomList items={my} empty="You are not in any classroom yet." /></CardContent>
      </Card>
      {others.length > 0 && (
        <Card>
          <CardHeader><CardTitle>In your organization scope</CardTitle></CardHeader>
          <CardContent><ClassroomList items={others} empty="" /></CardContent>
        </Card>
      )}
    </>
  );
}
