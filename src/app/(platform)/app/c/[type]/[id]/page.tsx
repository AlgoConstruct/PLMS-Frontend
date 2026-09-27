import { PageHeader } from "@/components/iam";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { platformApi } from "@/lib/platform";

export default async function ContextOverview({ params }: PageProps<"/app/c/[type]/[id]">) {
  const { type, id } = await params;
  const [details, caps] = await Promise.all([
    type === "workspace" ? platformApi<{ name: string; description: string | null; visibility: string }>(`/api/v1/workspaces/${id}`) : null,
    platformApi<{ capabilities: string[]; roles: string[] }>(`/api/v1/contexts/${type}/${id}/capabilities`),
  ]);
  const name = details && details.ok ? details.data.name : `${type} ${id.slice(0, 8)}`;
  return (
    <>
      <PageHeader title={name} description={details && details.ok ? details.data.description ?? undefined : undefined} />
      <Card>
        <CardHeader>
          <CardTitle>Your capabilities here</CardTitle>
          <CardDescription>Membership, inherited roles, organization scope and visibility combined</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {caps.ok && caps.data.capabilities.map((c) => <Badge key={c} variant="outline" className="font-mono">{c}</Badge>)}
        </CardContent>
      </Card>
    </>
  );
}
