import Link from "next/link";
import { Plus } from "lucide-react";
import { FormDialog } from "@/components/form-dialog";
import { EmptyState, FormField, PageHeader } from "@/components/iam";
import { SelectField } from "@/components/select-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getScopeOptions } from "@/lib/data";
import { getNavigation, platformApi } from "@/lib/platform";
import type { Course } from "@/lib/platform-types";
import { createCourse } from "../_course-actions";

export default async function CoursesPage() {
  const [result, scopes, nav] = await Promise.all([
    platformApi<Course[]>("/api/v1/courses"),
    getScopeOptions(),
    getNavigation("global"),
  ]);
  const courses = result.ok ? result.data : [];
  const nodes = scopes.filter((o) => o.value !== "GLOBAL");
  return (
    <>
      <PageHeader title="Courses" description="Reusable, versioned content. Classrooms use a published version."
                  actions={nav.capabilities.includes("course.create") && (
                    <FormDialog trigger={<Button><Plus /> New course</Button>} title="New course" action={createCourse}
                                submitLabel="Create" description="Version 1 starts as an editable draft.">
                      <FormField label="Organization unit" htmlFor="c-node">
                        <SelectField id="c-node" name="nodeId" required options={nodes} />
                      </FormField>
                      <FormField label="Code" htmlFor="c-code"><Input id="c-code" name="code" required placeholder="CS201" /></FormField>
                      <FormField label="Title" htmlFor="c-title"><Input id="c-title" name="title" required /></FormField>
                      <FormField label="Description" htmlFor="c-desc"><Textarea id="c-desc" name="description" /></FormField>
                      <FormField label="Credits" htmlFor="c-credits"><Input id="c-credits" name="credits" type="number" min={0} /></FormField>
                    </FormDialog>
                  )} />
      <Card>
        <CardHeader><CardTitle>{courses.length} courses</CardTitle></CardHeader>
        <CardContent className="grid gap-2">
          {courses.length === 0 ? <EmptyState>No courses in your scope yet.</EmptyState> : courses.map((c) => (
            <Link key={c.id} href={`/app/courses/${c.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted">
              <span>
                <span className="font-medium">{c.title}</span>
                <span className="block text-xs text-muted-foreground">{c.code}{c.credits != null ? ` · ${c.credits} credits` : ""}</span>
              </span>
              <Badge variant="outline">{c.status.toLowerCase()}</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
