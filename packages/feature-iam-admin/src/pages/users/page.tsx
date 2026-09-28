import type { Metadata } from "next";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { EmptyState, Forbidden, FormField, PageHeader, StatusBadge } from "@pathwayiq/ui/blocks/page";
import { Avatar, AvatarFallback } from "@pathwayiq/ui/components/avatar";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { Input } from "@pathwayiq/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@pathwayiq/ui/components/table";
import { api } from "@pathwayiq/api/iam";
import { getMe } from "@pathwayiq/api/data";
import type { Page, User } from "@pathwayiq/api/iam-types";
import { createUser } from "../_actions/access";

export const metadata: Metadata = { title: "Users" };

const PAGE_SIZE = 20;

export default async function UsersPage({ searchParams }: PageProps<"/app/admin/users">) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const page = Math.max(0, Number(params.page ?? 0) || 0);
  const me = await getMe();
  const result = await api<Page<User>>(
    `/api/v1/iam/users?page=${page}&size=${PAGE_SIZE}${search ? `&search=${encodeURIComponent(search)}` : ""}`);
  const pageLink = (p: number) => `/app/admin/users?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ""}`;

  return (
    <>
      <PageHeader
        title="Users"
        description="Non-global administrators only see users who hold an assignment inside their scope. The filter runs in SQL on the server."
        actions={me.permissions.includes("iam.user.create") && (
          <FormDialog trigger={<Button><UserPlus /> New user</Button>} title="New user" action={createUser} submitLabel="Create user"
                      description="A new account can sign in but has no access until a role is assigned.">
            <FormField label="Display name" htmlFor="u-name"><Input id="u-name" name="displayName" required /></FormField>
            <FormField label="Username" htmlFor="u-username" hint="Letters, digits, '.', '_' and '-'">
              <Input id="u-username" name="username" required minLength={3} />
            </FormField>
            <FormField label="Email" htmlFor="u-email"><Input id="u-email" name="email" type="email" required /></FormField>
            <FormField label="Initial password" htmlFor="u-password" hint="At least 10 characters">
              <Input id="u-password" name="password" type="password" required minLength={10} />
            </FormField>
          </FormDialog>
        )}
      />
      {!result.ok ? (
        <Forbidden what="the user directory (iam.user.read)" />
      ) : (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{result.data.totalItems} users in your reach</CardTitle>
              <CardDescription>Click a user to manage their roles.</CardDescription>
            </div>
            <form className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input name="search" defaultValue={search} placeholder="Search name, username, email" className="w-72 pl-8" />
            </form>
          </CardHeader>
          <CardContent>
            {result.data.items.length === 0 ? (
              <EmptyState>No users match.</EmptyState>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.data.items.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <Link href={`/app/admin/users/${u.id}`} className="flex items-center gap-3 hover:underline">
                          <Avatar className="size-8"><AvatarFallback>{u.displayName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                          <span>
                            <span className="block font-medium">{u.displayName}</span>
                            <span className="block text-xs text-muted-foreground">{u.username}</span>
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right"><StatusBadge status={u.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {result.data.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>Page {page + 1} of {result.data.totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild disabled={page === 0}><Link href={pageLink(Math.max(0, page - 1))}>Previous</Link></Button>
                  <Button variant="outline" size="sm" asChild disabled={page + 1 >= result.data.totalPages}><Link href={pageLink(page + 1)}>Next</Link></Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
