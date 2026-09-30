"use client";

import { useCan } from "@pathwayiq/access/capabilities";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { FormField } from "@pathwayiq/ui/blocks/page";
import { Button } from "@pathwayiq/ui/components/button";
import { Input } from "@pathwayiq/ui/components/input";
import { Textarea } from "@pathwayiq/ui/components/textarea";
import { completeProject } from "../pages/_actions";

/** Completing makes the project read-only; supervisors may add a final score (0–100) and a comment. */
export function CompleteDialog({ projectId, title }: { projectId: string; title: string }) {
  const canScore = useCan("project.review.approve");
  return (
    <FormDialog trigger={<Button>Complete</Button>} title={`Complete ${title}`} action={completeProject} submitLabel="Complete"
                description="A completed project is read-only until it is reopened.">
      <input type="hidden" name="projectId" value={projectId} />
      {canScore && (
        <>
          <FormField label="Final score (0–100, optional)" htmlFor="c-score">
            <Input id="c-score" name="finalScore" type="number" min={0} max={100} />
          </FormField>
          <FormField label="Comment" htmlFor="c-comment"><Textarea id="c-comment" name="comment" rows={3} /></FormField>
        </>
      )}
    </FormDialog>
  );
}
