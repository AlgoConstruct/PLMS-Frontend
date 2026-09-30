import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { publicApi } from "@pathwayiq/api/public";
import type { PublicShowcase } from "@pathwayiq/api/platform-types";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";

async function load(slug: string) {
  const result = await publicApi<PublicShowcase>("platform", `/api/v1/showcase/${encodeURIComponent(slug)}`);
  return result.ok ? result.data : null;
}

export async function generateMetadata({ params }: PageProps<"/showcase/[slug]">): Promise<Metadata> {
  const s = await load((await params).slug);
  return { title: s ? `${s.title} · Pathway IQ showcase` : "Showcase" };
}

export default async function ShowcasePage({ params }: PageProps<"/showcase/[slug]">) {
  const { slug } = await params;
  const s = await load(slug);
  if (!s) notFound();
  const size = (n: number) => (n < 1048576 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1048576).toFixed(1)} MB`);
  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-10">
      <header className="grid gap-2">
        <Badge variant="outline" className="w-fit">Project showcase</Badge>
        <h1 className="text-3xl font-semibold">{s.title}</h1>
        {s.summary && <p className="text-muted-foreground">{s.summary}</p>}
        <p className="text-sm text-muted-foreground">
          {[s.startsOn && `Started ${s.startsOn}`, s.completedAt && `completed ${s.completedAt.slice(0, 10)}`].filter(Boolean).join(" · ")}
        </p>
        {s.team.length > 0 && <p className="text-sm">Team: {s.team.join(", ")}</p>}
      </header>
      {s.objectives.length > 0 && (
        <Card>
          <CardHeader><CardTitle>What was achieved</CardTitle></CardHeader>
          <CardContent><ul className="list-disc pl-5 text-sm">{s.objectives.map((o) => <li key={o}>{o}</li>)}</ul></CardContent>
        </Card>
      )}
      {s.deliverables.map((d) => (
        <Card key={d.title} data-deliverable={d.title}>
          <CardHeader><CardTitle>{d.title}</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {d.description && <p className="whitespace-pre-wrap text-muted-foreground">{d.description}</p>}
            {d.files.map((f) => (
              <a key={f.id} href={`/showcase/${slug}/files/${f.id}`} className="flex items-center gap-2 text-primary hover:underline">
                <Download className="size-4" /> {f.name} <span className="text-muted-foreground">({size(f.size)})</span>
              </a>
            ))}
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
