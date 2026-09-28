import { Badge } from "@pathwayiq/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { platformApi } from "@pathwayiq/api/platform";

export async function CapabilitiesCard({ type, id }: { type: string; id: string }) {
  const caps = await platformApi<{ capabilities: string[]; roles: string[] }>(`/api/v1/contexts/${type}/${id}/capabilities`);
  if (!caps.ok) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your capabilities here</CardTitle>
        <CardDescription>
          {caps.data.roles.length > 0 ? `Roles: ${caps.data.roles.join(", ")}` : "No direct role"} · membership, inherited roles,
          organization scope and visibility combined
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        {caps.data.capabilities.map((c) => <Badge key={c} variant="outline" className="font-mono">{c}</Badge>)}
      </CardContent>
    </Card>
  );
}
