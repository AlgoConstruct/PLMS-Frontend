import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";

const LINKS = [
  { href: "/app/admin/users", label: "Users" },
  { href: "/app/admin/roles", label: "Roles" },
  { href: "/app/admin/hierarchy", label: "Organization" },
  { href: "/app/admin/access", label: "Access check" },
];

export function AdminShortcutsCard() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Administration</CardTitle></CardHeader>
      <CardContent className="grid gap-1 text-sm">
        {LINKS.map((l) => <Link key={l.href} href={l.href} className="text-primary hover:underline">{l.label}</Link>)}
      </CardContent>
    </Card>
  );
}
