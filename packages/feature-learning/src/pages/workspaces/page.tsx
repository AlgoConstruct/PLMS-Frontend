import Link from "next/link";
import { Plus } from "lucide-react";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { EmptyState, FormField, PageHeader } from "@pathwayiq/ui/blocks/page";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { Input } from "@pathwayiq/ui/components/input";
import { platformApi } from "@pathwayiq/api/platform";
import { createWorkspace } from "../_actions";

interface Workspace { id: string; name: string; description: string | null; visibility: string }

export default async function WorkspacesPage() {
  const result = await platformApi<Workspace[]>("/api/v1/workspaces");
  const workspaces = result.ok ? result.data : [];
  return (
    <>
      <PageHeader title="Workspaces" description="Team spaces you belong to."
                  actions={
                    <FormDialog trigger={<Button><Plus /> New workspace</Button>} title="New workspace" action={createWorkspace}
                                submitLabel="Create" description="You become its owner.">
                      <FormField label="Name" htmlFor="w-name"><Input id="w-name" name="name" required /></FormField>
                      <FormField label="Description" htmlFor="w-desc"><Input id="w-desc" name="description" /></FormField>
                      <FormField label="Visibility" htmlFor="w-vis">
                        <SelectField id="w-vis" name="visibility" defaultValue="PRIVATE"
                                     options={[{ value: "PRIVATE", label: "Private (members only)" },
                                       { value: "ORGANIZATION", label: "Organization" }, { value: "PUBLIC", label: "Public" }]} />
                      </FormField>
                    </FormDialog>
                  } />
      <Card>
        <CardHeader><CardTitle>{workspaces.length} workspaces</CardTitle></CardHeader>
        <CardContent className="grid gap-2">
          {workspaces.length === 0 ? <EmptyState>You are not in any workspace yet.</EmptyState> : workspaces.map((w) => (
            <Link key={w.id} href={`/app/c/workspace/${w.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted">
              <span><span className="font-medium">{w.name}</span><span className="block text-xs text-muted-foreground">{w.description}</span></span>
              <Badge variant="outline">{w.visibility.toLowerCase()}</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
