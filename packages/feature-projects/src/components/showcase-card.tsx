import Link from "next/link";
import { ExternalLink, Globe } from "lucide-react";
import { Can } from "@pathwayiq/access/capabilities";
import { ConfirmAction } from "@pathwayiq/ui/blocks/confirm-action";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { platformApi } from "@pathwayiq/api/platform";
import type { ShowcaseState } from "@pathwayiq/api/platform-types";
import { publishShowcase, unpublishShowcase } from "../pages/_actions";

/** Completed projects can be published to a public page (accepted work only, no scores). */
export async function ShowcaseCard({ projectId }: { projectId: string }) {
  const state = await platformApi<ShowcaseState>(`/api/v1/projects/${projectId}/showcase`);
  const s = state.ok ? state.data : null;
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="size-4" /> Showcase</CardTitle></CardHeader>
      <CardContent className="grid gap-3 text-sm">
        {s?.published ? (
          <>
            <p>Public page: <Link href={`/showcase/${s.slug}`} target="_blank" className="inline-flex items-center gap-1 text-primary hover:underline"
                                  data-showcase-link>/showcase/{s.slug} <ExternalLink className="size-3" /></Link></p>
            <p className="text-muted-foreground">{s.showTeam ? "Team names are shown." : "Team names are hidden."}</p>
            <Can code="project.showcase.publish">
              <ConfirmAction trigger={<Button variant="outline" size="sm" className="w-fit">Unpublish</Button>} title="Remove from the showcase?"
                             action={unpublishShowcase} fields={{ projectId }} confirmLabel="Unpublish" />
            </Can>
          </>
        ) : (
          <>
            <p className="text-muted-foreground">Share the finished work publicly: summary, achieved objectives and accepted deliverables. Scores and reviews stay private.</p>
            <Can code="project.showcase.publish">
              <FormDialog trigger={<Button size="sm" className="w-fit">Publish to showcase</Button>} title="Publish to showcase"
                          action={publishShowcase} submitLabel="Publish">
                <input type="hidden" name="projectId" value={projectId} />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showTeam" /> Show team names</label>
              </FormDialog>
            </Can>
          </>
        )}
      </CardContent>
    </Card>
  );
}
