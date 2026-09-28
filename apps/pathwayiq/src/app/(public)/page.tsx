import Link from "next/link";
import { cookies } from "next/headers";
import { FolderKanban, GraduationCap, Trophy } from "lucide-react";
import { ACCESS_COOKIE } from "@pathwayiq/auth/session";
import { Button } from "@pathwayiq/ui/components/button";

const FEATURES = [
  { icon: GraduationCap, title: "Classrooms", body: "Reusable course content, schedules, assignments and announcements, per term and section." },
  { icon: FolderKanban, title: "Projects", body: "Student projects with boards, milestones and mentor reviews, inside or outside a class." },
  { icon: Trophy, title: "Portfolio", body: "Verified work collected along the way, ready to show colleges and employers." },
];

export default async function Landing() {
  const signedIn = Boolean((await cookies()).get(ACCESS_COOKIE)?.value);
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm text-primary-foreground">PQ</span>
          Pathway IQ
        </span>
        <Button asChild>
          <Link href={signedIn ? "/app" : "/login"}>{signedIn ? "Open app" : "Sign in"}</Link>
        </Button>
      </header>
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Learning and projects, in one place</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Pathway IQ connects colleges, teachers, students and mentors around real coursework and real projects.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href={signedIn ? "/app" : "/login"}>{signedIn ? "Open app" : "Sign in"}</Link>
        </Button>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border p-6">
            <f.icon className="size-6 text-primary" />
            <h2 className="mt-4 font-semibold">{f.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </section>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">Pathway IQ</footer>
    </main>
  );
}
