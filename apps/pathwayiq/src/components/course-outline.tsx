import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseVersion, Lesson, Unit } from "@/lib/platform-types";

const safeUrl = (ref: string) => /^https?:\/\//i.test(ref);

/** Read-only outline; the course editor passes action slots for draft versions. */
export function CourseOutline({ version, unitActions, lessonActions }: {
  version: CourseVersion;
  unitActions?: (unit: Unit) => ReactNode;
  lessonActions?: (lesson: Lesson, unit: Unit) => ReactNode;
}) {
  if (version.units.length === 0) {
    return <p className="text-sm text-muted-foreground">No units yet.</p>;
  }
  return (
    <div className="grid gap-4">
      {version.units.map((unit, index) => (
        <Card key={unit.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>{index + 1}. {unit.title}</CardTitle>
                {unit.summary && <CardDescription>{unit.summary}</CardDescription>}
              </div>
              {unitActions?.(unit)}
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {unit.lessons.length === 0 && <p className="text-sm text-muted-foreground">No lessons yet.</p>}
            {unit.lessons.map((lesson) => (
              <div key={lesson.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium">
                    {lesson.title}
                    {lesson.durationMin && <span className="ml-2 text-xs text-muted-foreground">{lesson.durationMin} min</span>}
                  </div>
                  {lessonActions?.(lesson, unit)}
                </div>
                {lesson.body && <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{lesson.body}</p>}
                {lesson.materials.length > 0 && (
                  <ul className="mt-2 grid gap-1 text-sm">
                    {lesson.materials.map((m) => (
                      <li key={m.id}>
                        {safeUrl(m.ref) ? (
                          <a href={m.ref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                            <ExternalLink className="size-3" /> {m.title}
                          </a>
                        ) : (
                          <span>{m.title}</span>
                        )}
                        <span className="ml-2 text-xs text-muted-foreground">{m.kind.toLowerCase()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
