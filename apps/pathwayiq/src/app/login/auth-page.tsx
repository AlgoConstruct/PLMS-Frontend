import { LoginForm } from "./login-form";

const DEMO_USERS = [
  { username: "superadmin", role: "SUPER_ADMIN", scope: "Global" },
  { username: "regionaladmin", role: "REGIONAL_ADMIN", scope: "Kathmandu Region" },
  { username: "collegeadmin", role: "COLLEGE_ADMIN", scope: "College A" },
  { username: "departmentadmin", role: "DEPARTMENT_ADMIN", scope: "College A · IT" },
  { username: "programadmin", role: "PROGRAM_ADMIN", scope: "College A · IT · BIT" },
  { username: "teacher", role: "TEACHER", scope: "College A · IT" },
  { username: "student", role: "STUDENT", scope: "College A · IT · BIT" },
];

export function AuthPage({ params, initialMode = "signin" }: {
  params: Record<string, string | string[] | undefined>;
  initialMode?: "signin" | "signup";
}) {
  const next = typeof params.next === "string" ? params.next : "/app";
  const expired = params.expired === "1";
  const showDemo = process.env.NODE_ENV !== "production" || process.env.SHOW_DEMO_USERS === "true";
  return <LoginForm next={next} expired={expired} initialMode={initialMode} demoUsers={showDemo ? DEMO_USERS : []} />;
}
