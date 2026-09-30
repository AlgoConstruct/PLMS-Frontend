import { Plus } from "lucide-react";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { FormField, PageHeader } from "@pathwayiq/ui/blocks/page";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { Input } from "@pathwayiq/ui/components/input";
import { Textarea } from "@pathwayiq/ui/components/textarea";
import { getScopeOptions } from "@pathwayiq/api/data";
import { platformApi } from "@pathwayiq/api/platform";
import type { Project } from "@pathwayiq/api/platform-types";
import { ProjectList } from "../../components/project-list";
import { createProject } from "../_actions";

export default async function ProjectsPage() {
  const [mine, scoped, scopes] = await Promise.all([
    platformApi<Project[]>("/api/v1/projects"),
    platformApi<Project[]>("/api/v1/projects?mine=false"),
    getScopeOptions(),
  ]);
  const my = mine.ok ? mine.data : [];
  const myIds = new Set(my.map((p) => p.id));
  const others = scoped.ok ? scoped.data.filter((p) => !myIds.has(p.id)) : [];
  const nodes = [{ value: "none", label: "No organization unit" }, ...scopes.filter((o) => o.value !== "GLOBAL")];
  return (
    <>
      <PageHeader title="Projects" description="Projects you work on, and those you supervise."
                  actions={
                    <FormDialog trigger={<Button><Plus /> New project</Button>} title="New project" action={createProject}
                                submitLabel="Create" wide
                                description="You become its owner. Choose an organization unit to let its supervisors see the project.">
                      <FormField label="Title" htmlFor="p-title"><Input id="p-title" name="title" required maxLength={200} /></FormField>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Key" htmlFor="p-key" hint="Optional, e.g. ROBO; derived from the title when empty">
                          <Input id="p-key" name="key" maxLength={10} className="uppercase" />
                        </FormField>
                        <FormField label="Visibility" htmlFor="p-vis">
                          <SelectField id="p-vis" name="visibility" defaultValue="PRIVATE" options={[
                            { value: "PRIVATE", label: "Members only" },
                            { value: "ORGANIZATION", label: "Organization unit can view" }]} />
                        </FormField>
                      </div>
                      <FormField label="Organization unit" htmlFor="p-node"><SelectField id="p-node" name="nodeId" defaultValue="none" options={nodes} /></FormField>
                      <FormField label="Summary" htmlFor="p-summary"><Textarea id="p-summary" name="summary" /></FormField>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Starts on" htmlFor="p-start"><Input id="p-start" name="startsOn" type="date" /></FormField>
                        <FormField label="Due on" htmlFor="p-due"><Input id="p-due" name="dueOn" type="date" /></FormField>
                      </div>
                    </FormDialog>
                  } />
      <Card>
        <CardHeader><CardTitle>My projects</CardTitle></CardHeader>
        <CardContent><ProjectList items={my} empty="You are not in any project yet." /></CardContent>
      </Card>
      {others.length > 0 && (
        <Card>
          <CardHeader><CardTitle>In your organization scope</CardTitle></CardHeader>
          <CardContent><ProjectList items={others} empty="" /></CardContent>
        </Card>
      )}
    </>
  );
}
