"use client";

import { useMemo, useState } from "react";
import { Rocket, Shuffle } from "lucide-react";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { FormField } from "@pathwayiq/ui/blocks/page";
import { Button } from "@pathwayiq/ui/components/button";
import { Input } from "@pathwayiq/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@pathwayiq/ui/components/select";
import type { ProjectTemplate } from "@pathwayiq/api/platform-types";
import type { Person } from "../lib/types";
import { autoSplit } from "../lib/teams";
import { startProjects } from "../pages/_actions";

function Fields({ classroomId, templates, students }: { classroomId: string; templates: ProjectTemplate[]; students: Person[] }) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const template = templates.find((t) => t.id === templateId);
  const team = template?.teamMode === "TEAM";
  const [size, setSize] = useState(template?.maxTeamSize ?? 3);
  const [teamCount, setTeamCount] = useState(1);
  const [teamOf, setTeamOf] = useState<Record<string, number>>({});

  const teams = useMemo(() => {
    const out = Array.from({ length: teamCount }, () => [] as string[]);
    students.forEach((s) => { const i = teamOf[s.id]; if (i !== undefined && i < teamCount) out[i].push(s.id); });
    return out;
  }, [students, teamOf, teamCount]);

  const split = () => {
    const result = autoSplit(students.map((s) => s.id), size, template?.minTeamSize ?? 1);
    setTeamCount(Math.max(1, result.length));
    setTeamOf(Object.fromEntries(result.flatMap((members, i) => members.map((id) => [id, i]))));
  };

  return (
    <>
      <input type="hidden" name="classroomId" value={classroomId} />
      <input type="hidden" name="templateId" value={templateId} />
      <input type="hidden" name="teams" value={team ? JSON.stringify(teams) : "[]"} />
      <FormField label="Template" htmlFor="sp-template">
        <Select value={templateId} onValueChange={(v) => { setTemplateId(v); setTeamOf({}); setTeamCount(1); }}>
          <SelectTrigger id="sp-template" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.title} · {t.teamMode === "TEAM" ? "teams" : "individual"}</SelectItem>)}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Starts on" htmlFor="sp-start"><Input id="sp-start" name="startsOn" type="date" /></FormField>
      {!team && <p className="text-sm text-muted-foreground">Each of the {students.length} students gets their own project.</p>}
      {team && (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-end gap-2">
            <FormField label="Team size" htmlFor="sp-size" hint={template?.minTeamSize || template?.maxTeamSize
              ? `Template allows ${template?.minTeamSize ?? 1}–${template?.maxTeamSize ?? "any"}` : undefined}>
              <Input id="sp-size" type="number" min={1} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-24" />
            </FormField>
            <Button type="button" variant="outline" onClick={split}><Shuffle /> Auto-split</Button>
            <Button type="button" variant="ghost" onClick={() => setTeamCount((n) => n + 1)}>Add team</Button>
          </div>
          <div className="grid max-h-72 gap-1 overflow-y-auto rounded-md border p-2">
            {students.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 text-sm">
                <span>{s.name}</span>
                <Select value={teamOf[s.id] === undefined ? "none" : String(teamOf[s.id])}
                        onValueChange={(v) => setTeamOf((m) => {
                          const next = { ...m };
                          if (v === "none") delete next[s.id]; else next[s.id] = Number(v);
                          return next;
                        })}>
                  <SelectTrigger className="w-32" aria-label={`Team for ${s.name}`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No team</SelectItem>
                    {Array.from({ length: teamCount }, (_, i) => <SelectItem key={i} value={String(i)}>Team {i + 1}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {teams.map((t, i) => `Team ${i + 1}: ${t.length}`).join(" · ")}. Empty teams are skipped.
          </p>
        </div>
      )}
    </>
  );
}

export function StartProjectDialog({ classroomId, templates, students }: {
  classroomId: string; templates: ProjectTemplate[]; students: Person[];
}) {
  return (
    <FormDialog trigger={<Button><Rocket /> Start project</Button>} title="Start project" action={startProjects}
                submitLabel="Create" wide description="Projects start active; students become members and teachers supervise.">
      <Fields classroomId={classroomId} templates={templates} students={students} />
    </FormDialog>
  );
}
