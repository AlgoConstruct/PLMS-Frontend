import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

const DEMO_USERS = [
  { username: "superadmin", role: "SUPER_ADMIN", scope: "Global" },
  { username: "regionaladmin", role: "REGIONAL_ADMIN", scope: "Kathmandu Region" },
  { username: "collegeadmin", role: "COLLEGE_ADMIN", scope: "College A" },
  { username: "departmentadmin", role: "DEPARTMENT_ADMIN", scope: "College A · IT" },
  { username: "programadmin", role: "PROGRAM_ADMIN", scope: "College A · IT · BIT" },
  { username: "teacher", role: "TEACHER", scope: "College A · IT" },
  { username: "student", role: "STUDENT", scope: "College A · IT · BIT" },
];

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";
  const expired = params.expired === "1";
  const showDemo = process.env.NODE_ENV !== "production" || process.env.SHOW_DEMO_USERS === "true";

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0b1020] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(60%_50%_at_20%_10%,#4f46e5_0%,transparent_60%),radial-gradient(40%_40%_at_90%_90%,#0ea5e9_0%,transparent_60%)]" />
        <div className="relative flex items-center gap-2 text-sm font-semibold tracking-wide">
          <span className="grid size-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/20">PQ</span>
          Pathway IQ · Access
        </div>
        <div className="relative max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Who can do what,
            <br />
            <span className="text-indigo-300">and where.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Roles hold permissions. Assignments place a role at a node in the organization tree. The IAM engine checks both on
            every request, and denies anything it cannot prove is allowed.
          </p>
          <ScopeDiagram />
        </div>
        <p className="relative text-xs text-slate-400">Tokens are kept in httpOnly cookies and never reach browser scripts.</p>
      </aside>

      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use your Pathway IQ account.</p>
          {expired && (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Your session ended. Please sign in again.
            </p>
          )}
          <LoginForm next={next} demoUsers={showDemo ? DEMO_USERS : []} />
        </div>
      </section>
    </main>
  );
}

function ScopeDiagram() {
  const rows = [
    { label: "Kathmandu Region", depth: 0, on: false },
    { label: "College A", depth: 1, on: true, tag: "COLLEGE_ADMIN" },
    { label: "IT Department", depth: 2, on: true },
    { label: "BIT", depth: 3, on: true },
    { label: "College B", depth: 1, on: false },
  ];
  return (
    <div className="mt-8 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2 py-1 text-sm" style={{ paddingLeft: r.depth * 18 }}>
          <span className={`size-2 rounded-full ${r.on ? "bg-emerald-400" : "bg-slate-600"}`} />
          <span className={r.on ? "text-white" : "text-slate-500"}>{r.label}</span>
          {r.tag && <span className="rounded bg-indigo-500/30 px-1.5 py-0.5 font-mono text-[10px] text-indigo-200">{r.tag}</span>}
        </div>
      ))}
      <p className="mt-3 text-xs text-slate-400">One assignment at College A reaches its subtree, never its parent or siblings.</p>
    </div>
  );
}
